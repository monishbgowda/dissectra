const PipelineStage =
    require("../pipeline/PipelineStage");

class SustainabilityStage extends PipelineStage {

    constructor() {

        super({

            name: "Sustainability",

            optional: true

        });

    }

    async execute(context) {

        context.inspection.sustainability = {

            score: null,

            recyclable: [],

            recommendations: []

        };

        return context;

    }

}

module.exports = SustainabilityStage;