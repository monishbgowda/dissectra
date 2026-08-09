const PipelineStage =
    require("../pipeline/PipelineStage");

class MaterialCostStage extends PipelineStage {

    constructor() {

        super({

            name: "Material Cost",

            optional: true

        });

    }

    async execute(context) {

        context.inspection.cost = {

            estimated: 0,

            currency: "USD",

            breakdown: []

        };

        return context;

    }

}

module.exports = MaterialCostStage;