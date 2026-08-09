const PipelineStage = require("../pipeline/PipelineStage");

const {
    loadImages,
    analyzeInspection,
    saveAnalysis
} = require("../services/geminiService");

const {
    calculateCompositeConfidence
} = require("../services/confidenceCalculator");

class AnalyzeStage extends PipelineStage {

    constructor() {
        super({
            name: "Analyze"
        });
    }

    async execute(context) {

        const imageFiles =
            await loadImages(
                context.inspectionFolder
            );

        const analysis =
            await analyzeInspection(
                imageFiles
            );

        const composite = calculateCompositeConfidence(analysis, imageFiles.length);
        
        analysis.compositeConfidence = composite.finalConfidence;
        analysis.confidenceBreakdown = composite.breakdown;

        await saveAnalysis(
            context.inspectionFolder,
            analysis
        );

        context.analysis = analysis;

        return context;
    }

}

module.exports = AnalyzeStage;