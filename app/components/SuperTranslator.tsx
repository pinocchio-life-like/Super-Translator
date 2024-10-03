import { FaPaperclip } from 'react-icons/fa';
import { FaCircleArrowUp } from "react-icons/fa6";
import Layout from '../layout';
import { useEffect, useRef, useState } from 'react';

const SuperTranslator = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); 
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setFileName(truncateFileName(file.name));
    }
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

  return (
    <Layout>
      <div className="relative min-h-calc-100vh-16 flex flex-col justify-between items-center">
        {/* Supported file formats description */}
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-gray-600">
            <p>translate .docx .pdf .txt</p>
          </div>
        </div>

        {/* Other content can go here */}

        {/* File Upload Section */}
        <div className="w-full max-w-2xl border-gray-500 border-[1px] shadow-sm rounded-lg px-4 py-2">
        {/* Language Selection Section */}
        {fileName && (
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {fileName}
              </span>
            )}
        <div className="w-full flex justify-between items-center px-2 mb-4">
            {/* From Language Selection */}
            <select className="text-gray-700 bg-transparent focus:outline-none">
            <option>Detect language</option>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            </select>

            <span className="text-gray-500 mx-2">→</span>

            {/* To Language Selection */}
            <select className="text-gray-700 bg-transparent focus:outline-none">
            <option>German</option>
            <option>Chinese</option>
            <option>Japanese</option>
            <option>Arabic</option>
            </select>
        </div>

        {/* File Upload Section */}
        <div className="w-full flex items-end py-2 pl-5 pr-2 border-gray-500 border-[1px] rounded-md">
            {/* File Attachment Section */}
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
            />
            </label>

            {/* Text Input Section */}
            <textarea
                ref={textareaRef}
                placeholder="Describe how your file should be translated..."
                className="flex-grow flex pb-1 bg-transparent text-gray-700 focus:outline-none px-1 max-h-36 overflow-auto resize-none"
                onInput={adjustTextareaHeight}
                rows={1}
            />

            {/* Send Button */}
            <button className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <FaCircleArrowUp size={25} className="text-gray-500" />
            </button>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperTranslator;