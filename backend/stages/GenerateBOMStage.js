const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    generateBOM
} = require("../services/bomGenerator");

class GenerateBOMStage extends PipelineStage {

    constructor() {

        super({

            name: "Generate BOM"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "GenerateBOMStage: inspection not found in context."
            );

        }

        context.inspection =
            await generateBOM(
                context.inspection
            );

        return context;

    }

}

module.exports = GenerateBOMStage;