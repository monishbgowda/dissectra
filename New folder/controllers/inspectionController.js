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

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    error: "Image is required.",

                });

            }

            const result =
                await inspectionService.uploadInspection(

                    req.body.inspectionId,

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

            logger.info(

                "Starting analysis:",

                req.params.inspectionId,

            );

            const result =
                await inspectionService.analyzeInspection(

                    req.params.inspectionId,

                );

            logger.info(

                "Analysis completed:",

                req.params.inspectionId,

            );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async generateInspectionModel(req, res, next) {

        try {

            const result =
                await inspectionService.generateInspectionModel(

                    req.params.inspectionId,

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async generateModelJob(req, res, next) {

        try {

            const result =
                await inspectionService.generateModelJob(

                    req.body.uploadId,

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

    async modelStatus(req, res, next) {

        try {

            const result =
                await inspectionService.getModelStatus(

                    req.params.jobId,

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