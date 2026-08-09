const { calculateCompositeConfidence } = require('../services/confidenceCalculator');

function runTest(name, analysis, imageCount, expectedChecks) {
    console.log(`\n--- ${name} ---`);
    try {
        const result = calculateCompositeConfidence(analysis, imageCount);
        console.log("Result:", JSON.stringify(result, null, 2));
        expectedChecks(result);
        console.log(`✅ ${name} passed`);
    } catch (e) {
        console.error(`❌ ${name} failed:`, e.message);
        process.exitCode = 1;
    }
}

// Ensure results are clamped between 0 and 1
function assertClamped(result) {
    const { finalConfidence, breakdown } = result;
    if (finalConfidence < 0 || finalConfidence > 1) throw new Error("finalConfidence out of bounds: " + finalConfidence);
    if (isNaN(finalConfidence)) throw new Error("finalConfidence is NaN");
    for (const [key, val] of Object.entries(breakdown)) {
        if (val < 0 || val > 1) throw new Error(`${key} out of bounds: ${val}`);
        if (isNaN(val)) throw new Error(`${key} is NaN`);
    }
}

const completeAnalysis = {
    product: { brand: "Sony", model: "WH-1000XM4", name: "Headphones", category: "Audio", confidence: 0.90 },
    components: [
        { id: "c1", name: "Ear Cup", category: "Body", material: "Plastic", manufacturingProcess: "Injection Molding", assemblyMethod: "Screws", replaceable: true, confidence: 0.95 }
    ],
    materials: [ { name: "Plastic", usedIn: ["Ear Cup"] } ],
    manufacturing: [ { process: "Injection Molding", components: ["Ear Cup"] } ],
    damage: [],
    engineering: { repairability: 8, manufacturability: 7, complexity: 5, modularity: 6 },
    summary: "Good condition."
};

// Test 1: AI = 0.90, 3 images, complete, no issues
runTest("Test 1: Ideal case (AI=0.9, 3 img, complete, consistent)", completeAnalysis, 3, (res) => {
    assertClamped(res);
    if (res.breakdown.aiConfidence !== 0.90) throw new Error("AI confidence mismatch: " + res.breakdown.aiConfidence);
    if (res.breakdown.multiViewEvidence !== 1.0) throw new Error("Multi-view mismatch: " + res.breakdown.multiViewEvidence);
    if (res.breakdown.completeness !== 1.0) throw new Error("Completeness mismatch: " + res.breakdown.completeness);
    if (res.breakdown.consistency !== 1.0) throw new Error("Consistency mismatch: " + res.breakdown.consistency);
    const expectedFinal = (0.9 * 0.4) + (1.0 * 0.25) + (1.0 * 0.15) + (1.0 * 0.20);
    if (Math.abs(res.finalConfidence - expectedFinal) > 0.001) throw new Error("Final mismatch: " + res.finalConfidence);
});

// Test 2: AI = 0.50, 1 image, partially complete, some consistency issues
const partialAnalysis = {
    product: { confidence: 0.50, name: "Thing" }, // missing brand, model, category
    components: [
        { name: "Part 1" }, // missing confidence (valid)
        { confidence: 1.5 } // malformed confidence (>1), no name/id (malformed)
    ]
    // missing materials, manufacturing, damage, engineering, summary
};
runTest("Test 2: Partial/Inconsistent (AI=0.5, 1 img)", partialAnalysis, 1, (res) => {
    assertClamped(res);
    if (res.breakdown.aiConfidence !== 0.50) throw new Error("AI confidence mismatch");
    if (res.breakdown.multiViewEvidence < 0.33 || res.breakdown.multiViewEvidence > 0.34) throw new Error("Multi-view mismatch");
    if (res.breakdown.completeness >= 1.0) throw new Error("Completeness should be < 1.0 (got " + res.breakdown.completeness + ")");
    if (res.breakdown.consistency >= 1.0) throw new Error("Consistency should be < 1.0 (got " + res.breakdown.consistency + ")");
});

// Test 3: AI = 1.0, 3 images, complete analysis, no issues
const perfectAnalysis = JSON.parse(JSON.stringify(completeAnalysis));
perfectAnalysis.product.confidence = 1.0;
runTest("Test 3: Perfect AI (AI=1.0, 3 img)", perfectAnalysis, 3, (res) => {
    assertClamped(res);
    if (res.breakdown.aiConfidence !== 1.0) throw new Error("AI mismatch");
    const expectedFinal = (1.0 * 0.4) + (1.0 * 0.25) + (1.0 * 0.15) + (1.0 * 0.20);
    if (Math.abs(res.finalConfidence - expectedFinal) > 0.001) throw new Error("Final mismatch");
});

// Test 4: Missing/invalid AI confidence
const invalidAiAnalysis = JSON.parse(JSON.stringify(completeAnalysis));
invalidAiAnalysis.product.confidence = "high"; // Invalid type
runTest("Test 4: Missing/invalid AI confidence", invalidAiAnalysis, 3, (res) => {
    assertClamped(res);
    if (res.breakdown.aiConfidence !== 0) throw new Error("AI should be 0 for invalid input");
    if (res.breakdown.consistency >= 1.0) throw new Error("Consistency should be reduced for invalid product.confidence");
});

// Test 5: 0, 1, 2, and 3 image counts
runTest("Test 5a: 0 images", completeAnalysis, 0, (res) => { if (res.breakdown.multiViewEvidence !== 0.0) throw new Error("0 images mismatch"); });
runTest("Test 5b: 1 image", completeAnalysis, 1, (res) => { if (Math.abs(res.breakdown.multiViewEvidence - 0.333) > 0.01) throw new Error("1 image mismatch"); });
runTest("Test 5c: 2 images", completeAnalysis, 2, (res) => { if (Math.abs(res.breakdown.multiViewEvidence - 0.666) > 0.01) throw new Error("2 images mismatch"); });
runTest("Test 5d: 3 images", completeAnalysis, 3, (res) => { if (res.breakdown.multiViewEvidence !== 1.0) throw new Error("3 images mismatch"); });

// Test 6: Invalid/malformed analysis object
runTest("Test 6: Invalid/malformed analysis object (null)", null, 3, (res) => {
    assertClamped(res);
    if (res.finalConfidence !== 0) throw new Error("Final should be 0");
});
runTest("Test 6b: Missing product completely", {}, 3, (res) => {
    assertClamped(res);
    if (res.breakdown.aiConfidence !== 0) throw new Error("AI should be 0");
});
