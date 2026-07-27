const express = require("express");
const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");
const fs = require("fs/promises");

const {
    generateModel,
    getModelJob
} = require("../services/modelProvider");

const {
    addUpload,
    getUpload
} = require("../services/uploadStore");

const {
    readHistory
} = require("../services/historyStore");

const {
    analyzeInspectionFolder
} = require("../services/inspectionAnalyzer");

const {
    generateInspectionModel
} = require("../services/modelPipeline");

const router = express.Router();

const modelDir = path.join(
    process.env.UPLOAD_ROOT,
    "generated-models"
);

const storage = multer.diskStorage({

    destination: async (req, _file, cb) => {

        try {

            console.log("========== MULTER ==========");

            console.log("UPLOAD_ROOT:", process.env.UPLOAD_ROOT);

            console.log("BODY:", req.body);

            console.log("inspectionId:", req.body.inspectionId);

            const inspectionId = req.body.inspectionId;

            if (!inspectionId) {
                return cb(new Error("inspectionId is required."));
            }

            const folder = path.join(
                process.env.UPLOAD_ROOT,
                inspectionId,
                "images"
            );

            console.log("Folder:", folder);

            await fs.mkdir(folder, {
                recursive: true
            });

            console.log("Folder created");

            cb(null, folder);

        } catch (err) {

            console.error("DESTINATION ERROR");
            console.error(err);

            cb(err);

        }

    },   // <-- IMPORTANT COMMA HERE

    filename: (_req, file, cb) => {

        console.log("Generating filename");

        cb(
            null,
            `${Date.now()}-${randomUUID()}${path.extname(file.originalname) || ".jpg"}`
        );

    }

});

const upload = multer({

    storage,

    limits: {

        fileSize:
            Number(
                process.env.MAX_UPLOAD_BYTES
            ) ||

            10 * 1024 * 1024

    },

    fileFilter: (_req, file, cb) => {

        const allowed =
            /^image\/(png|jpe?g|webp)$/i;

        if (!allowed.test(file.mimetype)) {

            return cb(

                new Error(
                    "Only PNG, JPG, JPEG and WEBP images are allowed."
                )

            );

        }

        cb(null, true);

    }

});

router.get(

    "/health",

    (_req, res) => {

        res.json({

            ok: true,

            name: "dissectra-backend"

        });

    }

);

router.post(

    "/upload",

    upload.single("image"),

    async (req, res, next) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    error: "Image is required."

                });

            }

            const {

                inspectionId

            } = req.body;

            if (!inspectionId) {

                return res.status(400).json({

                    error:
                        "inspectionId is required."

                });

            }

            const uploadId =
                randomUUID();

            const item =
                await addUpload({

                    uploadId,

                    inspectionId,

                    filename:
                        req.file.filename,

                    path:
                        req.file.path,

                    mimetype:
                        req.file.mimetype,

                    createdAt:
                        new Date()
                            .toISOString()

                });

            res.json({

                success: true,

                uploadId,

                inspectionId,

                filename:
                    item.filename

            });

        }

        catch (err) {

            next(err);

        }

    }

);

router.post(

    "/generate-model",

    async (req, res, next) => {

        try {

            const file =
                getUpload(
                    req.body.uploadId
                );

            if (!file) {

                return res.status(404).json({

                    error:
                        "Upload not found."

                });

            }

            await fs.mkdir(

                modelDir,

                {

                    recursive: true

                }

            );

            const result =
                await generateModel(

                    req.body.uploadId,

                    file.path,

                    modelDir

                );

            res.json(result);

        }

        catch (err) {

            next(err);

        }

    }

);

router.post(

    "/:inspectionId/analyze",

    async (req, res, next) => {

        try {

            const inspectionFolder =
                path.join(

                    process.env.UPLOAD_ROOT,

                    req.params.inspectionId

                );

            const result =
                await analyzeInspectionFolder(

                    inspectionFolder

                );

            res.json({

                success: true,

                analysis:
                    result.analysis,

                inspectionPath:
                    result.inspectionPath

            });

        }

        catch (err) {

            next(err);

        }

    }

);

router.post(

    "/:inspectionId/model",

    async (req, res, next) => {

        try {

            const result =
                await generateInspectionModel(

                    req.params.inspectionId

                );

            res.json({

                success: true,

                model: result

            });

        }

        catch (err) {

            next(err);

        }

    }

);

router.get(

    "/model-status/:jobId",

    async (req, res, next) => {

        try {

            const job =
                await getModelJob(

                    req.params.jobId

                );

            if (!job) {

                return res.status(404).json({

                    error:
                        "Job not found."

                });

            }

            res.json(job);

        }

        catch (err) {

            next(err);

        }

    }

);

router.get(

    "/history",

    async (_req, res, next) => {

        try {

            res.json({

                items:
                    await readHistory()

            });

        }

        catch (err) {

            next(err);

        }

    }

);

module.exports = router;