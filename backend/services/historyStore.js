const fs = require("fs/promises");
const path = require("path");

const config =
    require("../config/config");

const logger =
    require("../utils/logger");

const HISTORY_FILE = path.join(
    config.uploadRoot,
    "history.json",
);

async function readHistory() {

    try {

        const history =
            JSON.parse(

                await fs.readFile(
                    HISTORY_FILE,
                    "utf8",
                ),

            );

        return Array.isArray(history)
            ? history
            : [];

    }

    catch (err) {

        if (err.code !== "ENOENT") {

            logger.error(
                "Failed to read history.",
                err,
            );

        }

        return [];

    }

}

async function saveHistoryItem(item) {

    if (!item) {

        throw new Error(
            "History item is required.",
        );

    }

    await fs.mkdir(

        path.dirname(
            HISTORY_FILE,
        ),

        {
            recursive: true,
        },

    );

    const history =
        await readHistory();

    const next = [

        item,

        ...history,

    ].slice(0, 500);

    await fs.writeFile(

        HISTORY_FILE,

        JSON.stringify(
            next,
            null,
            2,
        ),

        "utf8",

    );

    logger.info(
        "History updated.",
    );

    return item;

}

module.exports = {

    readHistory,

    saveHistoryItem,

};