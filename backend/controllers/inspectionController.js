const inspectionService =
    require("../services/inspectionService");

const logger =
    require("../utils/logger");

class InspectionController {

    async health(_req, res) {

        res.json({

            ok: true,

            name: "dissectra-backend",

        });

    }

    async upload(req, res, next) {

        try {

            const {

                inspectionId,

            } = req.body;

            if (!inspectionId) {

                return res.status(400).json({

                    success: false,

                    error: "inspectionId is required.",

                });

            }

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    error: "Image is required.",

                });

            }

            const result =
                await inspectionService.uploadInspection(

                    inspectionId,

                    req.file,

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async analyze(req, res, next) {

        try {

            const {

                inspectionId,

            } = req.params;

            if (!inspectionId) {

                return res.status(400).json({

                    success: false,

                    error: "inspectionId is required.",

                });

            }

            logger.info(

                "Starting analysis:",

                inspectionId,

            );

            const result =
                await inspectionService.analyzeInspection(

                    inspectionId,

                );

            logger.info(

                "Analysis completed:",

                inspectionId,

            );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async generateInspectionModel(req, res, next) {

        try {

            const {

                inspectionId,

            } = req.params;

            if (!inspectionId) {

                return res.status(400).json({

                    success: false,

                    error: "inspectionId is required.",

                });

            }

            const result =
                await inspectionService.generateInspectionModel(

                    inspectionId,

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async generateModelJob(req, res, next) {

        try {

            const {

                uploadId,

            } = req.body;

            if (!uploadId) {

                return res.status(400).json({

                    success: false,

                    error: "uploadId is required.",

                });

            }

            const result =
                await inspectionService.generateModelJob(

                    uploadId,

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async modelStatus(req, res, next) {

        try {

            const {

                jobId,

            } = req.params;

            if (!jobId) {

                return res.status(400).json({

                    success: false,

                    error: "jobId is required.",

                });

            }

            const result =
                await inspectionService.getModelStatus(

                    jobId,

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async history(_req, res, next) {

        try {

            const result =
                await inspectionService.getHistory();

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

}

module.exports =
    new InspectionController();