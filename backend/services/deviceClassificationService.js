const fs = require('fs/promises');
const logger = require('../utils/logger');
const {
  logSumExp,
  stableSoftmax,
  normalizedShannonEntropy,
  getUncertaintyLabel,
} = require('../utils/probabilityMath');

/**
 * Strict closed-set classification prompt for first-token probability extraction.
 */
const CLASSIFIER_PROMPT = `You are performing closed-set device classification.

Inspect all supplied images and classify the PRIMARY physical device.

Return exactly ONE uppercase character and nothing else.

A = Computer Mouse
B = USB Flash Drive / Pen Drive
C = Other

Rules:
- Mouse includes wired, wireless, optical and gaming mice.
- USB flash drive includes pen drive, thumb drive and USB memory stick.
- USB cable, USB charger, keyboard, phone, laptop, adapter, mouse pad etc. are C.
- If multiple unrelated devices are visible and there is no clear primary subject, return C.
- If the image is too ambiguous to identify reliably, return C.
- Do not explain your answer.
- Do not return JSON.
- Do not add punctuation.`;

const CLASS_MAPPING = {
  A: 'mouse',
  B: 'pendrive',
  C: 'other',
};

const CLASS_DESCRIPTIONS = {
  A: 'Computer Mouse',
  B: 'USB Flash Drive',
  C: 'Other',
};

let aiClient = null;

function getAiClient() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing.');
    }
    const { GoogleGenAI } = require('@google/genai');
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return aiClient;
}

/**
 * Finds the decoding step index that corresponds to the first meaningful class output (A, B, or C).
 *
 * @param {object} logprobsResult - The logprobsResult object from Gemini candidates.
 * @returns {number} The 0-based decoding step index, or -1 if not found.
 */
function findClassDecodingStep(logprobsResult) {
  if (
    !logprobsResult ||
    !Array.isArray(logprobsResult.topCandidates) ||
    logprobsResult.topCandidates.length === 0
  ) {
    return -1;
  }

  const validClasses = new Set(['A', 'B', 'C']);

  for (let step = 0; step < logprobsResult.topCandidates.length; step++) {
    const stepData = logprobsResult.topCandidates[step];
    const candidates = stepData?.candidates || [];

    const hasClassCandidate = candidates.some(c => {
      const normalized = String(c.token || '').trim().toUpperCase();
      return validClasses.has(normalized);
    });

    if (hasClassCandidate) {
      return step;
    }
  }

  return -1;
}

/**
 * Extracts and combines competing log scores for classes A, B, and C at a given decoding step.
 * If multiple candidate tokens normalize to the same class (e.g. "A" and " A"), their probability mass
 * is combined using logSumExp.
 *
 * If any of A, B, or C is missing from the returned candidates, returns success: false.
 * NEVER fabricates an arbitrary floor score for missing tokens.
 *
 * @param {Array<{token: string, logProbability: number}>} candidates - Candidate tokens at the step.
 * @returns {{success: boolean, logScores?: Record<string, number>, missingClasses?: string[], reason?: string}}
 */
function extractClassLogScores(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return {
      success: false,
      reason: 'NO_CANDIDATES_AT_STEP',
    };
  }

  const validClasses = ['A', 'B', 'C'];
  const classScores = { A: [], B: [], C: [] };

  for (const cand of candidates) {
    const normalized = String(cand.token || '').trim().toUpperCase();
    if (validClasses.includes(normalized) && typeof cand.logProbability === 'number') {
      classScores[normalized].push(cand.logProbability);
    }
  }

  const missingClasses = validClasses.filter(c => classScores[c].length === 0);
  if (missingClasses.length > 0) {
    return {
      success: false,
      reason: 'MISSING_CLASS_LOGPROB',
      missingClasses,
    };
  }

  const combinedLogScores = {
    A: logSumExp(classScores.A),
    B: logSumExp(classScores.B),
    C: logSumExp(classScores.C),
  };

  return {
    success: true,
    logScores: combinedLogScores,
  };
}

/**
 * Processes logprobsResult and builds the Phase-1 uncalibrated device classification result.
 *
 * @param {object} logprobsResult - Raw logprobsResult from Gemini candidate.
 * @param {string} rawText - Raw text returned by Gemini.
 * @param {string} classifierModel - Exact model string used.
 * @param {boolean} modelStableForCalibration - Whether a fixed pinned model identifier was used.
 * @returns {object} Standardized deviceClassification result object.
 */
function processClassificationLogprobs(
  logprobsResult,
  rawText,
  classifierModel,
  modelStableForCalibration,
) {
  const chosenTokenRaw = String(rawText || '').trim();
  const normalizedChosenToken = chosenTokenRaw.toUpperCase().charAt(0);
  const predictedClassFromToken = CLASS_MAPPING[normalizedChosenToken] || 'other';

  const stepIndex = findClassDecodingStep(logprobsResult);
  if (stepIndex === -1) {
    return {
      predictedClass: predictedClassFromToken,
      predictedToken: normalizedChosenToken || null,
      confidenceAvailable: false,
      calibrated: false,
      reason: 'NO_CLASS_TOKEN_FOUND_IN_LOGPROBS',
      classifierModel,
      modelStableForCalibration,
      method: 'Gemini token log-probabilities',
      classes: CLASS_DESCRIPTIONS,
    };
  }

  const stepCandidates = logprobsResult.topCandidates[stepIndex]?.candidates || [];
  const scoreResult = extractClassLogScores(stepCandidates);

  if (!scoreResult.success) {
    return {
      predictedClass: predictedClassFromToken,
      predictedToken: normalizedChosenToken || null,
      confidenceAvailable: false,
      calibrated: false,
      reason: scoreResult.reason || 'MISSING_CLASS_LOGPROB',
      missingClasses: scoreResult.missingClasses || [],
      classifierModel,
      modelStableForCalibration,
      method: 'Gemini token log-probabilities',
      classes: CLASS_DESCRIPTIONS,
    };
  }

  // Softmax normalization over competing classes A, B, and C
  const normalizedScores = stableSoftmax(scoreResult.logScores);

  const probabilities = {
    mouse: normalizedScores.A ?? 0,
    pendrive: normalizedScores.B ?? 0,
    other: normalizedScores.C ?? 0,
  };

  // Determine top class by highest probability mass
  let maxProb = -1;
  let topClassKey = 'C';

  for (const tokenKey of ['A', 'B', 'C']) {
    const classKey = CLASS_MAPPING[tokenKey];
    if (probabilities[classKey] > maxProb) {
      maxProb = probabilities[classKey];
      topClassKey = tokenKey;
    }
  }

  const predictedClass = CLASS_MAPPING[topClassKey];
  const entropy = normalizedShannonEntropy(probabilities, 3);
  const uncertaintyLabel = getUncertaintyLabel(entropy);

  return {
    predictedClass,
    predictedToken: topClassKey,
    probabilities,
    rawClassProbability: maxProb,
    normalizedEntropy: Number(entropy.toFixed(4)),
    uncertaintyLabel,
    confidenceAvailable: true,
    calibrated: false,
    temperature: null,
    classifierModel,
    modelStableForCalibration,
    decodingStep: stepIndex,
    method: 'Gemini token log-probabilities',
    classes: CLASS_DESCRIPTIONS,
  };
}

/**
 * Performs closed-set device classification using token log-probabilities.
 *
 * @param {Array<{path: string, mimeType: string}>} imageFiles - Array of image file objects.
 * @param {object} [options] - Optional override settings.
 * @returns {Promise<object>} Standardized deviceClassification result object.
 */
async function classifyDevice(imageFiles, options = {}) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return {
      predictedClass: null,
      confidenceAvailable: false,
      calibrated: false,
      reason: 'NO_IMAGES_PROVIDED',
      classifierModel: null,
      modelStableForCalibration: false,
    };
  }

  const explicitModel = process.env.GEMINI_CLASSIFIER_MODEL;
  const fallbackModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const classifierModel = explicitModel || fallbackModel;
  const modelStableForCalibration = Boolean(explicitModel);

  if (!modelStableForCalibration) {
    logger.warn(
      `[DeviceClassifier] GEMINI_CLASSIFIER_MODEL is not set. Falling back to "${classifierModel}". Mark: modelStableForCalibration=false.`,
    );
  }

  try {
    const ai = getAiClient();

    const parts = [
      {
        text: CLASSIFIER_PROMPT,
      },
    ];

    const buffers = await Promise.all(
      imageFiles.map(img => fs.readFile(img.path)),
    );

    buffers.forEach((buffer, index) => {
      parts.push({
        inlineData: {
          mimeType: imageFiles[index].mimeType,
          data: buffer.toString('base64'),
        },
      });
    });

    logger.info(
      `[DeviceClassifier] Requesting classification (model=${classifierModel}, temperature=1.0, logprobs=20)...`,
    );

    const response = await ai.models.generateContent({
      model: classifierModel,
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        temperature: 1.0,
        maxOutputTokens: 32,
        responseLogprobs: true,
        logprobs: 20,
      },
    });

    const rawText = response.text || '';
    const candidate = response.candidates?.[0];
    const logprobsResult = candidate?.logprobsResult;

    const result = processClassificationLogprobs(
      logprobsResult,
      rawText,
      classifierModel,
      modelStableForCalibration,
    );

    // Development-safe sanitised log summary (no base64 data, no secrets)
    logger.info(
      `[DeviceClassifier] Output: token=${result.predictedToken} class=${result.predictedClass} prob=${result.rawClassProbability !== undefined ? result.rawClassProbability.toFixed(4) : 'N/A'} entropy=${result.normalizedEntropy !== undefined ? result.normalizedEntropy : 'N/A'} confidenceAvailable=${result.confidenceAvailable}`,
    );

    return result;
  } catch (err) {
    logger.error('[DeviceClassifier] Execution error:', err.message || err);

    return {
      predictedClass: null,
      predictedToken: null,
      confidenceAvailable: false,
      calibrated: false,
      reason: `API_ERROR: ${err.message || 'Unknown error'}`,
      classifierModel,
      modelStableForCalibration,
      method: 'Gemini token log-probabilities',
      classes: CLASS_DESCRIPTIONS,
    };
  }
}

module.exports = {
  CLASSIFIER_PROMPT,
  CLASS_MAPPING,
  CLASS_DESCRIPTIONS,
  findClassDecodingStep,
  extractClassLogScores,
  processClassificationLogprobs,
  classifyDevice,
};
