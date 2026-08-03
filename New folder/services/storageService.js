const fs = require("fs/promises");
const path = require("path");

const config =
    require("../config/config");

const uploadRoot =
    config.uploadRoot;

async function ensureDirectory(folder) {

    await fs.mkdir(
        folder,
        {
            recursive: true,
        },
    );

}

async function getTempDirectory() {

    const tempDir =
        path.join(
            uploadRoot,
            "tmp",
        );

    await ensureDirectory(
        tempDir,
    );

    return tempDir;

}

async function createInspectionFolder(
    inspectionId,
) {

    const inspectionFolder =
        path.join(
            uploadRoot,
            inspectionId,
        );

    await ensureDirectory(
        path.join(
            inspectionFolder,
            "images",
        ),
    );

    await ensureDirectory(
        path.join(
            inspectionFolder,
            "analysis",
        ),
    );

    await ensureDirectory(
        path.join(
            inspectionFolder,
            "models",
        ),
    );

    return inspectionFolder;

}

async function moveFile(
    source,
    destination,
) {

    await ensureDirectory(
        path.dirname(
            destination,
        ),
    );

    await fs.rename(
        source,
        destination,
    );

    return destination;

}

async function saveJson(
    file,
    data,
) {

    await ensureDirectory(
        path.dirname(file),
    );

    await fs.writeFile(

        file,

        JSON.stringify(
            data,
            null,
            2,
        ),

        "utf8",

    );

}

async function readJson(file) {

    const text =
        await fs.readFile(
            file,
            "utf8",
        );

    return JSON.parse(text);

}

function getInspectionFolder(
    inspectionId,
) {

    return path.join(
        uploadRoot,
        inspectionId,
    );

}

function getInspectionImageFolder(
    inspectionId,
) {

    return path.join(
        uploadRoot,
        inspectionId,
        "images",
    );

}

function getInspectionAnalysisFolder(
    inspectionId,
) {

    return path.join(
        uploadRoot,
        inspectionId,
        "analysis",
    );

}

function getInspectionModelFolder(
    inspectionId,
) {

    return path.join(
        uploadRoot,
        inspectionId,
        "models",
    );

}

function getGeneratedModelFolder() {

    return path.join(
        uploadRoot,
        "generated-models",
    );

}

function maxUploadBytes() {

    return config.maxUploadBytes;

}

module.exports = {

    uploadRoot,

    ensureDirectory,

    getTempDirectory,

    createInspectionFolder,

    moveFile,

    saveJson,

    readJson,

    getInspectionFolder,

    getInspectionImageFolder,

    getInspectionAnalysisFolder,

    getInspectionModelFolder,

    getGeneratedModelFolder,

    maxUploadBytes,

};