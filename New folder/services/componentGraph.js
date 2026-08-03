const ComponentGraph =
    require("../models/ComponentGraph");

async function buildComponentGraph(inspection) {

    if (
        !inspection ||
        !Array.isArray(inspection.components)
    ) {

        return inspection;

    }

    const graph = new ComponentGraph();

    for (const component of inspection.components) {

        graph.addNode({

            id: component.componentId,

            name: component.name,

            category: component.category

        });

    }

    inspection.componentGraph = graph;

    return inspection;

}

module.exports = {

    buildComponentGraph

};