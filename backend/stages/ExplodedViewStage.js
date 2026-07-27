const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    createExplodedLayout
} = require("../services/explodedViewPlanner");

class ExplodedViewStage extends PipelineStage {

    constructor() {

        super({

            name: "Exploded View"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "ExplodedViewStage: inspection not found in context."
            );

        }

        context.inspection =
            await createExplodedLayout(
                context.inspection
            );

        return context;

    }

}

module.exports = ExplodedViewStage;