const PipelineStage =
    require("../pipeline/PipelineStage");

const Inspection =
    require("../models/Inspection");

class CreateInspectionStage extends PipelineStage {

    constructor() {

        super({

            name: "Create Inspection"

        });

    }

    async execute(context) {

        if (!context.analysis) {

            throw new Error(
                "CreateInspectionStage: analysis not found in context."
            );

        }

        context.inspection =
            new Inspection(context.analysis);

        return context;

    }

}

module.exports = CreateInspectionStage;