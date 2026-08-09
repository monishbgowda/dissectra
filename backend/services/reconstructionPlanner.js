function buildPlan(inspection) {

    if (
        !inspection ||
        !inspection.product
    ) {

        return inspection;

    }

    const decisionConfidence = 
        inspection.compositeConfidence !== undefined 
            ? inspection.compositeConfidence 
            : (inspection.product.confidence || 0);

    inspection.reconstructionPlan = {

        product: inspection.product.name,

        strategy: "",

        confidence: decisionConfidence,

        sources: []

    };

    if (decisionConfidence >= 0.95) {

        inspection.reconstructionPlan.strategy =
            "existing-model";

        inspection.reconstructionPlan.sources.push(
            "Sketchfab",
            "CAD Library"
        );

    }

    else if (decisionConfidence >= 0.80) {

        inspection.reconstructionPlan.strategy =
            "hybrid";

        inspection.reconstructionPlan.sources.push(
            "Sketchfab",
            "Meshy"
        );

    }

    else {

        inspection.reconstructionPlan.strategy =
            "generate";

        inspection.reconstructionPlan.sources.push(
            "Meshy"
        );

    }

    return inspection;

}

module.exports = {

    buildPlan

};