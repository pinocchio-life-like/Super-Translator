import { useState, useEffect, useRef } from "react";

interface Message {
  type: "user" | "bot";
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

  const updateLastBotMessage = (content: string) => {
    setChatHistory((prevChatHistory) => {
      if (prevChatHistory[prevChatHistory.length - 1]?.type === "bot") {
        const updatedHistory = [...prevChatHistory];
        updatedHistory[updatedHistory.length - 1].content = content;
        return updatedHistory;
      } else {
        return [...prevChatHistory, { type: "bot", content }];
      }
    });
  };

  return {
    chatHistory,
    addMessage,
    updateLastBotMessage,
    chatContainerRef,
  };
};
