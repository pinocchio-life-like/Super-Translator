"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translation = void 0;
const openai_1 = __importDefault(require("openai"));
const instructor_1 = __importDefault(require("@instructor-ai/instructor"));
// Initialize the OpenAI client with the API key from .env
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// Wrap the OpenAI client with Instructor-AI
const instructorClient = (0, instructor_1.default)({
    client: openai,
    mode: 'FUNCTIONS', // Using functions mode as specified
});
const translation = async (req, res) => {
    try {
        const { source, target, content, prompt } = req.body;
        // Check if the OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
            res.status(500).json({ error: 'OpenAI API Key is not set in the environment.' });
            return;
        }
        // Build the system message based on the source and target language
        let systemMessage = `Translate the following content from ${source} to ${target}: ${content}.`;
        if (source.toLowerCase() === 'detect language') {
            systemMessage = `Detect the source language and translate the following content to ${target}: ${content}.`;
        }
        if (prompt) {
            systemMessage += ` Consider the following prompt or context: ${prompt}`;
        }
        // Prepare the message array for the AI
        const messages = [
            { role: 'system', content: systemMessage },
        ];
        // Generate AI response using the OpenAI API wrapped by Instructor-AI
        const response = await instructorClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.2,
        });
        // Extract the AI's translation response
        const aiResponse = response.choices?.[0]?.message?.content?.trim() || '';
        // Send the AI response as the translated text
        res.json({
            message: 'Translation successful',
            translation: aiResponse,
        });
    }
    catch (error) {
        console.error('Error in translation service:', error);
        res.status(500).json({ error: 'An error occurred during translation.' });
    }
};
exports.translation = translation;
