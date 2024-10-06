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
  const { source, target, content, prompt, translationJobId } = req.body;

  try {
    // Check if the OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      res
        .status(500)
        .json({ error: "OpenAI API Key is not set in the environment." });
      return;
    }

    let messages: { role: string; content: string }[] = [];

    let conversationHistory;

    if (translationJobId) {
      // Fetch existing conversation history
      conversationHistory = await prisma.conversationHistory.findFirst({
        where: { translationJobId },
      });

      if (conversationHistory && Array.isArray(conversationHistory.messages)) {
        // Add existing messages to the AI input
        messages = conversationHistory.messages as {
          role: string;
          content: string;
        }[];
      }
    }

    // Build the system message
    let systemMessage = `Translate the following content from ${source} to ${target}: ${content}.`;
    if (source.toLowerCase() === "detect language") {
      systemMessage = `Detect the source language and translate the following content to ${target}: ${content}.`;
    }

    if (prompt) {
      systemMessage += ` Consider the following prompt or context: ${prompt}`;
    }

    // Add the new user prompt to the message array
    messages.push({ role: "user", content: systemMessage });

    // Generate AI response using Instructor-AI with streaming
    const responseStream = await instructorClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any, // Cast to any to bypass type checking
      temperature: 0.2,
      stream: true,
      seed: 1, // sample seed for reproducibility
    });

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    let translatedContent = "";
    let aggregatedContent = "";

    // Stream the response data to the client
    for await (const chunk of responseStream as AsyncIterable<ChatCompletionChunk>) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      translatedContent += content;
      aggregatedContent += content;
      res.write(content);
    }

    // End the response when the stream is finished
    res.end();

    let translationJob;

    if (translationJobId) {
      // Update the existing translation job
      translationJob = await prisma.translationJob.update({
        where: { id: translationJobId },
        data: {
          outputFile: translatedContent, // Update the translated content in outputFile
          status: "COMPLETED",
        },
      });

      // Update the conversation history for the existing translation job
      await prisma.conversationHistory.update({
        where: { id: conversationHistory?.id },
        data: {
          messages: {
            push: { role: "bot", content: aggregatedContent },
          },
        },
      });
    } else {
      // Save the translation job to the database
      translationJob = await prisma.translationJob.create({
        data: {
          userId,
          sourceFile: content, // Save the original content in sourceFile
          outputFile: translatedContent, // Save the translated content in outputFile
          sourceLang: source,
          targetLangs: [target],
          status: "COMPLETED",
        },
      });

      // Save the conversation history to the database
      await prisma.conversationHistory.create({
        data: {
          userId,
          messages: [
            { role: "user", content: systemMessage },
            { role: "bot", content: aggregatedContent },
          ],
          translationJobId: translationJob.id,
        },
      });
    }

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
