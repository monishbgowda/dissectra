const fs = require("fs/promises");
const path = require("path");

const CACHE = path.join(
    __dirname,
    "../assets/cache"
);

async function ensureFolder(folder) {

    await fs.mkdir(folder, {
        recursive: true,
    });

}

async function componentFolder(id) {

    const folder = path.join(
        CACHE,
        id
    );

    await ensureFolder(folder);

    return folder;

}

async function exists(file) {

    try {

        await fs.access(file);

        return true;

    }

    catch {

        return false;

    }

}

module.exports = {

    componentFolder,

    exists,

};