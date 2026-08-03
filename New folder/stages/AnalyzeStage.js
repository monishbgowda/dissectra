const PipelineStage = require("../pipeline/PipelineStage");

const {
    loadImages,
    analyzeInspection,
    saveAnalysis
} = require("../services/geminiService");

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

        await saveAnalysis(
            context.inspectionFolder,
            analysis
        );

        context.analysis = analysis;

        return context;
    }

}

module.exports = AnalyzeStage;