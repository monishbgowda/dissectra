const inspectionPipeline =
    require("../pipeline/inspectionPipeline");

const PipelineContext =
    require("../pipeline/PipelineContext");

const logger =
    require("../utils/logger");

async function analyzeInspectionFolder(
    inspectionFolder,
) {

    if (!inspectionFolder) {

        throw new Error(
            "Inspection folder is required.",
        );

    }

    logger.info(
        "Starting inspection:",
        inspectionFolder,
    );

    const context =
        new PipelineContext({

            inspectionFolder,

        });

    const result =
        await inspectionPipeline.run(
            context,
        );

    logger.info(
        "Inspection completed.",
    );

    return result;

}

module.exports = {

    analyzeInspectionFolder,

};