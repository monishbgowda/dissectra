function stripJson(text) {

    let cleaned =
        String(text || "").trim();

    cleaned = cleaned

        .replace(/^```json/i, "")

        .replace(/^```/i, "")

        .replace(/```$/i, "")

        .trim();

    const start =
        cleaned.indexOf("{");

    const end =
        cleaned.lastIndexOf("}");

    if (
        start !== -1 &&
        end !== -1
    ) {

        cleaned =
            cleaned.substring(
                start,
                end + 1
            );

    }

    return cleaned;

}

const logger =
    require("../utils/logger");

function parseAnalysis(text) {

    if (!text) {

        throw new Error(
            "parseAnalysis: empty Gemini response."
        );

    }

    const cleaned =
        stripJson(text);

    try {

        const analysis =
            JSON.parse(cleaned);

        analysis.product ??= {};
        analysis.components ??= [];
        analysis.materials ??= [];
        analysis.manufacturing ??= [];
        analysis.damage ??= [];
        analysis.engineering ??= {};
        analysis.summary ??= "";

        return analysis;

    }

    catch (err) {

    logger.error("JSON Parse Error:");
    logger.error(err.message);

    logger.error(
        "\nLast 300 characters:\n"
    );

    logger.error(
        cleaned.slice(-300)
    );

    throw err;

}

}

module.exports = {

    parseAnalysis

};
