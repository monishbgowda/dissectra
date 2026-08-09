class PipelineContext {

    constructor({
        inspectionFolder,
        imageFiles
    }) {

        this.inspectionFolder = inspectionFolder;
        this.imageFiles = imageFiles;

        this.analysis = null;

        this.inspection = null;

        this.inspectionPath = null;

        this.errors = [];

        this.warnings = [];

        this.metadata = {};

    }

    addWarning(message) {

        this.warnings.push(message);

    }

    addError(message) {

        this.errors.push(message);

    }

}

module.exports = PipelineContext;