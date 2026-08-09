const fs = require('fs');
const path = require('path');
// Mock geminiService BEFORE anything else requires it
const geminiServiceMock = {
    loadImages: async (folder) => {
        return [
            { path: 'img1.jpg', mimeType: 'image/jpeg' },
            { path: 'img2.jpg', mimeType: 'image/jpeg' }
        ];
    },
    analyzeInspection: async (images) => {
        return {
            product: {
                brand: "MockBrand",
                model: "MockModel",
                name: "MockProduct",
                category: "MockCategory",
                confidence: 0.90
            },
            components: [
                { id: "c1", name: "MockComponent", category: "Mock", material: "Mock", manufacturingProcess: "Mock", assemblyMethod: "Mock", replaceable: true, confidence: 0.95 }
            ],
            materials: [{ name: "Mock", usedIn: [] }],
            manufacturing: [{ process: "Mock", components: [] }],
            damage: [],
            engineering: { repairability: 5 },
            summary: "Mock summary"
        };
    },
    saveAnalysis: async (folder, analysis) => {}
};

require.cache[require.resolve('../services/geminiService')] = {
    exports: geminiServiceMock
};

const PipelineContext = require('../pipeline/PipelineContext');
const inspectionPipeline = require('../pipeline/inspectionPipeline');
const storageService = require('../services/storageService');
const inspectionStorage = require('../services/inspectionStorage');
const analysisStorage = require('../services/analysisStorage');

inspectionStorage.saveInspection = async (folder, inspection) => {
    return "/mock/path";
};

analysisStorage.saveAnalysis = async (folder, analysis) => {
    return "/mock/path";
};

async function testPipeline() {
    console.log("Starting pipeline integration test...");
    
    const context = new PipelineContext({
        inspectionFolder: path.join(__dirname, 'mock_folder')
    });
    
    // Prevent CleanupStage from deleting our stuff
    const CleanupStage = require('../stages/CleanupStage');
    CleanupStage.prototype.execute = async (ctx) => { return ctx; };

    try {
        const result = await inspectionPipeline.run(context);
        
        console.log("Pipeline finished.");
        
        const inspection = result.inspection;
        const analysis = result.analysis;
        
        let passed = true;
        
        if (!analysis.compositeConfidence) {
            console.error("❌ analysis.compositeConfidence is missing");
            passed = false;
        } else {
            console.log("✅ analysis.compositeConfidence:", analysis.compositeConfidence);
        }
        
        if (!analysis.confidenceBreakdown) {
            console.error("❌ analysis.confidenceBreakdown is missing");
            passed = false;
        } else {
            console.log("✅ analysis.confidenceBreakdown:", analysis.confidenceBreakdown);
        }

        if (analysis.product.confidence !== 0.90) {
            console.error("❌ analysis.product.confidence was modified or missing");
            passed = false;
        } else {
            console.log("✅ analysis.product.confidence is intact:", analysis.product.confidence);
        }
        
        if (inspection.compositeConfidence !== analysis.compositeConfidence) {
            console.error("❌ inspection.compositeConfidence does not match analysis");
            passed = false;
        } else {
            console.log("✅ inspection.compositeConfidence matches analysis");
        }
        
        if (!inspection.reconstructionPlan) {
            console.error("❌ inspection.reconstructionPlan is missing");
            passed = false;
        } else {
            console.log("✅ inspection.reconstructionPlan strategy:", inspection.reconstructionPlan.strategy);
        }
        
        if (inspection.reconstructionPlan.confidence !== inspection.compositeConfidence) {
            console.error("❌ inspection.reconstructionPlan.confidence is not using compositeConfidence");
            passed = false;
        } else {
            console.log("✅ inspection.reconstructionPlan.confidence matches compositeConfidence");
        }

        if (passed) {
            console.log("✅ All integration tests passed!");
        } else {
            console.error("❌ Integration tests failed.");
            process.exit(1);
        }

    } catch (e) {
        console.error("Pipeline crashed:", e);
        process.exit(1);
    }
}

testPipeline();
