const express = require("express");
const axios = require("axios");

// The API key is loaded from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The URL is updated to use the gemini-2.5-flash-image-preview model
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Check if the API key is set
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not set in environment variables.");
}

// POST endpoint to handle image analysis requests
exports.gemini = async (req, res) => {
  // We expect both a text prompt and the base64-encoded image data in the request body
  const { imageData } = req.body;
  const prompt =
    "Analyze the provided image and determine if the item is 'Organic Waste' or 'Inorganic Waste'. Provide your response as a JSON object with the format: {'item_type': 'CLASSIFICATION_HERE', 'prediction' : 'your prediction in percentage', 'penalty': 'true if prediction is less than 90%, only if your biasness affects the percentage, if you see another kind of waste just true'}, 'items': [array of items you analyzed], 'mixture':'mixture prediction in %'. do not wrap with code block. and wrap json key and values with with double quotes. Do not include any other text not even '/n' so that i can use your output as json output in my project. If not provided return message saying unsupported image. ";
  if (!imageData) {
    return res.status(400).json({
      error: "Both prompt and imageData (base64 string) are required.",
    });
  }

  try {
    // Construct the payload as discussed in the Postman guide
    const payload = {
      contents: [
        {
          parts: [
            {
              // The text prompt from the client
              text: prompt,
            },
            {
              // The base64-encoded image data
              inlineData: {
                mimeType: "image/jpeg", // You may need to change this based on your image type
                data: imageData,
              },
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // The response from the API contains the generated content
    const modelResponse =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    // Attempt to parse the JSON output from the model
    try {
      const parsedResponse = JSON.parse(modelResponse.trim());
      res.json({ reply: parsedResponse });
    } catch (parseError) {
      // If the model response isn't valid JSON, return it as plain text with an error message
      res.status(500).json({
        error: "Failed to parse JSON response from the model.",
        reply: modelResponse,
      });
    }
  } catch (error) {
    console.error(
      "🚨 Gemini API Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to communicate with Gemini API." });
  }
};
