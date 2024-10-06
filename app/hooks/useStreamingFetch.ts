// hooks/useStreamingFetch.ts

import customFetch from "../utils/fetch";

export const useStreamingFetch = () => {
  const streamingFetch = async (
    url: string,
    options: RequestInit,
    onData: (chunk: string) => void
  ) => {
    try {
      const response = await customFetch(url, options);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let receivedText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;
          onData(receivedText);
        }
      }
    } catch (error) {
      console.error("Error in streaming fetch:", error);
      throw error;
    }
  };

  return { streamingFetch };
};
