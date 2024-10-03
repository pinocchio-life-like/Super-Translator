import { FaPaperclip } from 'react-icons/fa';
import { FaCircleArrowUp } from "react-icons/fa6";
import Layout from '../layout';
import { useEffect, useRef, useState } from 'react';
import axios from '../utils/axios';

const SuperTranslator = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isFileAttached, setIsFileAttached] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); 
  }, [prompt]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(truncateFileName(file.name));
      setIsFileAttached(true);
      readFileContent(file);
    } else {
      setFileName(null);
      setIsFileAttached(false);
      setFileContent('');
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log(text);
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
    const formData = new FormData(event.currentTarget);
    formData.append('content', fileContent);
    formData.append('prompt', prompt);
    console.log('Form Data:', Object.fromEntries(formData.entries()));
  
    try {
      const response = await axios.post('/api/translate/translate', Object.fromEntries(formData.entries()));
      const translation = response.data.translation;
      console.log('Translation:', translation);
      // Handle the response data here
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle the error here
    }
  };

  const handleTextareaKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
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
          <form onSubmit={handleSubmit}>
            {/* Language Selection Section */}
            {fileName && (
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {fileName}
              </span>
            )}
            <div className="w-full flex justify-between items-center px-2 mb-4">
              {/* From Language Selection */}
              <select name="source" className="text-gray-700 bg-transparent focus:outline-none">
                <option>Detect language</option>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>

              <span className="text-gray-500 mx-2">→</span>

              {/* To Language Selection */}
              <select name="target" className="text-gray-700 bg-transparent focus:outline-none">
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
                name="prompt"
                placeholder={isFileAttached ? "Describe how your file should be translated..." : "Please attach a file first"}
                className="flex-grow flex pb-1 bg-transparent text-gray-700 focus:outline-none px-1 max-h-36 overflow-auto resize-none"
                onInput={adjustTextareaHeight}
                rows={1}
                disabled={!isFileAttached}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleTextareaKeyPress}
              />

              {/* Send Button */}
              <button type="submit" className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <FaCircleArrowUp size={25} className="text-gray-500" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SuperTranslator;