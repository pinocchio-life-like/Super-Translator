import { Request, Response } from "express";
import OpenAI from "openai";
import Instructor from "@instructor-ai/instructor";
import { logActivity } from "../utils/activityLogger";
import { ActionType, EntityType, ActionOutcome } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Wrap the OpenAI client with Instructor-AI
const instructorClient = Instructor({
  client: openai,
  mode: "TOOLS",
});

// Define an interface for the streaming chunks
interface ChatCompletionChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
    index: number;
    finish_reason?: string;
  }>;
  id?: string;
  object?: string;
  created?: number;
  model?: string;
}

export const translation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req.user as any)?.id; // Assuming you have user ID in the request object
  const { source, target, content, prompt } = req.body;

  try {
    // Check if the OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      res
        .status(500)
        .json({ error: "OpenAI API Key is not set in the environment." });
      return;
    }

    // Build the system message
    let systemMessage = `Translate the following content from ${source} to ${target}: ${content}.`;
    if (source.toLowerCase() === "detect language") {
      systemMessage = `Detect the source language and translate the following content to ${target}: ${content}.`;
    }

    if (prompt) {
      systemMessage += ` Consider the following prompt or context: ${prompt}`;
    }

    // Prepare the message array for the AI
    const messages = [{ role: "system", content: systemMessage } as any];

    // Generate AI response using Instructor-AI with streaming
    const responseStream = await instructorClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.2,
      stream: true,
      seed: 1, // sample seed for reproducibility
    });

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    let translatedContent = "";

    // Stream the response data to the client
    for await (const chunk of responseStream as AsyncIterable<ChatCompletionChunk>) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      translatedContent += content;
      res.write(content);
    }

    // End the response when the stream is finished
    res.end();

    // Save the translation job to the database
    await prisma.translationJob.create({
      data: {
        userId,
        sourceFile: content, // Save the original content in sourceFile
        outputFile: translatedContent, // Save the translated content in outputFile
        sourceLang: source,
        targetLangs: [target],
        status: "COMPLETED",
      },
    });

    // Log successful translation activity
    await logActivity(
      req,
      userId,
      ActionType.TRANSLATE,
      EntityType.TRANSLATION_JOB,
      undefined,
      ActionOutcome.SUCCESS
    );
  } catch (error) {
    console.error("Error in translation service:", error);
    res.status(500).json({ error: "An error occurred during translation." });

    // Log failed translation activity
    await logActivity(
      req,
      userId,
      ActionType.TRANSLATE,
      EntityType.TRANSLATION_JOB,
      undefined,
      ActionOutcome.FAILED
    );
  }
};
