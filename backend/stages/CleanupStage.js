const fs = require("fs/promises");
const path = require("path");

const PipelineStage =
    require("../pipeline/PipelineStage");

const logger =
    require("../utils/logger");

class CleanupStage extends PipelineStage {

    constructor() {

        super({

            name: "Cleanup"

        });

    }

    async execute(context) {

        if (!context.inspectionFolder) {

            throw new Error(
                "CleanupStage: inspectionFolder not found in context."
            );

        }

        const imagesFolder = path.join(
            context.inspectionFolder,
            "images"
        );

        if (context.imageFiles) {

            for (const image of context.imageFiles) {

                try {

                    await fs.unlink(image.path);

                }

                catch (err) {

                    logger.warn(err.message);

                }

            }

        }

        try {

            await fs.rm(imagesFolder, {

                recursive: true,

                force: true

            });

        }

        catch (err) {

            logger.warn(err.message);

        }

        return context;

    }

}

module.exports = CleanupStage;
