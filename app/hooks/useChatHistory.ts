import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const addMessage = (message: Message) => {
    setChatHistory((prevChatHistory) => [...prevChatHistory, message]);
  };

  const updateLastBotMessage = (content: string, fileExtension?: string) => {
    setChatHistory((prevChatHistory) => {
      if (
        prevChatHistory.length > 0 &&
        prevChatHistory[prevChatHistory.length - 1].role === "bot"
      ) {
        const updatedHistory = [...prevChatHistory];
        if (fileExtension === "json") {
          // For JSON files, replace the content
          updatedHistory[updatedHistory.length - 1].content = content;
        } else {
          // For other files, append the content
          updatedHistory[updatedHistory.length - 1].content += content;
        }
        return updatedHistory;
      } else {
        return [...prevChatHistory, { role: "bot", content }];
      }
    });
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };

  return {
    chatHistory,
    addMessage,
    updateLastBotMessage,
    clearChatHistory,
    chatContainerRef,
  };
};
