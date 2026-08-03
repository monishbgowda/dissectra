const path = require("path");

const storageService =
    require("./storageService");

const logger =
    require("../utils/logger");

const {
    generateModel,
} = require("./modelProvider");

async function generateInspectionModel(
    inspectionId,
) {

    if (!inspectionId) {

        throw new Error(
            "Inspection ID is required.",
        );

    }

    const inspectionFolder =
        storageService.getInspectionFolder(
            inspectionId,
        );

    const analysisPath =
        path.join(
            inspectionFolder,
            "analysis",
            "analysis.json",
        );

    const modelsFolder =
        storageService.getInspectionModelFolder(
            inspectionId,
        );

    const analysis =
        await storageService.readJson(
            analysisPath,
        );

    await storageService.ensureDirectory(
        modelsFolder,
    );

    logger.info(
        `Generating model for inspection: ${inspectionId}`,
    );

    const result =
        await generateModel(
            inspectionId,
            analysis,
            modelsFolder,
        );

    logger.info(
        `Model generation completed for inspection: ${inspectionId}`,
    );

    return result;

}

module.exports = {

    generateInspectionModel,

};