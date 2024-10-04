import { FaPaperclip } from 'react-icons/fa';
import { FaCircleArrowUp } from 'react-icons/fa6';
import Layout from '../layout';
import { useEffect, useRef, useState } from 'react';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

const SuperTranslator = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]); // Chat history state
  const [isTextareaEnabled, setIsTextareaEnabled] = useState<boolean>(false);
  const [formHeight, setFormHeight] = useState<number>(0);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  useEffect(() => {
    if (formRef.current) {
      setFormHeight(formRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(truncateFileName(file.name));
      readFileContent(file);
      setIsTextareaEnabled(true);
    } else {
      setFileName(null);
      setFileContent('');
      setIsTextareaEnabled(false);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  };

  const truncateFileName = (name: string) => {
    const maxLength = 20;
    const extension = name.split('.').pop();
    const baseName = name.substring(0, name.lastIndexOf('.'));
    if (baseName.length > maxLength) {
      return `${baseName.substring(0, maxLength)}...${extension}`;
    }
    return name;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const source = form.elements.namedItem('source') as HTMLSelectElement;
    const target = form.elements.namedItem('target') as HTMLSelectElement;
  
    // Create a plain object from FormData
    const formDataObj: { [key: string]: string } = {};
    formDataObj['content'] = fileContent;
    formDataObj['prompt'] = prompt;
    formDataObj['source'] = source.value;
    formDataObj['target'] = target.value;
  
    // Add the user input to chat history
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      { type: 'user', content: prompt },
    ]);
  
    try {
      const response = await fetch('http://localhost:5000/api/translate/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Process the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let receivedText = '';
  
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;
  
          // Update the chat history with the received chunk
          setChatHistory((prevChatHistory) => {
            // Check if the last message is from 'bot' and update it
            if (prevChatHistory[prevChatHistory.length - 1]?.type === 'bot') {
              const updatedHistory = [...prevChatHistory];
              updatedHistory[updatedHistory.length - 1].content = receivedText;
              return updatedHistory;
            } else {
              // Add a new 'bot' message
              return [...prevChatHistory, { type: 'bot', content: receivedText }];
            }
          });
        }
      }
  
      // Clear form inputs
      setFileContent('');
      setFileName(null);
      setPrompt('');
  
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Add error handling to display a message to the user
    }
  };

  const handleTextareaKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
      <div ref={chatContainerRef} className="relative flex flex-col justify-between items-center min-h-screen overflow-auto">
        {/* Chat History Section */}
        <div
          className="w-full max-w-2xl border-gray-500 rounded-lg px-4 py-2 flex-grow overflow-auto mb-1"
          style={{ marginBottom: `${formHeight}px` }}
        >
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
                    className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        msg.type === 'user' ? 'bg-gray-100' : 'bg-white'
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
        <div
          ref={formRef}
          className="w-full max-w-2xl border-gray-500 border-[1px] shadow-sm rounded-lg px-4 py-2 mt-4 fixed bottom-2 bg-white"
        >
          <form onSubmit={handleSubmit}>
            {/* Language Selection Section */}
            {fileName && (
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {fileName}
              </span>
            )}
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

            {/* File Upload Section */}
            <div className="w-full flex items-end py-2 pl-5 pr-2 border-gray-500 border-[1px] rounded-md">
              <label
                htmlFor="file-upload"
                className="flex items-center cursor-pointer py-2"
              >
                <FaPaperclip size={20} className="text-gray-500 mr-2" />
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".docx,.pdf,.txt"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>

              <textarea
                ref={textareaRef}
                name="prompt"
                placeholder={
                  isTextareaEnabled
                    ? 'Describe how your file should be translated...'
                    : 'Please attach a file first'
                }
                className="flex-grow flex pb-1 bg-transparent text-gray-700 focus:outline-none px-1 max-h-36 overflow-auto resize-none"
                onInput={adjustTextareaHeight}
                rows={1}
                disabled={!isTextareaEnabled}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleTextareaKeyPress}
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

export default SuperTranslator;
