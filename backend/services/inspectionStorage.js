const fs = require("fs/promises");
const path = require("path");

async function saveInspection(folder, inspection) {

    if (!folder) {

        throw new Error(
            "saveInspection: folder is required."
        );

    }

    if (!inspection) {

        throw new Error(
            "saveInspection: inspection is required."
        );

    }

    const output = path.join(
        folder,
        "inspection.json"
    );

    await fs.mkdir(folder, {

        recursive: true

    });

    await fs.writeFile(

        output,

        JSON.stringify(
            inspection,
            null,
            2
        ),

        "utf8"

    );

    return output;

}

module.exports = {

    saveInspection

};