const {
  logSumExp,
  stableSoftmax,
  shannonEntropy,
  normalizedShannonEntropy,
  getUncertaintyLabel,
} = require('../utils/probabilityMath');

const {
  findClassDecodingStep,
  extractClassLogScores,
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
console.log('TEST SUITE: Probability Math & Device Classification');
console.log('======================================================\n');

// -----------------------------------------------------------
// 1. logSumExp Tests
// -----------------------------------------------------------
console.log('[1] Testing logSumExp:');

const lse1 = logSumExp([-1.0, -1.0]);
assertApprox(lse1, -1.0 + Math.log(2), 1e-6, 'logSumExp of two equal values [-1, -1] is ln(2*exp(-1))');

const lse2 = logSumExp([-1000, -1000]);
assertApprox(lse2, -1000 + Math.log(2), 1e-6, 'logSumExp handles large negative numbers without underflow');

assert(logSumExp([]) === -Infinity, 'logSumExp on empty array returns -Infinity');

// -----------------------------------------------------------
// 2. stableSoftmax Tests
// -----------------------------------------------------------
console.log('\n[2] Testing stableSoftmax:');

const uniformSoftmax = stableSoftmax({ A: 0, B: 0, C: 0 });
assertApprox(uniformSoftmax.A, 1 / 3, 1e-6, 'Equal log scores [0, 0, 0] produce pA = 1/3');
assertApprox(uniformSoftmax.B, 1 / 3, 1e-6, 'Equal log scores [0, 0, 0] produce pB = 1/3');
assertApprox(uniformSoftmax.C, 1 / 3, 1e-6, 'Equal log scores [0, 0, 0] produce pC = 1/3');
assertApprox(uniformSoftmax.A + uniformSoftmax.B + uniformSoftmax.C, 1.0, 1e-6, 'Probabilities sum to 1.0');

const skewedSoftmax = stableSoftmax({ A: 0, B: -5, C: -5 });
assert(skewedSoftmax.A > 0.98, `Skewed scores [0, -5, -5] produce dominant class A (got ${skewedSoftmax.A.toFixed(4)})`);
assertApprox(skewedSoftmax.B, skewedSoftmax.C, 1e-6, 'Symmetric lower scores produce equal lower probabilities');
assertApprox(skewedSoftmax.A + skewedSoftmax.B + skewedSoftmax.C, 1.0, 1e-6, 'Skewed probabilities sum to 1.0');

// -----------------------------------------------------------
// 3. Shannon Entropy & Normalized Entropy Tests
// -----------------------------------------------------------
console.log('\n[3] Testing Shannon Entropy:');

const uniformProbs = { mouse: 1 / 3, pendrive: 1 / 3, other: 1 / 3 };
const maxEntropy = normalizedShannonEntropy(uniformProbs, 3);
assertApprox(maxEntropy, 1.0, 1e-6, 'Uniform distribution across 3 classes has normalized entropy = 1.0');
assert(getUncertaintyLabel(maxEntropy) === 'High', 'Normalized entropy 1.0 maps to High uncertainty');

const pureProbs = { mouse: 1.0, pendrive: 0.0, other: 0.0 };
const minEntropy = normalizedShannonEntropy(pureProbs, 3);
assertApprox(minEntropy, 0.0, 1e-6, 'Deterministic distribution [1, 0, 0] has normalized entropy = 0.0');
assert(getUncertaintyLabel(minEntropy) === 'Low', 'Normalized entropy 0.0 maps to Low uncertainty');

const mediumProbs = { mouse: 0.70, pendrive: 0.20, other: 0.10 };
const medEntropy = normalizedShannonEntropy(mediumProbs, 3);
assert(medEntropy > 0.35 && medEntropy < 0.85, `Realistic distribution has sensible intermediate entropy (${medEntropy.toFixed(4)})`);

// -----------------------------------------------------------
// 4. findClassDecodingStep Tests
// -----------------------------------------------------------
console.log('\n[4] Testing findClassDecodingStep:');

const mockLogprobsFirstStep = {
  topCandidates: [
    {
      candidates: [
        { token: 'A', logProbability: -0.05 },
        { token: 'B', logProbability: -3.2 },
        { token: 'C', logProbability: -4.1 },
      ],
    },
  ],
};
assert(findClassDecodingStep(mockLogprobsFirstStep) === 0, 'Finds class token at step 0 when output is immediate');

const mockLogprobsPrecedingWhitespace = {
  topCandidates: [
    {
      candidates: [
        { token: '\n', logProbability: -0.01 },
        { token: ' ', logProbability: -4.0 },
      ],
    },
    {
      candidates: [
        { token: ' B', logProbability: -0.1 },
        { token: 'A', logProbability: -2.8 },
        { token: 'C', logProbability: -3.5 },
      ],
    },
  ],
};
assert(findClassDecodingStep(mockLogprobsPrecedingWhitespace) === 1, 'Correctly locates class token at step 1 after preceding newline/whitespace');

// -----------------------------------------------------------
// 5. extractClassLogScores & Token Variant Combination Tests
// -----------------------------------------------------------
console.log('\n[5] Testing extractClassLogScores:');

const candidatesWithVariants = [
  { token: 'A', logProbability: -0.22 },
  { token: ' A', logProbability: -3.50 }, // variant of A
  { token: 'B', logProbability: -2.50 },
  { token: 'C', logProbability: -3.10 },
  { token: 'D', logProbability: -8.00 }, // irrelevant candidate
];

const extractedVariants = extractClassLogScores(candidatesWithVariants);
assert(extractedVariants.success === true, 'Successfully extracted all 3 classes');
const expectedCombinedA = logSumExp([-0.22, -3.50]);
assertApprox(extractedVariants.logScores.A, expectedCombinedA, 1e-6, 'Correctly combined token variants "A" and " A" using logSumExp');
assertApprox(extractedVariants.logScores.B, -2.50, 1e-6, 'Class B log score preserved');
assertApprox(extractedVariants.logScores.C, -3.10, 1e-6, 'Class C log score preserved');

// -----------------------------------------------------------
// 6. Missing Token Safety (Never Inventing Probabilities)
// -----------------------------------------------------------
console.log('\n[6] Testing Missing Token Safety (No Fabricated Probabilities):');

const candidatesMissingC = [
  { token: 'A', logProbability: -0.01 },
  { token: 'B', logProbability: -4.50 },
  // C is missing from top candidates
];

const missingResult = extractClassLogScores(candidatesMissingC);
assert(missingResult.success === false, 'Returns success: false when class C is absent');
assert(missingResult.reason === 'MISSING_CLASS_LOGPROB', 'Provides exact reason MISSING_CLASS_LOGPROB');
assert(missingResult.missingClasses.includes('C'), 'Identifies missing class C');

// -----------------------------------------------------------
// 7. Full processClassificationLogprobs Pipeline Test
// -----------------------------------------------------------
console.log('\n[7] Testing processClassificationLogprobs Full Pipeline:');

const completeLogprobsResult = {
  topCandidates: [
    {
      candidates: [
        { token: 'A', logProbability: -0.15 },
        { token: 'B', logProbability: -2.80 },
        { token: 'C', logProbability: -3.50 },
        { token: 'other', logProbability: -6.0 },
      ],
    },
  ],
};

const processed = processClassificationLogprobs(
  completeLogprobsResult,
  'A',
  'gemini-1.5-flash',
  true,
);

assert(processed.confidenceAvailable === true, 'confidenceAvailable is true for complete competing classes');
assert(processed.calibrated === false, 'calibrated flag is strictly false in Phase 1');
assert(processed.predictedClass === 'mouse', 'Predicted class is "mouse"');
assert(processed.predictedToken === 'A', 'Predicted token is "A"');
assert(processed.rawClassProbability > 0.85, `rawClassProbability is high (${processed.rawClassProbability.toFixed(4)})`);
assert(processed.probabilities.mouse + processed.probabilities.pendrive + processed.probabilities.other > 0.999, 'Probabilities sum to 1.0');
assert(processed.normalizedEntropy >= 0 && processed.normalizedEntropy <= 1, 'Normalized entropy is strictly within [0, 1]');
assert(processed.classifierModel === 'gemini-1.5-flash', 'Records exact classifier model');

// Pipeline with missing token
const incompleteLogprobsResult = {
  topCandidates: [
    {
      candidates: [
        { token: 'A', logProbability: -0.001 },
      ],
    },
  ],
};

const processedIncomplete = processClassificationLogprobs(
  incompleteLogprobsResult,
  'A',
  'gemini-1.5-flash',
  false,
);

assert(processedIncomplete.confidenceAvailable === false, 'Incomplete candidates results in confidenceAvailable=false');
assert(processedIncomplete.reason === 'MISSING_CLASS_LOGPROB', 'Reason is MISSING_CLASS_LOGPROB');
assert(processedIncomplete.rawClassProbability === undefined, 'No rawClassProbability is fabricated');

console.log('\n======================================================');
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
