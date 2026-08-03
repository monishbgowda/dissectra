const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");

const storageService =
    require("../services/storageService");

const storage =
    multer.diskStorage({

        destination: async (_req, _file, cb) => {

            try {

                const tempDir =
                    await storageService.getTempDirectory();

                cb(null, tempDir);

            }

            catch (err) {

                cb(err);

            }

        },

        filename: (_req, file, cb) => {

            cb(

                null,

                `${Date.now()}-${randomUUID()}${path.extname(file.originalname) || ".jpg"}`

            );

        },

    });

const upload =
    multer({

        storage,

        limits: {

            fileSize:
                storageService.maxUploadBytes(),

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

            cb(
                null,
                true,
            );

        },

    });

module.exports = upload;