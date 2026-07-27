const inspectionPipeline = require("../pipeline/inspectionPipeline");
const PipelineContext = require("../pipeline/PipelineContext");

async function analyzeInspectionFolder(inspectionFolder) {

    const context = new PipelineContext({
        inspectionFolder
    });

    const result = await inspectionPipeline.run(context);

    return result;

}

module.exports = {
    analyzeInspectionFolder
};