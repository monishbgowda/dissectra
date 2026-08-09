const fs = require('fs/promises');
const path = require('path');

async function saveAnalysis(
    inspectionFolder,
    analysis,
) {
    const analysisFolder = path.join(
        inspectionFolder,
        'analysis',
    );

    await fs.mkdir(analysisFolder, {
        recursive: true,
    });

    const filePath = path.join(
        analysisFolder,
        'analysis.json',
    );

    await fs.writeFile(
        filePath,
        JSON.stringify(
            analysis,
            null,
            4,
        ),
    );

    return filePath;
}

module.exports = {
    saveAnalysis,
};