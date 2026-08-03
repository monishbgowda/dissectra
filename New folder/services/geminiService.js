const fs = require("fs/promises");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const logger =
    require("../utils/logger");

const storageService =
    require("./storageService");

const {
    buildInspectionPrompt
} = require("./promptBuilder");

const {
    parseAnalysis
} = require("./analysisParser");

if (!process.env.GEMINI_API_KEY) {

    throw new Error(
        "GEMINI_API_KEY is missing."
    );

}

const ai =
    new GoogleGenAI({

        apiKey:
            process.env.GEMINI_API_KEY,

    });
async function loadImages(inspectionFolder) {

    const imageFolder = path.join(
        inspectionFolder,
        "images"
    );

    const files = await fs.readdir(imageFolder);

    const allowedExtensions = new Set([
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]);

    const images = [];

    for (const file of files) {

        const extension = path.extname(file).toLowerCase();

        if (!allowedExtensions.has(extension)) {
            continue;
        }

        images.push({

            name: file,

            path: path.join(imageFolder, file),

            mimeType:
                extension === ".png"
                    ? "image/png"
                    : extension === ".webp"
                    ? "image/webp"
                    : "image/jpeg"

        });

    }

    if (images.length === 0) {

        throw new Error(
            `No images found in ${imageFolder}`
        );

    }

    logger.info(
        `Loaded ${images.length} image(s)`
    );

    return images;

}

async function saveAnalysis(
    inspectionFolder,
    analysis
) {

    const analysisFolder = path.join(
        inspectionFolder,
        "analysis"
    );

const outputFile = path.join(
    inspectionFolder,
    "analysis",
    "analysis.json",
);

await storageService.saveJson(
    outputFile,
    analysis,
);

    logger.info(
        "Analysis saved to:",
        outputFile
    );

}
async function analyzeInspection(imageFiles) {

    if (
        !Array.isArray(imageFiles) ||
        imageFiles.length === 0
    ) {

        throw new Error(
            "analyzeInspection: no images provided."
        );

    }

    const parts = [

        {

            text: buildInspectionPrompt(
                imageFiles.length
            )

        }

    ];

    for (const image of imageFiles) {

const buffers =
    await Promise.all(

        imageFiles.map(image =>
            fs.readFile(image.path)
        )

    );

buffers.forEach((buffers, index) => {

    parts.push({

        inlineData: {

            mimeType:
                imageFiles[index].mimeType,

            data:
                buffers.toString("base64"),

        },

    });

});

    }

    logger.info(
        `Sending ${imageFiles.length} image(s) to Gemini...`
    );
async function generateContentWithRetry(parts) {

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

  try {logger.info("Before generateContent");

const response =
    await ai.models.generateContent({

        model:
            process.env.GEMINI_MODEL ||
            "gemini-flash-latest",

        contents: [
            {
                role: "user",
                parts
            }
        ],

        config: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            temperature: 0.2
        }

    });

logger.info("After generateContent");

logger.info(
    JSON.stringify(
        response.candidates,
        null,
        2
    )
);

return response;
}

        catch (err) {

            const status =
                err.status ||
                err.code ||
                err.error?.code;

            if (

    [429, 500, 503].includes(status) &&

    attempt < MAX_RETRIES

){
const delay =

    1000 *

    Math.pow(

        2,

        attempt,

    );

logger.info(

    `Gemini busy. Retrying in ${delay} ms...`

);
                

                await new Promise(resolve =>
                    setTimeout(resolve, delay)
                );

                continue;

            }

            throw err;

        }

    }

}
const response =
    await generateContentWithRetry(parts);

    if (!response.text) {

        throw new Error(
            "Gemini returned an empty response."
        );

    }

    logger.info("\n===== GEMINI RESPONSE =====\n");

    logger.info("========== START ==========");

    logger.info(
        "Length:",
        response.text.length
    );

    logger.info(
        "Last 200 characters:"
    );

    logger.info(
        response.text.slice(-200)
    );

    logger.info("=========== END ===========");

    try {

    return parseAnalysis(
        response.text,
    );

}

catch (err) {

    logger.error(

        "Parser failed",

        err,

    );

    throw err;

}

}

module.exports = {

    loadImages,

    analyzeInspection,

    saveAnalysis

};
