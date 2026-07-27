async function generateBOM(inspection) {

    if (
        !inspection ||
        !Array.isArray(inspection.components)
    ) {

        return inspection;

    }

    inspection.billOfMaterials =
        inspection.components.map((component, index) => ({

            item: index + 1,

            partNumber:
                component.componentId,

            name:
                component.name,

            material:
                component.material,

            process:
                component.manufacturingProcess

        }));

    return inspection;

}

module.exports = {

    generateBOM

};