const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    buildPlan
} = require("../services/reconstructionPlanner");

class ReconstructionStage extends PipelineStage {

    constructor() {

        super({

            name: "Reconstruction Plan"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "ReconstructionStage: inspection not found in context."
            );

        }

        context.inspection =
            await buildPlan(
                context.inspection
            );

        return context;

    }

}

module.exports = ReconstructionStage;