import { Request, Response } from "express";
import OpenAI from "openai";
import Instructor from "@instructor-ai/instructor";
import { logActivity } from "../utils/activityLogger";
import { ActionType, EntityType, ActionOutcome } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import * as similarity from "string-similarity"; // A string similarity library
import { buildDynamicZodSchema } from "../utils/buildDynamicZodSchema";
import { ZodTypeAny } from "zod";
const LanguageDetect = require("languagedetect");

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

// Wrap the OpenAI client with Instructor-AI
const instructorClientJson = Instructor({
  client: openai,
  mode: "FUNCTIONS",
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
  const userId = (req.user as any)?.id;
  const { source, target, content, prompt, translationJobId } = req.body;
  const lngDetector = new LanguageDetect();

  let detectedLanguage = lngDetector.detect(content, 1);
  if (detectedLanguage.length > 0) {
    const [languageName] = detectedLanguage[0];
    detectedLanguage = languageName;
  } else {
    console.log("No language detected.");
    // Handle the case when language is not detected
    detectedLanguage = source || "unknown";
  }

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

    // First API Call: Transform idioms and phrases into literal terms

    // Build the system message for the first API call
    let systemMessage1 =
      "Your task is to rewrite the following content by transforming any idioms and expressions into their meanings and not keep the phrases in.";

    // if (prompt) {
    //   systemMessage1 += ` Consider the following prompt or context: "${prompt}";`;
    // }

    systemMessage1 += ` Here is the Content: "${content}";`;
    systemMessage1 += ` Note highly that the output should replace idioms and expressions by their meanings for clarity.`;

    // Create the message array for the first API call
    let messages1 = [{ role: "user", content: systemMessage1 } as any];

    // Generate AI response for the first API call
    const response1 = await instructorClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages1,
      temperature: 0,
      max_tokens: 1000,
      seed: 1, // sample seed for reproducibility
    });

    // Extract the transformed content from the first response
    let transformedContent =
      response1.choices?.[0]?.message?.content?.trim() ?? "";

    if (!transformedContent) {
      console.error("No valid response received from the AI model.");
      // Handle the error case as needed
    }
    // Second API Call: Translate the transformed content into the target language

    // Build the system message for the second API call
    let systemMessage =
      "Your task is to detect the source language of the given content and translate it into the target language.";

    if (prompt) {
      systemMessage += ` Consider the following prompt or context: "${prompt}";`;
    }

    systemMessage += ` Detect the source language and translate the following content into "${target}": "${transformedContent}";`;
    systemMessage += ` The final output should be natural and appropriate in the target language.`;

    // Create the message array for the second API call
    let messages2 = [{ role: "user", content: systemMessage } as any];

    // Generate AI response for the second API call
    const responseStream = await instructorClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages2,
      temperature: 0,
      max_tokens: 1000,
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

    res.write(`.\n
      .\n
       Below is the back-translation for error checking
      .\n`);

    // Perform back-translation for error checking
    const backTranslationMessages = [
      {
        role: "user",
        content: `Translate the following content back to the language of this text "${content.substring(
          0,
          140
        )}": "${translatedContent}";`,
      },
    ];

    const backTranslationResponseStream =
      await instructorClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: backTranslationMessages as any,
        temperature: 0,
        stream: true,
        seed: 1, // sample seed for reproducibility
      });

    let backTranslatedContent = "";

    // Stream the back-translation response data to the client
    for await (const chunk of backTranslationResponseStream as AsyncIterable<ChatCompletionChunk>) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      backTranslatedContent += content;
      res.write(content);
    }

    // Compare the original content with the back-translated content
    const similarityScore = similarity.compareTwoStrings(
      content,
      backTranslatedContent
    );

    // Define a threshold for acceptable similarity (e.g., 0.8 or 80%)
    const similarityThreshold = 0.8;

    // Write the similarity score to the response
    res.write(`.\n
      .\n
      .\nSimilarity Score: ${similarityScore}\n`);

    // End the response when both streams are finished
    res.end();

    if (similarityScore < similarityThreshold) {
      // Handle the case where the translation may have errors
      console.warn("Translation error detected due to low similarity score.");
      // You can log this information or handle it according to your needs
    }

    let translationJob;

    if (translationJobId) {
      // Update the existing translation job
      translationJob = await prisma.translationJob.update({
        where: { id: translationJobId },
        data: {
          outputFile: translatedContent,
          status: "COMPLETED",
        },
      });

      // Update the conversation history for the existing translation job
      await prisma.conversationHistory.update({
        where: { id: conversationHistory?.id },
        data: {
          messages: {
            push: { role: "bot", content: translatedContent },
          },
        },
      });
    } else {
      // Save the translation job to the database
      translationJob = await prisma.translationJob.create({
        data: {
          userId,
          sourceFile: content,
          outputFile: translatedContent,
          sourceLang: source,
          targetLangs: [target],
          status: "COMPLETED",
          title: translatedContent.substring(0, 50),
        },
      });

      // Save the conversation history to the database
      await prisma.conversationHistory.create({
        data: {
          userId,
          messages: [
            { role: "user", content },
            { role: "bot", content: translatedContent },
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

export const translationJson = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req.user as any)?.id;
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

    // Build dynamic Zod schema based on content
    const contentObject =
      typeof content === "string" ? JSON.parse(content) : content;
    const dynamicSchema: ZodTypeAny = buildDynamicZodSchema(contentObject);

    // Build the system message
    let systemMessage =
      "You are to translate the values of the provided JSON object into the target language, keeping the keys unchanged. Respond only with the translated JSON object.";

    if (prompt) {
      systemMessage += ` Consider the following context: "${prompt}".`;
    }

    // Build the messages array
    messages.push(
      { role: "system", content: systemMessage },
      {
        role: "user",
        content: `Content to translate: ${JSON.stringify(contentObject)}`,
      },
      { role: "user", content: `Target language: "${target}"` }
    );

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // Generate AI response using Instructor-AI with streaming
    const responseStream = await instructorClientJson.chat.completions.create({
      messages: messages as any,
      model: "gpt-3.5-turbo",
      temperature: 0,
      stream: true,
      response_model: { schema: dynamicSchema, name: "json" } as any,
      // max_retries: 2,
    });

    let translatedContent = "";

    // Stream the response data to the client
    for await (const chunk of responseStream as AsyncIterable<any>) {
      // console.log("Chunk:", chunk);

      // Serialize the chunk to a string
      const chunkString = JSON.stringify(chunk);

      // Accumulate the translated content
      translatedContent = chunkString;

      // Format the chunk for SSE
      const sseFormattedChunk = `data: ${chunkString}\n\n`;

      // Write the formatted chunk to the response
      res.write(sseFormattedChunk);
    }

    // End the response when the stream is finished
    res.end();

    // Validate the translated content
    // let parsedTranslatedContent;
    // try {
    //   parsedTranslatedContent = dynamicSchema.parse(
    //     JSON.parse(translatedContent)
    //   );
    // } catch (validationError) {
    //   console.error(
    //     "Translated JSON does not match the expected schema:",
    //     validationError
    //   );
    //   // Optionally, handle schema validation errors
    // }

    let translationJob;

    if (translationJobId) {
      // Update the existing translation job
      translationJob = await prisma.translationJob.update({
        where: { id: translationJobId },
        data: {
          outputFile: translatedContent,
          status: "COMPLETED",
        },
      });

      // Update the conversation history for the existing translation job
      await prisma.conversationHistory.update({
        where: { id: conversationHistory?.id },
        data: {
          messages: {
            push: { role: "bot", content: translatedContent },
          },
        },
      });
    } else {
      // Save the translation job to the database
      translationJob = await prisma.translationJob.create({
        data: {
          userId,
          sourceFile: content,
          outputFile: translatedContent,
          sourceLang: source,
          targetLangs: [target],
          status: "COMPLETED",
          title: `Translation to ${target}`,
        },
      });

      // Save the conversation history to the database
      await prisma.conversationHistory.create({
        data: {
          userId,
          messages: [
            // { role: "system", content: systemMessage },
            {
              role: "user",
              content: content,
            },
            // { role: "user", content: `Target language: "${target}"` },
            { role: "bot", content: translatedContent },
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
      translationJob.id,
      ActionOutcome.SUCCESS
    );
  } catch (error) {
    console.error("Error in translationJson service:", error);
    res
      .status(500)
      .json({ error: "An error occurred during JSON translation." });

    // Log failed translation activity
    await logActivity(
      req,
      userId,
      ActionType.TRANSLATE,
      EntityType.TRANSLATION_JOB,
      translationJobId,
      ActionOutcome.FAILED
    );
  }
};

export const getTranslationJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req.user as any)?.id;

  try {
    const translationJobs = await prisma.translationJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true }, // Select only the id field
    });

    res.json({ translationJobs });
  } catch (error) {
    console.error("Error fetching translation jobs:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching translation jobs." });
  }
};

export const getTranslationHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  let translationJobId: string | undefined;

  if (typeof req.params.id === "string") {
    translationJobId = req.params.id;
  } else if (typeof req.query.id === "string") {
    translationJobId = req.query.id;
  }

  if (!translationJobId) {
    res.status(400).json({ error: "Translation job ID is required." });
    return;
  }

  try {
    const translationHistory = await prisma.conversationHistory.findMany({
      where: { translationJobId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ translationHistory });
  } catch (error) {
    console.error("Error fetching translation history:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching translation history." });
  }
};
