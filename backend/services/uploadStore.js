const storage =
    require("./storageService");

const uploads =
    new Map();

async function addUpload(item) {

    if (!item.uploadId)
        throw new Error("uploadId missing");

    if (!item.inspectionId)
        throw new Error("inspectionId missing");

    if (!item.path)
        throw new Error("path missing");

    const inspectionFolder =
        await storage.createInspectionFolder(
            item.inspectionId,
        );

    const upload = {

        ...item,

        inspectionFolder,

    };

    uploads.set(
        upload.uploadId,
        upload,
    );

    return upload;

}

function getUpload(uploadId) {

    return uploads.get(
        uploadId,
    );

}

function removeUpload(uploadId) {

    uploads.delete(
        uploadId,
    );

}

function hasUpload(uploadId) {

    return uploads.has(
        uploadId,
    );

}

module.exports = {

    addUpload,

    getUpload,

    removeUpload,

    hasUpload,

};