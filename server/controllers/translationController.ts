import { Request, Response } from 'express';
import OpenAI from 'openai';
import Instructor from '@instructor-ai/instructor';

// Initialize the OpenAI client with the API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Wrap the OpenAI client with Instructor-AI
const instructorClient = Instructor({
  client: openai,
  mode: 'FUNCTIONS', // Using functions mode as specified
});

export const translation = async (req: Request, res: Response): Promise<void> => {
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
      { role: 'system', content: systemMessage } as any,
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
  } catch (error) {
    console.error('Error in translation service:', error);
    res.status(500).json({ error: 'An error occurred during translation.' });
  }
};