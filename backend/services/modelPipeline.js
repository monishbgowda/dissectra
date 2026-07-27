
const fs = require('fs/promises');
const path = require('path');

const { generateModel } = require('./modelProvider');

async function generateInspectionModel(
    inspectionId,
) {

    const inspectionFolder =
        path.join(
            process.env.UPLOAD_ROOT,
            inspectionId,
        );

    const analysisPath =
        path.join(
            inspectionFolder,
            'analysis',
            'analysis.json',
        );

    const modelsFolder =
        path.join(
            inspectionFolder,
            'models',
        );

    const analysis =
        JSON.parse(
            await fs.readFile(
                analysisPath,
                'utf8',
            ),
        );

    await fs.mkdir(
        modelsFolder,
        {
            recursive: true,
        },
    );

    return await generateModel(
        inspectionId,
        analysis,
        modelsFolder,
    );

}

module.exports = {

    generateInspectionModel,

};