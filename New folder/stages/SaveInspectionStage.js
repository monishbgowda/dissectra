const PipelineStage =
    require("../pipeline/PipelineStage");

const {
    saveInspection
} = require("../services/inspectionStorage");

const {
    saveAnalysis
} = require("../services/analysisStorage");

class SaveInspectionStage extends PipelineStage {

    constructor() {

        super({

            name: "Save Inspection"

        });

    }

    async execute(context) {

        if (!context.inspection) {

            throw new Error(
                "SaveInspectionStage: inspection not found."
            );

        }

        if (!context.inspectionFolder) {

            throw new Error(
                "SaveInspectionStage: inspectionFolder not found."
            );

        }

        context.inspectionPath =
            await saveInspection(

                context.inspectionFolder,

                context.inspection

            );

        if (context.analysis) {

            context.analysisPath =
                await saveAnalysis(

                    context.inspectionFolder,

                    context.analysis

                );

        }

        return context;

    }

}

module.exports = SaveInspectionStage;