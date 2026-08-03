class Inspection {

    constructor(analysis = {}) {

        this.analysis = analysis;

        this.product =
            analysis.product || {};

        this.components =
            analysis.components || [];

        this.materials =
            analysis.materials || [];

        this.manufacturing =
            analysis.manufacturing || [];

        this.damage =
            analysis.damage || [];

        this.summary =
            analysis.summary || "";

        this.reconstructionPlan = null;

        this.componentGraph = null;

        this.explodedLayout = [];

        this.billOfMaterials = [];

        this.createdAt =
            new Date().toISOString();

    }

}

module.exports = Inspection;