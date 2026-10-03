const {
  scaleLogScores,
  computeSampleNLL,
  computeSampleBrier,
  computeECE,
  computeDatasetMetrics,
  fitTemperature,
  validateCalibrationArtifact,
} = require('../utils/temperatureCalibration');

const {
  stableSoftmax,
} = require('../utils/probabilityMath');

const {
  CLASSIFIER_CONFIG_VERSION,
  getClassifierConfig,
  processClassificationLogprobs,
} = require('../services/deviceClassificationService');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertApprox(actual, expected, tolerance = 1e-4, message) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passedTests++;
    console.log(`  ✓ PASS: ${message} (got ${actual.toFixed(5)}, expected ~${expected.toFixed(5)})`);
  } else {
    console.error(`  ✗ FAIL: ${message} (got ${actual}, expected ${expected}, diff ${diff})`);
  }
}

console.log('\n======================================================');
console.log('TEST SUITE: Temperature Calibration & Scaling (Phase 2)');
console.log('======================================================\n');

// -----------------------------------------------------------
// 1. T = 1.0 Identity Property
// -----------------------------------------------------------
console.log('[1] Testing T = 1.0 Identity Property:');
const testScores = { mouse: -0.15, pendrive: -2.80, other: -3.50 };
const rawProbs = stableSoftmax(testScores);
const scaledProbsT1 = scaleLogScores(testScores, 1.0);

assertApprox(scaledProbsT1.mouse, rawProbs.mouse, 1e-6, 'T = 1.0 matches raw softmax for mouse');
assertApprox(scaledProbsT1.pendrive, rawProbs.pendrive, 1e-6, 'T = 1.0 matches raw softmax for pendrive');
assertApprox(scaledProbsT1.other, rawProbs.other, 1e-6, 'T = 1.0 matches raw softmax for other');

// -----------------------------------------------------------
// 2. T > 1.0 Softening Behavior
// -----------------------------------------------------------
console.log('\n[2] Testing T > 1.0 Softening Property:');
const scaledProbsT2 = scaleLogScores(testScores, 2.0);
assert(
  scaledProbsT2.mouse < rawProbs.mouse,
  `T = 2.0 softens top probability (raw: ${rawProbs.mouse.toFixed(4)} -> scaled: ${scaledProbsT2.mouse.toFixed(4)})`,
);
assert(
  scaledProbsT2.pendrive > rawProbs.pendrive,
  `T = 2.0 increases lower class pendrive probability (${rawProbs.pendrive.toFixed(4)} -> ${scaledProbsT2.pendrive.toFixed(4)})`,
);
assert(
  scaledProbsT2.other > rawProbs.other,
  `T = 2.0 increases lower class other probability (${rawProbs.other.toFixed(4)} -> ${scaledProbsT2.other.toFixed(4)})`,
);
assertApprox(
  scaledProbsT2.mouse + scaledProbsT2.pendrive + scaledProbsT2.other,
  1.0,
  1e-6,
  'Scaled probabilities sum to 1.0',
);

// -----------------------------------------------------------
// 3. 0 < T < 1.0 Sharpening Behavior
// -----------------------------------------------------------
console.log('\n[3] Testing 0 < T < 1.0 Sharpening Property:');
const scaledProbsT05 = scaleLogScores(testScores, 0.5);
assert(
  scaledProbsT05.mouse > rawProbs.mouse,
  `T = 0.5 sharpens top probability (raw: ${rawProbs.mouse.toFixed(4)} -> scaled: ${scaledProbsT05.mouse.toFixed(4)})`,
);
assert(
  scaledProbsT05.pendrive < rawProbs.pendrive,
  `T = 0.5 suppresses lower class pendrive probability`,
);
assertApprox(
  scaledProbsT05.mouse + scaledProbsT05.pendrive + scaledProbsT05.other,
  1.0,
  1e-6,
  'Sharpened probabilities sum to 1.0',
);

// -----------------------------------------------------------
// 4. Argmax Invariance Under Temperature Scaling
// -----------------------------------------------------------
console.log('\n[4] Testing Argmax Preservation for all T > 0:');
for (const temp of [0.1, 0.5, 1.0, 1.5, 2.5, 5.0, 10.0]) {
  const scaled = scaleLogScores(testScores, temp);
  const topKey = Object.keys(scaled).reduce((a, b) => (scaled[a] > scaled[b] ? a : b));
  assert(topKey === 'mouse', `Argmax is preserved as "mouse" at T = ${temp}`);
}

// -----------------------------------------------------------
// 5. Multiclass Negative Log-Likelihood (NLL) Tests
// -----------------------------------------------------------
console.log('\n[5] Testing Multiclass Negative Log-Likelihood:');
const highConfCorrect = { mouse: 0.95, pendrive: 0.03, other: 0.02 };
const nllCorrect = computeSampleNLL(highConfCorrect, 'mouse');
assert(nllCorrect < 0.1, `Correct high-confidence prediction has low NLL (${nllCorrect.toFixed(4)})`);

const highConfIncorrect = { mouse: 0.95, pendrive: 0.03, other: 0.02 };
const nllIncorrect = computeSampleNLL(highConfIncorrect, 'pendrive');
assert(nllIncorrect > 3.0, `Incorrect high-confidence prediction has high NLL (${nllIncorrect.toFixed(4)})`);
assert(Number.isFinite(nllCorrect) && Number.isFinite(nllIncorrect), 'NLL calculations are finite numbers');

// -----------------------------------------------------------
// 6. Multiclass Brier Score Tests
// -----------------------------------------------------------
console.log('\n[6] Testing Multiclass Brier Score:');
const brierPerfect = computeSampleBrier({ mouse: 1.0, pendrive: 0.0, other: 0.0 }, 'mouse');
assertApprox(brierPerfect, 0.0, 1e-6, 'Perfect deterministic prediction has Brier score = 0.0');

const brierWrong = computeSampleBrier({ mouse: 1.0, pendrive: 0.0, other: 0.0 }, 'pendrive');
assertApprox(brierWrong, 2.0, 1e-6, 'Completely wrong deterministic prediction has Brier score = 2.0');

const brierTypical = computeSampleBrier({ mouse: 0.8, pendrive: 0.1, other: 0.1 }, 'mouse');
assert(brierTypical > 0 && brierTypical < 1.0, `Typical prediction has valid Brier score (${brierTypical.toFixed(4)})`);

// -----------------------------------------------------------
// 7. Expected Calibration Error (ECE) Tests
// -----------------------------------------------------------
console.log('\n[7] Testing Expected Calibration Error (ECE):');
const wellCalibratedSamples = [
  { probabilities: { mouse: 0.8, pendrive: 0.1, other: 0.1 }, trueLabel: 'mouse' },
  { probabilities: { mouse: 0.8, pendrive: 0.1, other: 0.1 }, trueLabel: 'mouse' },
  { probabilities: { mouse: 0.8, pendrive: 0.1, other: 0.1 }, trueLabel: 'mouse' },
  { probabilities: { mouse: 0.8, pendrive: 0.1, other: 0.1 }, trueLabel: 'mouse' },
  { probabilities: { mouse: 0.8, pendrive: 0.1, other: 0.1 }, trueLabel: 'pendrive' }, // 4/5 = 80% accuracy == 80% confidence
];
const { ece: eceGood, bins: binsGood } = computeECE(wellCalibratedSamples, 5);
assert(eceGood <= 0.05, `Well-calibrated cohort has near-zero ECE (${(eceGood * 100).toFixed(2)}%)`);
assert(binsGood.length === 5, 'Generates exactly 5 reliability diagram bins');

const miscalibratedSamples = [
  { probabilities: { mouse: 0.99, pendrive: 0.005, other: 0.005 }, trueLabel: 'pendrive' },
  { probabilities: { mouse: 0.99, pendrive: 0.005, other: 0.005 }, trueLabel: 'other' },
];
const { ece: eceBad } = computeECE(miscalibratedSamples, 5);
assert(eceBad > 0.9, `Overconfident wrong cohort has high ECE (${(eceBad * 100).toFixed(2)}%)`);

// -----------------------------------------------------------
// 8. 1D Temperature Optimization Convergence Test
// -----------------------------------------------------------
console.log('\n[8] Testing Temperature Optimization Optimizer:');
// Create synthetic overconfident dataset where logits are too high (requires T > 1)
const overconfidentDataset = [
  { classLogScores: { mouse: 4.0, pendrive: -2.0, other: -2.0 }, trueLabel: 'mouse' },
  { classLogScores: { mouse: 4.0, pendrive: -2.0, other: -2.0 }, trueLabel: 'mouse' },
  { classLogScores: { mouse: 4.0, pendrive: -2.0, other: -2.0 }, trueLabel: 'other' }, // occasional mistake
  { classLogScores: { mouse: -2.0, pendrive: 4.0, other: -2.0 }, trueLabel: 'pendrive' },
  { classLogScores: { mouse: -2.0, pendrive: 4.0, other: -2.0 }, trueLabel: 'pendrive' },
  { classLogScores: { mouse: -2.0, pendrive: -2.0, other: 4.0 }, trueLabel: 'other' },
];

const fitRes = fitTemperature(overconfidentDataset);
assert(fitRes.temperature > 1.0, `Optimizer finds T > 1.0 for overconfident cohort (fitted T = ${fitRes.temperature})`);
assert(fitRes.optimizedNLL < fitRes.initialNLL, `Optimized NLL (${fitRes.optimizedNLL}) is strictly lower than raw NLL (${fitRes.initialNLL})`);

// -----------------------------------------------------------
// 9. Calibration Artifact Compatibility Verification Tests
// -----------------------------------------------------------
console.log('\n[9] Testing Calibration Artifact Compatibility Validation:');
const currentConfig = getClassifierConfig('gemini-1.5-flash');

const validArtifact = {
  method: 'temperature_scaling',
  temperature: 1.45,
  classifierModel: 'gemini-1.5-flash',
  classifierConfigVersion: CLASSIFIER_CONFIG_VERSION,
  classes: ['mouse', 'pendrive', 'other'],
  generationConfig: {
    temperature: 1.0,
    responseLogprobs: true,
    logprobs: 20,
    maxOutputTokens: 32,
  },
};

const validRes = validateCalibrationArtifact(validArtifact, currentConfig);
assert(validRes.compatible === true, 'Valid matching artifact passes compatibility check');

// Model mismatch
const modelMismatchArtifact = { ...validArtifact, classifierModel: 'gemini-2.0-flash-exp' };
const mismatchRes1 = validateCalibrationArtifact(modelMismatchArtifact, currentConfig);
assert(mismatchRes1.compatible === false, 'Detects model mismatch');
assert(mismatchRes1.reason.includes('MODEL_MISMATCH'), 'Reason explains MODEL_MISMATCH');

// Config version mismatch
const versionMismatchArtifact = { ...validArtifact, classifierConfigVersion: 'device-abc-v2' };
const mismatchRes2 = validateCalibrationArtifact(versionMismatchArtifact, currentConfig);
assert(mismatchRes2.compatible === false, 'Detects config version mismatch');

// Class list mismatch
const classMismatchArtifact = { ...validArtifact, classes: ['mouse', 'pendrive'] };
const mismatchRes3 = validateCalibrationArtifact(classMismatchArtifact, currentConfig);
assert(mismatchRes3.compatible === false, 'Detects class list mismatch');

// Invalid temperature
const invalidTempArtifact = { ...validArtifact, temperature: -0.5 };
const mismatchRes4 = validateCalibrationArtifact(invalidTempArtifact, currentConfig);
assert(mismatchRes4.compatible === false, 'Detects negative/invalid temperature value');

// -----------------------------------------------------------
// 10. Runtime Pipeline Integration Tests with Calibration
// -----------------------------------------------------------
console.log('\n[10] Testing Runtime Pipeline Calibration Behavior:');
const mockLogprobs = {
  topCandidates: [
    {
      candidates: [
        { token: 'A', logProbability: -0.10 },
        { token: 'B', logProbability: -2.50 },
        { token: 'C', logProbability: -3.20 },
      ],
    },
  ],
};

// Case A: No calibration artifact -> raw uncalibrated result
const uncalibratedResult = processClassificationLogprobs(
  mockLogprobs,
  'A',
  'gemini-1.5-flash',
  true,
  null,
);
assert(uncalibratedResult.confidenceAvailable === true, 'confidenceAvailable is true');
assert(uncalibratedResult.calibrated === false, 'calibrated flag is false when artifact is null');
assert(uncalibratedResult.temperature === null, 'temperature is null');
assert(uncalibratedResult.classLogScores.mouse !== undefined, 'classLogScores.mouse is exposed');
assert(uncalibratedResult.rawProbabilities.mouse !== undefined, 'rawProbabilities is exposed');
assert(uncalibratedResult.calibratedConfidence === undefined, 'calibratedConfidence is undefined when uncalibrated');

// Case B: Compatible calibration artifact -> calibrated result
const calibratedResult = processClassificationLogprobs(
  mockLogprobs,
  'A',
  'gemini-1.5-flash',
  true,
  validArtifact,
);
assert(calibratedResult.calibrated === true, 'calibrated flag is true when compatible artifact is provided');
assertApprox(calibratedResult.temperature, 1.45, 1e-4, 'Applies exact fitted temperature T = 1.45');
assert(calibratedResult.method.includes('temperature scaling'), 'Method indicates temperature scaling');
assert(calibratedResult.calibratedConfidence !== undefined, 'calibratedConfidence is computed');
assert(
  calibratedResult.calibratedConfidence < calibratedResult.rawClassProbability,
  `Softened confidence (${calibratedResult.calibratedConfidence}) is lower than raw prob (${calibratedResult.rawClassProbability}) for T > 1`,
);
assert(calibratedResult.predictedClass === 'mouse', 'Preserves predicted class as "mouse"');

// Case C: Mismatched calibration artifact -> safe fallback with reason
const mismatchedResult = processClassificationLogprobs(
  mockLogprobs,
  'A',
  'gemini-1.5-flash',
  true,
  modelMismatchArtifact,
);
assert(mismatchedResult.calibrated === false, 'calibrated is false on configuration mismatch');
assert(mismatchedResult.calibrationReason.includes('MODEL_MISMATCH'), 'calibrationReason is recorded');
assert(mismatchedResult.confidenceAvailable === true, 'Raw classification confidence is still available safely');
assertApprox(mismatchedResult.probabilities.mouse, uncalibratedResult.probabilities.mouse, 1e-5, 'Falls back to raw probabilities safely');

// Case D: Malformed calibration artifact -> safe fallback
const malformedResult = processClassificationLogprobs(
  mockLogprobs,
  'A',
  'gemini-1.5-flash',
  true,
  { invalid: 'garbage' },
);
assert(malformedResult.calibrated === false, 'calibrated is false on malformed artifact');
assert(malformedResult.confidenceAvailable === true, 'Classifier does not crash on malformed artifact');

console.log('\n======================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
