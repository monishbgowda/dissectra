const fs = require('fs/promises');
const path = require('path');

const uploads = new Map();

const UPLOAD_ROOT =
    process.env.UPLOAD_ROOT;

async function createInspectionFolders(
    inspectionId,
) {

    const inspectionFolder =
        path.join(
            UPLOAD_ROOT,
            inspectionId,
        );

    await fs.mkdir(
        path.join(
            inspectionFolder,
            'images',
        ),
        {
            recursive: true,
        },
    );

    await fs.mkdir(
        path.join(
            inspectionFolder,
            'analysis',
        ),
        {
            recursive: true,
        },
    );

    await fs.mkdir(
        path.join(
            inspectionFolder,
            'models',
        ),
        {
            recursive: true,
        },
    );

    return inspectionFolder;

}

async function addUpload(
    item,
) {

    const inspectionFolder =
        await createInspectionFolders(
            item.inspectionId,
        );

    item.inspectionFolder =
        inspectionFolder;

    uploads.set(
        item.uploadId,
        item,
    );

    return item;

}

function getUpload(
    uploadId,
) {

    return uploads.get(
        uploadId,
    );

}

module.exports = {

    addUpload,

    getUpload,

    createInspectionFolders,

};