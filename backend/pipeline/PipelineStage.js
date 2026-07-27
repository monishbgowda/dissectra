class PipelineStage {

    constructor(options = {}) {

        this.name = options.name || this.constructor.name;

        this.retry = options.retry ?? 0;

        this.optional = options.optional ?? false;

    }

    async execute(context) {

        throw new Error(
            `${this.name} must implement execute()`
        );

    }

}

module.exports = PipelineStage;