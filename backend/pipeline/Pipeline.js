class Pipeline {

    constructor(stages = []) {

        this.stages = stages;

    }

    async run(context) {

        for (const stage of this.stages) {

            const start = Date.now();

            try {

                console.log(`Running: ${stage.name}`);

                context =
                    await stage.execute(context);

                console.log(
                    `Completed: ${stage.name} (${Date.now() - start} ms)`
                );

            }

            catch (error) {

                console.error(
                    `Failed: ${stage.name}`
                );

                if (stage.optional) {

                    console.warn(
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