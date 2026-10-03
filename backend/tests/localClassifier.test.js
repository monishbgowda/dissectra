const {
  CLASS_MAPPING,
  TOKEN_MAPPING,
  getClassifierConfig,
  processLocalClassificationLogits,
} = require('../services/deviceClassificationService');

const {
  stableSoftmax,
  normalizedShannonEntropy,
} = require('../utils/probabilityMath');

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
console.log('TEST SUITE: Local MobileNetV2 3-Class Device Classifier');
console.log('======================================================\n');

// -----------------------------------------------------------
// 1. Explicit Class Mapping Verification
// -----------------------------------------------------------
console.log('[1] Testing Explicit Class Mapping (0=mouse, 1=pendrive, 2=other):');
assert(CLASS_MAPPING.A === 'mouse', 'Token A maps to class "mouse" (index 0)');
assert(CLASS_MAPPING.B === 'pendrive', 'Token B maps to class "pendrive" (index 1)');
assert(CLASS_MAPPING.C === 'other', 'Token C maps to class "other" (index 2)');
assert(TOKEN_MAPPING.mouse === 'A', 'Class "mouse" maps back to token A');
assert(TOKEN_MAPPING.pendrive === 'B', 'Class "pendrive" maps back to token B');
assert(TOKEN_MAPPING.other === 'C', 'Class "other" maps back to token C');

// -----------------------------------------------------------
// 2. Pre-softmax Logit Processing & Argmax Verification
// -----------------------------------------------------------
console.log('\n[2] Testing Pre-softmax Logit Processing & Argmax:');
const mockLogits = { mouse: 3.5, pendrive: -1.2, other: -0.5 };
const processed = processLocalClassificationLogits(mockLogits, 'MobileNetV2', null);

assert(processed.confidenceAvailable === true, 'confidenceAvailable is true for valid logits');
assert(processed.calibrated === false, 'calibrated flag is false when uncalibrated');
assert(processed.predictedClass === 'mouse', 'predictedClass is "mouse" (argmax of logits)');
assert(processed.predictedToken === 'A', 'predictedToken is "A"');
assert(processed.classLogScores.mouse === 3.5, 'Raw mouse logit score is preserved exactly');
assert(processed.classLogScores.pendrive === -1.2, 'Raw pendrive logit score is preserved exactly');
assert(processed.classLogScores.other === -0.5, 'Raw other logit score is preserved exactly');

const totalProb = processed.probabilities.mouse + processed.probabilities.pendrive + processed.probabilities.other;
assertApprox(totalProb, 1.0, 1e-6, 'Stable softmax probabilities sum to 1.0');
assert(processed.rawClassProbability > 0.9, `Dominant class raw probability is high (${processed.rawClassProbability})`);

// -----------------------------------------------------------
// 3. Multi-Image Logit Aggregation Math Test
// -----------------------------------------------------------
console.log('\n[3] Testing Multi-Image Element-Wise Logit Averaging:');
// Simulate 3 images of the same device with different view logits
const img1Logits = [2.0, -1.0, -2.0]; // mouse view 1
const img2Logits = [4.0, -0.5, -1.5]; // mouse view 2
const img3Logits = [3.0, -1.5, -2.5]; // mouse view 3

const avgLogits = [
  (img1Logits[0] + img2Logits[0] + img3Logits[0]) / 3,
  (img1Logits[1] + img2Logits[1] + img3Logits[1]) / 3,
  (img1Logits[2] + img2Logits[2] + img3Logits[2]) / 3,
];

assertApprox(avgLogits[0], 3.0, 1e-6, 'Element-wise mean mouse logit is (2+4+3)/3 = 3.0');
assertApprox(avgLogits[1], -1.0, 1e-6, 'Element-wise mean pendrive logit is (-1-0.5-1.5)/3 = -1.0');
assertApprox(avgLogits[2], -2.0, 1e-6, 'Element-wise mean other logit is (-2-1.5-2.5)/3 = -2.0');

const avgSoftmax = stableSoftmax({ mouse: avgLogits[0], pendrive: avgLogits[1], other: avgLogits[2] });
assert(avgSoftmax.mouse > 0.95, `Aggregated mouse probability is high (${avgSoftmax.mouse.toFixed(4)})`);

// -----------------------------------------------------------
// 4. Safe Classifier-Not-Ready Failure Handling
// -----------------------------------------------------------
console.log('\n[4] Testing Safe Classifier-Not-Ready Failure Handling:');
const invalidLogitsResult = processLocalClassificationLogits(null, 'MobileNetV2', null);
assert(invalidLogitsResult.confidenceAvailable === false, 'Invalid logits produces confidenceAvailable=false');
assert(invalidLogitsResult.reason === 'INVALID_LOCAL_LOGITS', 'Reason is INVALID_LOCAL_LOGITS');
assert(invalidLogitsResult.predictedClass === null, 'predictedClass is null on failure');
assert(invalidLogitsResult.calibrated === false, 'calibrated is false on failure');

// -----------------------------------------------------------
// 5. Config Compatibility & Temperature Scaling Test
// -----------------------------------------------------------
console.log('\n[5] Testing Temperature Scaling Integration with Local Classifier:');
const mockArtifact = {
  method: 'temperature_scaling',
  temperature: 1.5,
  classifierModel: 'MobileNetV2',
  classifierConfigVersion: 'device-abc-v1',
  classes: ['mouse', 'pendrive', 'other'],
  generationConfig: {
    temperature: 1.0,
    responseLogprobs: true,
    logprobs: 20,
  },
};

const calibratedRes = processLocalClassificationLogits(mockLogits, 'MobileNetV2', mockArtifact);
assert(calibratedRes.calibrated === true, 'Calibrated flag is true when compatible artifact is provided');
assertApprox(calibratedRes.temperature, 1.5, 1e-6, 'Applies exact fitted temperature T = 1.5');
assert(
  calibratedRes.calibratedConfidence < processed.rawClassProbability,
  `Softened probability (${calibratedRes.calibratedConfidence}) is lower than raw (${processed.rawClassProbability}) for T=1.5`,
);

console.log('\n======================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
