const PipelineStage = require("../pipeline/PipelineStage");

const {
    loadImages,
    analyzeInspection,
    saveAnalysis
} = require("../services/geminiService");

const {
    classifyDevice
} = require("../services/deviceClassificationService");

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

        // Run detailed engineering analysis and dedicated device classification
        const [analysis, deviceClassification] = await Promise.all([
            analyzeInspection(imageFiles),
            classifyDevice(imageFiles).catch(err => ({
                predictedClass: null,
                confidenceAvailable: false,
                calibrated: false,
                reason: `CLASSIFICATION_FAILED: ${err.message || 'Unknown error'}`
            }))
        ]);

        // Attach new statistical classification result (preserving existing fields)
        analysis.deviceClassification = deviceClassification;

        await saveAnalysis(
            context.inspectionFolder,
            analysis
        );

        context.analysis = analysis;

        return context;
    }

}

module.exports = AnalyzeStage;