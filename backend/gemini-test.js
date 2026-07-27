require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function main() {

    console.log("Using model:", process.env.GEMINI_MODEL);

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

        console.log("\nSUCCESS");
        console.log(response.text);

    }

    catch (err) {

        console.error("\nFAILED");

        console.error(err);

    }

}

main();