const PipelineStage =
    require("../pipeline/PipelineStage");

class PatentSearchStage extends PipelineStage {

    constructor() {

        super({

            name: "Patent Search",

            optional: true

        });

    }

    async execute(context) {

        context.inspection.patents = [];

        return context;

    }

}

module.exports = PatentSearchStage;