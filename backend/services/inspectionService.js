const path = require("path");
const { randomUUID } = require("crypto");

const storage =
    require("./storageService");

const {
    addUpload,
    getUpload,
} = require("./uploadStore");
const {
    generateInspectionModel:
        generateInspectionModelPipeline,
} = require("./modelPipeline");
const {
    readHistory,
} = require("./historyStore");

const {
    analyzeInspectionFolder,
} = require("./inspectionAnalyzer");

const {
    generateInspectionModel,
} = require("./modelPipeline");

const {
    generateModel,
    getModelJob,
} = require("./modelProvider");

const ApiError =
    require("../utils/ApiError");
class InspectionService {

    async uploadInspection(
        inspectionId,
        file,
    ) {

        if (!inspectionId) {

            throw new ApiError(
    400,
    "inspectionId is required.",
);

        }

        await storage.createInspectionFolder(
            inspectionId,
        );

        const imageFolder =
            storage.getInspectionImageFolder(
                inspectionId,
            );

        const finalPath =
            path.join(
                imageFolder,
                file.filename,
            );

        await storage.moveFile(
            file.path,
            finalPath,
        );

        const uploadId =
            randomUUID();

        const upload =
            await addUpload({

                uploadId,

                inspectionId,

                filename:
                    file.filename,

                path:
                    finalPath,

                mimetype:
                    file.mimetype,

                createdAt:
                    new Date().toISOString(),

            });

        return {

            success: true,

            uploadId,

            inspectionId,

            filename:
                upload.filename,

        };

    }

    async analyzeInspection(
        inspectionId,
    ) {

        const inspectionFolder =
            storage.getInspectionFolder(
                inspectionId,
            );

        const result =
            await analyzeInspectionFolder(
                inspectionFolder,
            );

        return {

            success: true,

            analysis:
                result.analysis,

            inspectionPath:
                result.inspectionPath,

        };

    }

    async generateInspectionModel(
        inspectionId,
    ) {

        const model =
            await generateInspectionModelPipeline(
        inspectionId,
    );

        return {

            success: true,

            model,

        };

    }

    async generateModelJob(
        uploadId,
    ) {

        const upload =
            getUpload(uploadId);

        if (!upload) {

            throw new ApiError(
    404,
    "Upload not found.",
);

        }

        const modelFolder =
            storage.getGeneratedModelFolder();

        const result =
            await generateModel(

                uploadId,

                upload.path,

                modelFolder,

            );

        return result;

    }

    async getModelStatus(
        jobId,
    ) {

        const job =
            await getModelJob(
                jobId,
            );

        if (!job) {

            throw new ApiError(
    404,
    "Job not found.",
);

        }

        return job;

    }

    async getHistory() {

        return {

            items:
                await readHistory(),

        };

    }

}

module.exports =
    new InspectionService();