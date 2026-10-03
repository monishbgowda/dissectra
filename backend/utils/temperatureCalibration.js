/**
 * Pure mathematical and statistical utilities for Temperature Scaling calibration,
 * loss functions (Multiclass NLL, Brier Score), and calibration metrics (ECE).
 */

const {
  stableSoftmax,
  normalizedShannonEntropy,
  getUncertaintyLabel,
} = require('./probabilityMath');

const DEFAULT_CLASSES = ['mouse', 'pendrive', 'other'];

/**
 * Applies temperature scaling to pre-softmax log scores.
 * p_i(T) = exp(z_i / T) / sum_j(exp(z_j / T))
 *
 * @param {Record<string, number>} classLogScores - Map of class keys to pre-softmax log scores.
 * @param {number} [temperature=1.0] - Temperature parameter T > 0.
 * @returns {Record<string, number>} Scaled probability distribution.
 */
function scaleLogScores(classLogScores, temperature = 1.0) {
  if (!classLogScores || typeof classLogScores !== 'object') {
    return {};
  }

  const T = typeof temperature === 'number' && temperature > 0 ? temperature : 1.0;
  const scaledScores = {};

  for (const [key, val] of Object.entries(classLogScores)) {
    if (typeof val === 'number' && !isNaN(val)) {
      scaledScores[key] = val / T;
    }
  }

  return stableSoftmax(scaledScores);
}

/**
 * Computes Multiclass Negative Log-Likelihood (NLL) for a single sample.
 * NLL = -log(p(y_true))
 *
 * @param {Record<string, number>} probabilities - Probability distribution.
 * @param {string} trueLabel - The ground truth class name.
 * @param {number} [eps=1e-15] - Small epsilon to prevent log(0).
 * @returns {number} Negative log-likelihood.
 */
function computeSampleNLL(probabilities, trueLabel, eps = 1e-15) {
  if (!probabilities || !trueLabel || typeof probabilities !== 'object') {
    return Infinity;
  }

  const pTrue = probabilities[trueLabel];
  if (typeof pTrue !== 'number' || isNaN(pTrue)) {
    return Infinity;
  }

  const clampedP = Math.max(eps, Math.min(1.0, pTrue));
  return -Math.log(clampedP);
}

/**
 * Computes Multiclass Brier Score for a single sample.
 * Brier = sum_k (p_k - y_k)^2 where y_k is 1 for true class, 0 otherwise.
 *
 * @param {Record<string, number>} probabilities - Probability distribution.
 * @param {string} trueLabel - The ground truth class name.
 * @param {string[]} [classes=DEFAULT_CLASSES] - List of class names.
 * @returns {number} Brier score (lower is better, range [0, 2]).
 */
function computeSampleBrier(probabilities, trueLabel, classes = DEFAULT_CLASSES) {
  if (!probabilities || !trueLabel || typeof probabilities !== 'object') {
    return 2.0;
  }

  let brier = 0;
  for (const cls of classes) {
    const p = typeof probabilities[cls] === 'number' ? probabilities[cls] : 0;
    const y = cls === trueLabel ? 1 : 0;
    brier += (p - y) * (p - y);
  }

  return brier;
}

/**
 * Computes Expected Calibration Error (ECE) and reliability diagram bins.
 * Partitions predictions into M equal-width confidence bins in [0, 1].
 *
 * ECE = sum_m (|B_m| / N) * |acc(B_m) - conf(B_m)|
 *
 * @param {Array<{probabilities: Record<string, number>, trueLabel: string}>} samples - Evaluated samples.
 * @param {number} [numBins=5] - Number of bins (default 5 for small prototype datasets).
 * @returns {{ece: number, bins: Array<{binIndex: number, lowerBound: number, upperBound: number, count: number, meanConfidence: number, accuracy: number}>}}
 */
function computeECE(samples, numBins = 5) {
  if (!Array.isArray(samples) || samples.length === 0 || numBins <= 0) {
    return { ece: 0, bins: [] };
  }

  const binWidth = 1.0 / numBins;
  const bins = Array.from({ length: numBins }, (_, idx) => ({
    binIndex: idx,
    lowerBound: Number((idx * binWidth).toFixed(4)),
    upperBound: Number(((idx + 1) * binWidth).toFixed(4)),
    count: 0,
    confidenceSum: 0,
    correctCount: 0,
  }));

  let totalValid = 0;

  for (const sample of samples) {
    if (!sample.probabilities || !sample.trueLabel) continue;

    // Determine predicted class and confidence (max prob)
    let maxProb = -1;
    let predClass = null;

    for (const [cls, prob] of Object.entries(sample.probabilities)) {
      if (typeof prob === 'number' && prob > maxProb) {
        maxProb = prob;
        predClass = cls;
      }
    }

    if (maxProb < 0) continue;

    totalValid++;
    const isCorrect = predClass === sample.trueLabel ? 1 : 0;

    // Assign to bin (clamped to last bin if confidence is 1.0)
    let binIdx = Math.floor(maxProb / binWidth);
    if (binIdx >= numBins) {
      binIdx = numBins - 1;
    }

    bins[binIdx].count += 1;
    bins[binIdx].confidenceSum += maxProb;
    bins[binIdx].correctCount += isCorrect;
  }

  if (totalValid === 0) {
    return { ece: 0, bins: [] };
  }

  let weightedEceSum = 0;
  const reliabilityBins = bins.map(b => {
    const meanConfidence = b.count > 0 ? b.confidenceSum / b.count : 0;
    const accuracy = b.count > 0 ? b.correctCount / b.count : 0;

    if (b.count > 0) {
      weightedEceSum += (b.count / totalValid) * Math.abs(accuracy - meanConfidence);
    }

    return {
      binIndex: b.binIndex,
      lowerBound: b.lowerBound,
      upperBound: b.upperBound,
      count: b.count,
      meanConfidence: Number(meanConfidence.toFixed(4)),
      accuracy: Number(accuracy.toFixed(4)),
    };
  });

  return {
    ece: Number(weightedEceSum.toFixed(4)),
    bins: reliabilityBins,
  };
}

/**
 * Computes full evaluation metrics (Accuracy, NLL, Brier Score, ECE) for a dataset at a given temperature.
 *
 * @param {Array<{classLogScores: Record<string, number>, trueLabel: string}>} samples - Samples with pre-softmax log scores.
 * @param {number} [temperature=1.0] - Temperature T to apply.
 * @param {string[]} [classes=DEFAULT_CLASSES] - Class labels.
 * @param {number} [numBins=5] - Number of bins for ECE.
 * @returns {{temperature: number, sampleCount: number, accuracy: number, nll: number, brierScore: number, ece: number, reliabilityBins: Array<object>}}
 */
function computeDatasetMetrics(
  samples,
  temperature = 1.0,
  classes = DEFAULT_CLASSES,
  numBins = 5,
) {
  if (!Array.isArray(samples) || samples.length === 0) {
    return {
      temperature,
      sampleCount: 0,
      accuracy: 0,
      nll: 0,
      brierScore: 0,
      ece: 0,
      reliabilityBins: [],
    };
  }

  let totalNLL = 0;
  let totalBrier = 0;
  let correctCount = 0;
  let validCount = 0;

  const evaluatedSamples = [];

  for (const sample of samples) {
    if (!sample.classLogScores || !sample.trueLabel) continue;

    const probs = scaleLogScores(sample.classLogScores, temperature);

    let maxProb = -1;
    let predClass = null;
    for (const [cls, prob] of Object.entries(probs)) {
      if (prob > maxProb) {
        maxProb = prob;
        predClass = cls;
      }
    }

    const isCorrect = predClass === sample.trueLabel;
    if (isCorrect) correctCount++;

    const nll = computeSampleNLL(probs, sample.trueLabel);
    const brier = computeSampleBrier(probs, sample.trueLabel, classes);

    totalNLL += nll;
    totalBrier += brier;
    validCount++;

    evaluatedSamples.push({
      probabilities: probs,
      trueLabel: sample.trueLabel,
      predictedClass: predClass,
      confidence: maxProb,
    });
  }

  if (validCount === 0) {
    return {
      temperature,
      sampleCount: 0,
      accuracy: 0,
      nll: 0,
      brierScore: 0,
      ece: 0,
      reliabilityBins: [],
    };
  }

  const accuracy = correctCount / validCount;
  const meanNLL = totalNLL / validCount;
  const meanBrier = totalBrier / validCount;
  const { ece, bins } = computeECE(evaluatedSamples, numBins);

  return {
    temperature: Number(temperature.toFixed(4)),
    sampleCount: validCount,
    accuracy: Number(accuracy.toFixed(4)),
    nll: Number(meanNLL.toFixed(5)),
    brierScore: Number(meanBrier.toFixed(5)),
    ece,
    reliabilityBins: bins,
  };
}

/**
 * Objective function: Computes average Multiclass Negative Log-Likelihood at temperature T.
 *
 * @param {number} T - Temperature scalar.
 * @param {Array<{classLogScores: Record<string, number>, trueLabel: string}>} calibrationSamples - Samples.
 * @returns {number} Mean NLL at temperature T.
 */
function objectiveNLL(T, calibrationSamples) {
  if (T <= 0 || !Array.isArray(calibrationSamples) || calibrationSamples.length === 0) {
    return Infinity;
  }

  let sumNLL = 0;
  for (const sample of calibrationSamples) {
    const probs = scaleLogScores(sample.classLogScores, T);
    sumNLL += computeSampleNLL(probs, sample.trueLabel);
  }

  return sumNLL / calibrationSamples.length;
}

/**
 * Fits a single positive temperature scalar T on calibration samples using
 * 1D optimization (coarse log-space search followed by golden-section search refinement).
 *
 * Objective: Minimize Multiclass NLL on calibration split.
 *
 * @param {Array<{classLogScores: Record<string, number>, trueLabel: string}>} calibrationSamples - Training samples.
 * @param {object} [options] - Optimization bounds and precision.
 * @param {number} [options.minT=0.05] - Lower bound for T.
 * @param {number} [options.maxT=10.0] - Upper bound for T.
 * @param {number} [options.gridSteps=50] - Number of coarse log-grid points.
 * @param {number} [options.maxIterations=40] - Max iterations for golden-section refinement.
 * @param {number} [options.tol=1e-5] - Tolerance threshold.
 * @returns {{temperature: number, initialNLL: number, optimizedNLL: number, iterations: number}}
 */
function fitTemperature(calibrationSamples, options = {}) {
  const {
    minT = 0.05,
    maxT = 10.0,
    gridSteps = 50,
    maxIterations = 40,
    tol = 1e-5,
  } = options;

  if (!Array.isArray(calibrationSamples) || calibrationSamples.length === 0) {
    throw new Error('Cannot fit temperature: No calibration samples provided.');
  }

  const initialNLL = objectiveNLL(1.0, calibrationSamples);

  // Step 1: Coarse log-spaced grid search
  const logMin = Math.log(minT);
  const logMax = Math.log(maxT);
  const logStep = (logMax - logMin) / (gridSteps - 1);

  let bestLogT = 0; // corresponds to T = 1.0
  let bestNLL = initialNLL;

  for (let i = 0; i < gridSteps; i++) {
    const currentLogT = logMin + i * logStep;
    const currentT = Math.exp(currentLogT);
    const nll = objectiveNLL(currentT, calibrationSamples);

    if (nll < bestNLL) {
      bestNLL = nll;
      bestLogT = currentLogT;
    }
  }

  // Step 2: Bracket refinement around bestLogT
  let a = Math.max(logMin, bestLogT - logStep);
  let b = Math.min(logMax, bestLogT + logStep);

  // Step 3: Golden-section search on log(T)
  const phi = (1 + Math.sqrt(5)) / 2;
  const resphi = 2 - phi;

  let c = a + resphi * (b - a);
  let d = b - resphi * (b - a);

  let fc = objectiveNLL(Math.exp(c), calibrationSamples);
  let fd = objectiveNLL(Math.exp(d), calibrationSamples);

  let iter = 0;
  while (Math.abs(b - a) > tol && iter < maxIterations) {
    iter++;
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = a + resphi * (b - a);
      fc = objectiveNLL(Math.exp(c), calibrationSamples);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = b - resphi * (b - a);
      fd = objectiveNLL(Math.exp(d), calibrationSamples);
    }
  }

  const optimalLogT = (a + b) / 2;
  const optimalT = Math.exp(optimalLogT);
  const optimizedNLL = objectiveNLL(optimalT, calibrationSamples);

  return {
    temperature: Number(optimalT.toFixed(4)),
    initialNLL: Number(initialNLL.toFixed(5)),
    optimizedNLL: Number(optimizedNLL.toFixed(5)),
    iterations: iter + gridSteps,
  };
}

/**
 * Validates whether a loaded calibration artifact is strictly compatible with current classifier configuration.
 *
 * @param {object} artifact - Parsed calibration.json artifact.
 * @param {object} currentConfig - Current frozen classifier configuration.
 * @returns {{compatible: boolean, reason?: string}}
 */
function validateCalibrationArtifact(artifact, currentConfig) {
  if (!artifact || typeof artifact !== 'object') {
    return { compatible: false, reason: 'ARTIFACT_MISSING_OR_INVALID' };
  }

  if (artifact.method !== 'temperature_scaling') {
    return { compatible: false, reason: 'INCOMPATIBLE_METHOD' };
  }

  if (typeof artifact.temperature !== 'number' || artifact.temperature <= 0 || isNaN(artifact.temperature)) {
    return { compatible: false, reason: 'INVALID_TEMPERATURE_VALUE' };
  }

  if (artifact.classifierConfigVersion !== currentConfig.version) {
    return {
      compatible: false,
      reason: `CONFIG_VERSION_MISMATCH (artifact: ${artifact.classifierConfigVersion}, current: ${currentConfig.version})`,
    };
  }

  if (artifact.classifierModel !== currentConfig.model) {
    return {
      compatible: false,
      reason: `MODEL_MISMATCH (artifact: ${artifact.classifierModel}, current: ${currentConfig.model})`,
    };
  }

  // Verify class definitions match
  const artifactClasses = Array.isArray(artifact.classes) ? artifact.classes.slice().sort() : [];
  const currentClasses = Array.isArray(currentConfig.classes) ? currentConfig.classes.slice().sort() : [];
  if (JSON.stringify(artifactClasses) !== JSON.stringify(currentClasses)) {
    return { compatible: false, reason: 'CLASSES_MISMATCH' };
  }

  return { compatible: true };
}

module.exports = {
  DEFAULT_CLASSES,
  scaleLogScores,
  computeSampleNLL,
  computeSampleBrier,
  computeECE,
  computeDatasetMetrics,
  objectiveNLL,
  fitTemperature,
  validateCalibrationArtifact,
};
