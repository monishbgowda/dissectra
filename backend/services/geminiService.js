const fs = require("fs/promises");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const {
    buildInspectionPrompt
} = require("./promptBuilder");

const {
    parseAnalysis
} = require("./analysisParser");

const ai = new GoogleGenAI({

    apiKey: process.env.GEMINI_API_KEY

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

    console.log(
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

    await fs.mkdir(
        analysisFolder,
        {
            recursive: true
        }
    );

    const outputFile = path.join(
        analysisFolder,
        "analysis.json"
    );

    await fs.writeFile(
        outputFile,
        JSON.stringify(
            analysis,
            null,
            2
        ),
        "utf8"
    );

    console.log(
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

        const buffer =
            await fs.readFile(image.path);

        parts.push({

            inlineData: {

                mimeType:
                    image.mimeType,

                data:
                    buffer.toString("base64")

            }

        });

    }

    console.log(
        `Sending ${imageFiles.length} image(s) to Gemini...`
    );
async function generateContentWithRetry(parts) {

    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

  try {console.log("Before generateContent");

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

console.log("After generateContent");

console.log(
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
                status === 503 &&
                attempt < MAX_RETRIES
            ) {

                const delay =
                    attempt * 3000;

                console.log(
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

    console.log("\n===== GEMINI RESPONSE =====\n");

    console.log("========== START ==========");

    console.log(
        "Length:",
        response.text.length
    );

    console.log(
        "Last 200 characters:"
    );

    console.log(
        response.text.slice(-200)
    );

    console.log("=========== END ===========");

    return parseAnalysis(
        response.text
    );

}

module.exports = {

    loadImages,

    analyzeInspection,

    saveAnalysis

};  