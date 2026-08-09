const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    buildComponentGraph
} = require("../services/componentGraph");

class ComponentGraphStage extends PipelineStage {

    constructor() {

        super({

            name: "Component Graph"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "ComponentGraphStage: inspection not found in context."
            );

        }

        context.inspection =
            await buildComponentGraph(
                context.inspection
            );

        return context;

    }

}

module.exports = ComponentGraphStage;