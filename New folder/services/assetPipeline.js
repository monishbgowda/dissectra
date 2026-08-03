const {
    buildSearchQuery
} = require("./sketchfabService");

async function buildPipeline(inspection) {

    if (
        !inspection ||
        !Array.isArray(inspection.components)
    ) {

        return inspection;

    }

    for (const component of inspection.components) {

        if (!component.matched) {

            continue;

        }

        component.asset = {

            provider: "Sketchfab",

            search: await buildSearchQuery(
                component
            )

        };

    }

    return inspection;

}

module.exports = {

    buildPipeline

};