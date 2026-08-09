const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    buildPipeline
} = require("../services/assetPipeline");

class AssetPipelineStage extends PipelineStage {

    constructor() {

        super({

            name: "Asset Pipeline"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "AssetPipelineStage: inspection not found in context."
            );

        }

        context.inspection =
            await buildPipeline(
                context.inspection
            );

        return context;

    }

}

module.exports = AssetPipelineStage;