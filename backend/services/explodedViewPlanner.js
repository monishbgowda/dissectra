async function createExplodedLayout(inspection) {

    if (
        !inspection ||
        !Array.isArray(inspection.components)
    ) {

        return inspection;

    }

    let offset = 0;

    inspection.explodedLayout =
        inspection.components.map(component => {

            offset += 0.05;

            return {

                componentId:
                    component.componentId,

                translate: {

                    x: offset,

                    y: 0,

                    z: 0

                }

            };

        });

    return inspection;

}

module.exports = {

    createExplodedLayout

};