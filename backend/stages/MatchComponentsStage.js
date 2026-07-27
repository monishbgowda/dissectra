const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    matchComponents
} = require("../services/componentMatcher");

class MatchComponentsStage extends PipelineStage {

    constructor() {

        super({

            name: "Match Components"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "MatchComponentsStage: inspection not found in context."
            );

        }

        context.inspection =
            await matchComponents(
                context.inspection
            );

        return context;

    }

}

module.exports =
    MatchComponentsStage;