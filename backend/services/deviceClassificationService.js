const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config/config');
const {
  logSumExp,
  stableSoftmax,
  normalizedShannonEntropy,
  getUncertaintyLabel,
} = require('../utils/probabilityMath');
const {
  scaleLogScores,
  validateCalibrationArtifact,
} = require('../utils/temperatureCalibration');

const CLASSIFIER_CONFIG_VERSION = 'device-abc-v1';

const CLASS_MAPPING = {
  A: 'mouse',
  B: 'pendrive',
  C: 'other',
};

const TOKEN_MAPPING = {
  mouse: 'A',
  pendrive: 'B',
  other: 'C',
};

const CLASS_DESCRIPTIONS = {
  A: 'Computer Mouse',
  B: 'USB Flash Drive',
  C: 'Other',
};

const DEFAULT_CALIBRATION_PATH = path.join(
  __dirname,
  '../calibration/device-classifier/calibration.json',
);

/**
 * Returns the frozen classifier configuration descriptor for compatibility verification.
 *
 * @param {string} [model='MobileNetV2'] - The model identifier.
 * @returns {object} Classifier configuration object.
 */
function getClassifierConfig(model = 'MobileNetV2') {
  return {
    version: CLASSIFIER_CONFIG_VERSION,
    model,
    classes: ['mouse', 'pendrive', 'other'],
    classMapping: CLASS_MAPPING,
    artifactReference: 'device_classifier.pth',
    preprocessing: {
      imageFormat: 'RGB',
      inputSize: [224, 224],
      normalization: {
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
      },
      alphaCompositing: 'solid_white_background',
    },
  };
}

/**
 * Safely loads a calibration artifact from disk if present.
 *
 * @param {string} [customPath] - Optional custom path.
 * @returns {object|null} The parsed calibration artifact, or null if absent/invalid.
 */
function loadCalibrationArtifact(customPath) {
  const artifactPath = customPath || DEFAULT_CALIBRATION_PATH;
  if (!fsSync.existsSync(artifactPath)) {
    return null;
  }

  try {
    const content = fsSync.readFileSync(artifactPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    logger.warn(`[DeviceClassifier] Failed to parse calibration artifact at ${artifactPath}: ${err.message}`);
    return null;
  }
}

/**
 * Processes raw class log scores from the local classifier and applies optional temperature scaling.
 *
 * @param {Record<string, number>} classLogScores - Pre-softmax logits map { mouse, pendrive, other }.
 * @param {string} classifierModel - Model identifier string.
 * @param {object|null} [calibrationArtifact=null] - Optional calibration artifact.
 * @returns {object} Standardized deviceClassification result object.
 */
function processLocalClassificationLogits(
  classLogScores,
  classifierModel = 'MobileNetV2',
  calibrationArtifact = null,
) {
  if (
    !classLogScores ||
    typeof classLogScores.mouse !== 'number' ||
    typeof classLogScores.pendrive !== 'number' ||
    typeof classLogScores.other !== 'number'
  ) {
    return {
      predictedClass: null,
      predictedToken: null,
      confidenceAvailable: false,
      calibrated: false,
      temperature: null,
      reason: 'INVALID_LOCAL_LOGITS',
      classifierModel,
      method: 'Local MobileNetV2 classifier',
      classes: CLASS_DESCRIPTIONS,
    };
  }

  // Raw uncalibrated probabilities (T = 1.0)
  const rawProbabilities = stableSoftmax(classLogScores);

  let maxRawProb = -1;
  let topRawClass = 'other';
  for (const cls of ['mouse', 'pendrive', 'other']) {
    if (rawProbabilities[cls] > maxRawProb) {
      maxRawProb = rawProbabilities[cls];
      topRawClass = cls;
    }
  }

  const currentConfig = getClassifierConfig(classifierModel);
  let isCalibrated = false;
  let calibrationReason = null;
  let temperature = null;
  let activeProbabilities = rawProbabilities;
  let activeTopConfidence = maxRawProb;
  let activePredictedClass = topRawClass;

  if (calibrationArtifact) {
    const validation = validateCalibrationArtifact(calibrationArtifact, currentConfig);
    if (validation.compatible) {
      isCalibrated = true;
      temperature = calibrationArtifact.temperature;

      const scaledProbs = scaleLogScores(classLogScores, temperature);
      activeProbabilities = {
        mouse: scaledProbs.mouse ?? 0,
        pendrive: scaledProbs.pendrive ?? 0,
        other: scaledProbs.other ?? 0,
      };

      let maxCalProb = -1;
      let topCalClass = 'other';
      for (const cls of ['mouse', 'pendrive', 'other']) {
        if (activeProbabilities[cls] > maxCalProb) {
          maxCalProb = activeProbabilities[cls];
          topCalClass = cls;
        }
      }

      activeTopConfidence = maxCalProb;
      activePredictedClass = topCalClass;
    } else {
      calibrationReason = validation.reason || 'CALIBRATION_CONFIG_MISMATCH';
    }
  }

  const entropy = normalizedShannonEntropy(activeProbabilities, 3);
  const uncertaintyLabel = getUncertaintyLabel(entropy);
  const predictedToken = TOKEN_MAPPING[activePredictedClass] || 'C';

  const result = {
    predictedClass: activePredictedClass,
    predictedToken,
    classLogScores,
    rawProbabilities,
    rawClassProbability: Number(maxRawProb.toFixed(4)),
    probabilities: activeProbabilities,
    normalizedEntropy: Number(entropy.toFixed(4)),
    uncertaintyLabel,
    confidenceAvailable: true,
    calibrated: isCalibrated,
    temperature,
    classifierModel,
    modelStableForCalibration: true,
    method: isCalibrated
      ? 'Local MobileNetV2 classifier + temperature scaling'
      : 'Local MobileNetV2 classifier',
    classes: CLASS_DESCRIPTIONS,
  };

  if (isCalibrated) {
    result.calibratedConfidence = Number(activeTopConfidence.toFixed(4));
  }

  if (calibrationReason) {
    result.calibrationReason = calibrationReason;
  }

  return result;
}

/**
 * Finds the decoding step index that corresponds to the first meaningful class output (A, B, or C).
 */
function findClassDecodingStep(logprobsResult) {
  if (!logprobsResult || !Array.isArray(logprobsResult.topCandidates)) return -1;
  const validClasses = new Set(['A', 'B', 'C']);
  for (let step = 0; step < logprobsResult.topCandidates.length; step++) {
    const candidates = logprobsResult.topCandidates[step]?.candidates || [];
    if (candidates.some(c => validClasses.has(String(c.token || '').trim().toUpperCase()))) {
      return step;
    }
  }
  return -1;
}

/**
 * Extracts and combines competing log scores for classes A, B, and C at a given decoding step.
 */
function extractClassLogScores(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return { success: false, reason: 'NO_CANDIDATES_AT_STEP' };
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
    return { success: false, reason: 'MISSING_CLASS_LOGPROB', missingClasses };
  }
  return {
    success: true,
    logScores: {
      A: logSumExp(classScores.A),
      B: logSumExp(classScores.B),
      C: logSumExp(classScores.C),
    },
  };
}

/**
 * Backward-compatibility wrapper for token logprob tests.
 */
function processClassificationLogprobs(logprobsResult, rawText, model, stable, artifact) {
  const chosenTokenRaw = String(rawText || '').trim();
  const normalizedChosenToken = chosenTokenRaw.toUpperCase().charAt(0);
  const predictedClassFromToken = CLASS_MAPPING[normalizedChosenToken] || 'other';

  if (!logprobsResult || !logprobsResult.topCandidates) {
    return {
      predictedClass: predictedClassFromToken,
      predictedToken: normalizedChosenToken || null,
      confidenceAvailable: false,
      calibrated: false,
      reason: 'NO_CLASS_TOKEN_FOUND_IN_LOGPROBS',
      classifierModel: model,
      classes: CLASS_DESCRIPTIONS,
    };
  }

  const stepIndex = findClassDecodingStep(logprobsResult);
  if (stepIndex === -1) {
    return {
      predictedClass: predictedClassFromToken,
      predictedToken: normalizedChosenToken || null,
      confidenceAvailable: false,
      calibrated: false,
      reason: 'NO_CLASS_TOKEN_FOUND_IN_LOGPROBS',
      classifierModel: model,
      classes: CLASS_DESCRIPTIONS,
    };
  }

  const candidates = logprobsResult.topCandidates[stepIndex]?.candidates || [];
  const scoreResult = extractClassLogScores(candidates);

  if (!scoreResult.success) {
    return {
      predictedClass: predictedClassFromToken,
      predictedToken: normalizedChosenToken || null,
      confidenceAvailable: false,
      calibrated: false,
      reason: scoreResult.reason || 'MISSING_CLASS_LOGPROB',
      missingClasses: scoreResult.missingClasses || [],
      classifierModel: model,
      classes: CLASS_DESCRIPTIONS,
    };
  }

  const classLogScores = {
    mouse: scoreResult.logScores.A,
    pendrive: scoreResult.logScores.B,
    other: scoreResult.logScores.C,
  };

  return processLocalClassificationLogits(classLogScores, model, artifact);
}

/**
 * Performs closed-set device classification using the local MobileNetV2 classifier server.
 *
 * @param {Array<{path: string, mimeType: string}>} imageFiles - Array of image file objects.
 * @param {object} [options] - Optional override settings.
 * @returns {Promise<object>} Standardized deviceClassification result object.
 */
async function classifyDevice(imageFiles, options = {}) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return {
      predictedClass: null,
      predictedToken: null,
      confidenceAvailable: false,
      calibrated: false,
      temperature: null,
      reason: 'NO_IMAGES_PROVIDED',
      classifierModel: 'MobileNetV2',
      modelStableForCalibration: true,
      method: 'Local MobileNetV2 classifier',
      classes: CLASS_DESCRIPTIONS,
    };
  }

  const fastApiUrl = config.fastApiUrl || 'http://127.0.0.1:8000';
  const endpoint = `${fastApiUrl}/classify-device`;

  try {
    const FormData = require('form-data');
    const form = new FormData();

    for (const img of imageFiles) {
      const fileBuffer = await fs.readFile(img.path);
      const filename = path.basename(img.path);
      form.append('files', fileBuffer, {
        filename,
        contentType: img.mimeType || 'image/jpeg',
      });
    }

    logger.info(`[DeviceClassifier] Requesting local classification (${imageFiles.length} images) from ${endpoint}...`);

    const response = await axios.post(endpoint, form, {
      headers: form.getHeaders(),
      timeout: 5000,
    });

    if (response.data && response.data.confidenceAvailable && response.data.classLogScores) {
      const calibrationArtifact = options.calibrationArtifact !== undefined
        ? options.calibrationArtifact
        : loadCalibrationArtifact();

      return processLocalClassificationLogits(
        response.data.classLogScores,
        'MobileNetV2',
        calibrationArtifact,
      );
    } else {
      const reason = response.data?.reason || 'LOCAL_CLASSIFIER_NOT_READY';
      logger.warn(`[DeviceClassifier] Local classifier returned unavailable: ${reason}`);

      return {
        predictedClass: null,
        predictedToken: null,
        confidenceAvailable: false,
        calibrated: false,
        temperature: null,
        reason,
        classifierModel: 'MobileNetV2',
        modelStableForCalibration: true,
        method: 'Local MobileNetV2 classifier',
        classes: CLASS_DESCRIPTIONS,
      };
    }
  } catch (err) {
    logger.warn(`[DeviceClassifier] Local classifier endpoint error: ${err.message}`);

    return {
      predictedClass: null,
      predictedToken: null,
      confidenceAvailable: false,
      calibrated: false,
      temperature: null,
      reason: 'LOCAL_CLASSIFIER_NOT_READY',
      classifierModel: 'MobileNetV2',
      modelStableForCalibration: true,
      method: 'Local MobileNetV2 classifier',
      classes: CLASS_DESCRIPTIONS,
    };
  }
}

module.exports = {
  CLASSIFIER_CONFIG_VERSION,
  CLASS_MAPPING,
  TOKEN_MAPPING,
  CLASS_DESCRIPTIONS,
  getClassifierConfig,
  loadCalibrationArtifact,
  findClassDecodingStep,
  extractClassLogScores,
  processClassificationLogprobs,
  processLocalClassificationLogits,
  classifyDevice,
};
