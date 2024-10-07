import React, { useEffect, useState } from "react";
import { useChatHistory } from "../hooks/useChatHistory";
import { useStreamingFetch } from "../hooks/useStreamingFetch";
import { ChatHistory } from "./ChatHistory";
import { FileUploadAndPromptForm } from "./FileUploadAndPromptForm";
import axiosInstance from "../utils/axios";

interface SuperTranslatorProps {
  id?: string;
}

const SuperTranslator: React.FC<SuperTranslatorProps> = ({ id }) => {
  const { chatHistory, addMessage, clearChatHistory, updateLastBotMessage } =
    useChatHistory();
  const { streamingFetch } = useStreamingFetch();
  const [formHeight, setFormHeight] = useState<number>(0);
  const [fileExtension, setFileExtension] = useState<string>("");

  const handleFormSubmit = async (formDataObj: any) => {
    // Include translationJobId if it exists
    if (id) {
      formDataObj.translationJobId = id;
    }

    addMessage({
      role: "user",
      content: `${formDataObj.content}\n\n${formDataObj.prompt}`,
    });

    try {
      let receivedTranslationJobId = id;

      // Determine the correct endpoint based on the file extension
      const endpoint =
        fileExtension === "json"
          ? "/api/translate/translateJson" // Different route for JSON files
          : "/api/translate/translate"; // Default route for other file types

      await streamingFetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataObj),
        },
        (chunkValue: string) => {
          updateLastBotMessage(chunkValue, fileExtension);
        },
        // Handle the response headers to get the translationJobId
        async (response: Response) => {
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            receivedTranslationJobId = data.translationJobId;
          }
          return response.body!;
        }
      );

      // If there's no id and we received a new translationJobId, update the URL
      if (!id && receivedTranslationJobId) {
        // Update the URL without reloading the page
        window.history.pushState(
          null,
          "",
          `/translations/${receivedTranslationJobId}`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error appropriately
    }
  };

  useEffect(() => {
    const fetchTranslationJob = async () => {
      if (id) {
        // Clear chat history before fetching new data
        clearChatHistory();
        // Fetch existing translation job and conversation history
        const response = await axiosInstance.get(
          `/api/translate/translationHistory/${id}`
        );
        const data = response.data.translationHistory[0];
        // Update chat history with fetched data
        // Map roles appropriately
        data.messages.forEach((message: any) => {
          if (message.role === "system") return; // Skip system messages
          addMessage({
            role: message.role === "bot" ? "bot" : "user",
            content: message.content,
          });
        });
      }
    };

    fetchTranslationJob();
  }, [id]);

  return (
    <div className="relative flex flex-col items-center min-h-screen overflow-auto">
      {/* Chat History Section */}
      <ChatHistory chatHistory={chatHistory} formHeight={formHeight} />

      {/* File Upload and Prompt Form */}
      <FileUploadAndPromptForm
        onSubmit={handleFormSubmit}
        setFormHeight={setFormHeight}
        setFileExtension={setFileExtension}
      />
    </div>
  );
};

export default SuperTranslator;
