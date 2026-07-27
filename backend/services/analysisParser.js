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

    console.error("JSON Parse Error:");
    console.error(err.message);

    console.error(
        "\nLast 300 characters:\n"
    );

    console.error(
        cleaned.slice(-300)
    );

    throw err;

}

}

module.exports = {

    parseAnalysis

};