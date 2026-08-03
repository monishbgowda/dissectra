require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const logger =
    require("./utils/logger");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function main() {

    logger.info("Using model:", process.env.GEMINI_MODEL);

    try {

        const response = await ai.models.generateContent({

            model: process.env.GEMINI_MODEL,

            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: "Reply with exactly the word Hello"
                        }
                    ]
                }
            ]

        });

        logger.info("\nSUCCESS");
        logger.info(response.text);

    }

    catch (err) {

        logger.error("\nFAILED");

        logger.error(err);

    }

}

main();
