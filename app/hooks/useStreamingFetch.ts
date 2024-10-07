import customFetch from "../utils/fetch";

export const useStreamingFetch = () => {
  const streamingFetch = async (
    url: string,
    options: RequestInit,
    onMessage: (receivedText: string, chunkValue: string) => void,
    onResponse?: (response: Response) => Promise<ReadableStream<Uint8Array>>
  ) => {
    try {
      const response = await customFetch(url, options);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      let reader: ReadableStreamDefaultReader<Uint8Array>;

      if (onResponse) {
        const stream = await onResponse(response);
        reader = stream.getReader();
      } else {
        const stream = response.body!;
        reader = stream.getReader();
      }

      const decoder = new TextDecoder("utf-8");
      let receivedText = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) {
          done = true;
          break;
        }
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          receivedText += chunkValue;
          onMessage(receivedText, chunkValue);
        }
      }
    } catch (error) {
      console.error("Error in streaming fetch:", error);
      throw error;
    }
  };

  return { streamingFetch };
};
