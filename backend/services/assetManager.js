const fs = require("fs/promises");
const path = require("path");

const config =
    require("../config/config");

const logger =
    require("../utils/logger");

const CACHE = path.join(
    config.uploadRoot,
    "assets",
    "cache",
);

async function ensureFolder(folder) {

    await fs.mkdir(
        folder,
        {
            recursive: true,
        },
    );

}

async function componentFolder(id) {

    if (!id) {

        throw new Error(
            "Component ID is required.",
        );

    }

    const folder =
        path.join(
            CACHE,
            id,
        );

    await ensureFolder(
        folder,
    );

    return folder;

}

async function exists(file) {

    if (!file) {

        return false;

    }

    try {

        await fs.access(
            file,
        );

        return true;

    }

    catch {

        return false;

    }

}

async function remove(file) {

    if (!(await exists(file))) {

        return false;

    }

    await fs.rm(
        file,
        {
            recursive: true,
            force: true,
        },
    );

    logger.info(
        `Removed asset: ${file}`,
    );

    return true;

}

module.exports = {

    componentFolder,

    ensureFolder,

    exists,

    remove,

};