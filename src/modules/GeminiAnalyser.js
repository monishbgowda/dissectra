import axios from "axios";
import { GEMINI_API_KEY } from "../config/apiConfig";

const API_KEY = GEMINI_API_KEY;

// Mock response for development when no valid API key
const getMockResponse = () => ({
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          product: "Demo Product",
          components: [
            { name: "Main Body", function: "Primary structure", material: "Plastic", category: "Structural" },
            { name: "Control Panel", function: "User interface", material: "Circuit board", category: "Electronic" },
            { name: "Power Unit", function: "Energy supply", material: "Battery", category: "Power" }
          ]
        })
      }]
    }
  }]
});

export async function analyzeImage(base64Image) {
  // If no valid API key, return mock data for development
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE' || API_KEY.includes('YOUR_')) {
    console.log("No valid Gemini API key - using mock response for development");
    return getMockResponse();
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              },
              {
                text: `
                      Identify the product and return ONLY JSON:
                      {
                        "product": "name",
                        "components": [
                          { "name": "", "function": "", "material": "", "category": "" }
                        ]
                      }
                      `
              }
            ]
          }
        ]
      },
      {
        timeout: 30000 // 30 second timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    console.log("Falling back to mock response");
    return getMockResponse();
  }
}