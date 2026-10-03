/**
 * Pure mathematical helpers for statistical probability calculation,
 * stable softmax normalization, and Shannon entropy uncertainty estimation.
 */

/**
 * Numerically stable Log-Sum-Exp computation.
 * logSumExp(v) = max(v) + ln(sum(exp(v_i - max(v))))
 *
 * @param {number[]} values - Array of log probabilities or logits.
 * @returns {number} Combined log probability.
 */
function logSumExp(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return -Infinity;
  }

  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] === 'number' && !isNaN(values[i]) && values[i] > max) {
      max = values[i];
    }
  }

  if (max === -Infinity) {
    return -Infinity;
  }

  let sumExp = 0;
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] === 'number' && !isNaN(values[i])) {
      sumExp += Math.exp(values[i] - max);
    }
  }

  return max + Math.log(sumExp);
}

/**
 * Numerically stable Softmax computation over a dictionary of log scores.
 * p_i = exp(z_i - max(z)) / sum(exp(z_j - max(z)))
 *
 * @param {Record<string, number>} logScores - Map of class keys to log scores.
 * @returns {Record<string, number>} Normalized probability distribution.
 */
function stableSoftmax(logScores) {
  if (!logScores || typeof logScores !== 'object') {
    return {};
  }

  const keys = Object.keys(logScores);
  if (keys.length === 0) {
    return {};
  }

  let maxScore = -Infinity;
  for (const key of keys) {
    const val = logScores[key];
    if (typeof val === 'number' && !isNaN(val) && val > maxScore) {
      maxScore = val;
    }
  }

  if (maxScore === -Infinity) {
    const uniform = 1 / keys.length;
    const result = {};
    for (const key of keys) {
      result[key] = uniform;
    }
    return result;
  }

  let sumExp = 0;
  const expScores = {};
  for (const key of keys) {
    const val = logScores[key];
    if (typeof val === 'number' && !isNaN(val)) {
      const expVal = Math.exp(val - maxScore);
      expScores[key] = expVal;
      sumExp += expVal;
    } else {
      expScores[key] = 0;
    }
  }

  const probabilities = {};
  for (const key of keys) {
    probabilities[key] = sumExp > 0 ? expScores[key] / sumExp : 1 / keys.length;
  }

  return probabilities;
}

/**
 * Calculates raw Shannon Entropy:
 * H(p) = -sum(p_i * ln(p_i))
 *
 * @param {Record<string, number> | number[]} probabilities - Probability distribution.
 * @returns {number} Shannon Entropy in nats.
 */
function shannonEntropy(probabilities) {
  const values = Array.isArray(probabilities)
    ? probabilities
    : Object.values(probabilities || {});

  if (values.length === 0) {
    return 0;
  }

  let entropy = 0;
  for (const p of values) {
    if (typeof p === 'number' && p > 0) {
      entropy -= p * Math.log(p);
    }
  }

  return Math.max(0, entropy);
}

/**
 * Calculates Normalized Shannon Entropy in the range [0.0, 1.0].
 * H_norm(p) = H(p) / ln(K) where K is number of classes.
 *
 * - near 0.0: High certainty (probability mass concentrated on one class)
 * - near 1.0: Maximum uncertainty (probabilities distributed almost uniformly)
 *
 * @param {Record<string, number> | number[]} probabilities - Probability distribution.
 * @param {number} [numClasses=3] - Number of classes K.
 * @returns {number} Normalized entropy between 0.0 and 1.0.
 */
function normalizedShannonEntropy(probabilities, numClasses = 3) {
  if (numClasses <= 1) {
    return 0;
  }

  const rawEntropy = shannonEntropy(probabilities);
  const maxEntropy = Math.log(numClasses);

  if (maxEntropy <= 0) {
    return 0;
  }

  const normalized = rawEntropy / maxEntropy;
  return Math.min(1, Math.max(0, normalized));
}

/**
 * Maps normalized entropy to a UI presentation label.
 *
 * NOTE: These thresholds (< 0.35 Low, 0.35-0.70 Medium, >= 0.70 High)
 * are UI presentation boundaries, NOT an absolute statistical law.
 * The underlying continuous normalizedEntropy value is always preserved.
 *
 * @param {number} normalizedEntropy - Entropy value in [0, 1].
 * @returns {"Low" | "Medium" | "High"} Qualitative uncertainty level.
 */
function getUncertaintyLabel(normalizedEntropy) {
  if (typeof normalizedEntropy !== 'number' || isNaN(normalizedEntropy)) {
    return 'High';
  }

  if (normalizedEntropy < 0.35) {
    return 'Low';
  }
  if (normalizedEntropy < 0.7) {
    return 'Medium';
  }
  return 'High';
}

module.exports = {
  logSumExp,
  stableSoftmax,
  shannonEntropy,
  normalizedShannonEntropy,
  getUncertaintyLabel,
};
