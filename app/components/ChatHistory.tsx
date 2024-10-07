import React from "react";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
  formHeight: number;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  formHeight,
}) => {
  return (
    <div
      className="w-full max-w-2xl px-4 py-2 flex-grow overflow-auto mb-1"
      style={{ paddingBottom: `${formHeight}px` }}
    >
      <div className="mb-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Translate .docx, .pdf, .txt files</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className="mb-4">
              <div
                className={`inline-block p-2 rounded-lg ${
                  msg.role === "user" ? "bg-gray-100" : "bg-white"
                }`}
              >
                <p
                  className="text-left"
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\n/g, "<br>"),
                  }}
                ></p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
