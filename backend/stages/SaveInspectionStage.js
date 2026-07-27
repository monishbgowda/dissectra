const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    saveInspection
} = require("../services/inspectionStorage");

class SaveInspectionStage extends PipelineStage {

    constructor() {

        super({

            name: "Save Inspection"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "SaveInspectionStage: inspection not found in context."
            );

        }

        if (!context.inspectionFolder) {

            throw new Error(
                "SaveInspectionStage: inspectionFolder not found in context."
            );

        }

        context.inspectionPath =
            await saveInspection(
                context.inspectionFolder,
                context.inspection
            );

        return context;

    }

}

module.exports = SaveInspectionStage;