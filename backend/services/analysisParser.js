const logger =
    require("../utils/logger");

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
                end + 1,
            );

    }

    return cleaned;

}

function parseAnalysis(text) {

    if (!text) {

        throw new Error(
            "parseAnalysis: empty Gemini response.",
        );

    }

    const cleaned =
        stripJson(text);

    try {

        const analysis =
            JSON.parse(cleaned);

        if (

            typeof analysis !== "object" ||

            analysis === null ||

            Array.isArray(analysis)

        ) {

            throw new Error(

                "Gemini returned an invalid analysis object.",

            );

        }

        const defaults = {

            product: {},

            components: [],

            materials: [],

            manufacturing: [],

            damage: [],

            engineering: {},

            summary: "",

        };

        Object.assign(

            defaults,

            analysis,

        );

        return defaults;

    }

    catch (err) {

        logger.error(
            "JSON Parse Error:",
        );

        logger.error(
            err.message,
        );

        logger.error(
            "\nFirst 300 characters:\n",
        );

        logger.error(
            cleaned.slice(0, 300),
        );

        logger.error(
            "\nLast 300 characters:\n",
        );

        logger.error(
            cleaned.slice(-300),
        );

        throw new Error(

            `Invalid Gemini JSON: ${err.message}`,

        );

    }

}

module.exports = {

    parseAnalysis,

};