import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useChatHistory } from "../../app/hooks/useChatHistory";
import { useStreamingFetch } from "../../app/hooks/useStreamingFetch";
import { FaCircleArrowUp } from "react-icons/fa6";

interface Props {
  initialChatHistory: any[];
}

const DynamicPage: React.FC<Props> = ({ initialChatHistory }) => {
  const router = useRouter();
  const { id } = router.query;
  const { chatHistory, addMessage, updateLastBotMessage, chatContainerRef } =
    useChatHistory();
  const { streamingFetch } = useStreamingFetch();

  useEffect(() => {
    // Initialize chat history with the initial data
    initialChatHistory.forEach((msg) => addMessage(msg));
  }, [initialChatHistory, addMessage]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const source = form.elements.namedItem("source") as HTMLSelectElement;
    const target = form.elements.namedItem("target") as HTMLSelectElement;
    const prompt = form.elements.namedItem("prompt") as HTMLTextAreaElement;

    const formDataObj: { [key: string]: string } = {};
    formDataObj["content"] = ""; // Add the content if necessary
    formDataObj["prompt"] = prompt.value;
    formDataObj["source"] = source.value;
    formDataObj["target"] = target.value;

    addMessage({ type: "user", content: prompt.value });

    try {
      await streamingFetch(
        `/api/translate/translate/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataObj),
        },
        (receivedText) => {
          updateLastBotMessage(receivedText);
        }
      );

      prompt.value = "";
    } catch (error) {
      console.error("Error submitting form:", error);
      // Add error handling to display a message to the user
    }
  };

  return (
    <div
      ref={chatContainerRef}
      className="relative flex flex-col justify-between items-center min-h-screen overflow-auto"
    >
      {/* Chat History Section */}
      <div className="w-full max-w-2xl border-gray-500 rounded-lg px-4 py-2 flex-grow overflow-auto mb-1">
        <div className="mb-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>Translate .docx, .pdf, .txt files</p>
            </div>
          ) : (
            <div>
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.type === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      msg.type === "user" ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Upload and Prompt Form */}
      <div className="w-full max-w-2xl border-gray-500 border-[1px] shadow-sm rounded-lg px-4 py-2 mt-4 fixed bottom-2 bg-white">
        <form onSubmit={handleSubmit}>
          {/* Language Selection Section */}
          <div className="w-full flex justify-between items-center px-2 mb-4">
            <select
              name="source"
              className="text-gray-700 bg-transparent focus:outline-none"
            >
              <option>Detect language</option>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>

            <span className="text-gray-500 mx-2">→</span>

            <select
              name="target"
              className="text-gray-700 bg-transparent focus:outline-none"
            >
              <option>German</option>
              <option>Chinese</option>
              <option>Japanese</option>
              <option>Arabic</option>
              <option>English</option>
            </select>
          </div>

          {/* Prompt Section */}
          <div className="w-full flex items-end py-2 pl-5 pr-2 border-gray-500 border-[1px] rounded-md">
            <textarea
              name="prompt"
              placeholder="Describe how your file should be translated..."
              className="flex-grow flex pb-1 bg-transparent text-gray-700 focus:outline-none px-1 max-h-36 overflow-auto resize-none"
              rows={1}
            />

            <button
              type="submit"
              className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaCircleArrowUp size={25} className="text-gray-500" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  // Fetch chat history based on the ID
  const res = await fetch(`https://api.example.com/chat/${id}`);
  const initialChatHistory = await res.json();

  return {
    props: {
      initialChatHistory,
    },
  };
};

export default DynamicPage;
