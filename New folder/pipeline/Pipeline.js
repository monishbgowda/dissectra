const logger =
    require("../utils/logger");

class Pipeline {

    constructor(stages = []) {

        this.stages = stages;

    }

    async run(context) {

        for (const stage of this.stages) {

            const start = Date.now();

            try {

                logger.info(`Running: ${stage.name}`);

                context =
                    await stage.execute(context);

                logger.info(
                    `Completed: ${stage.name} (${Date.now() - start} ms)`
                );

            }

            catch (error) {

                logger.error(
                    `Failed: ${stage.name}`
                );

                if (stage.optional) {

                    logger.warn(
                        `${stage.name} skipped.`
                    );

                    continue;

                }

                throw error;

            }

        }

        return context;

    }

}

module.exports = Pipeline;
