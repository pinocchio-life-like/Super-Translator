import { FaPaperclip } from 'react-icons/fa';
import { FaCircleArrowUp } from "react-icons/fa6";
import Layout from '../layout';

const SuperTranslator = () => {
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
        <div className="w-full max-w-2xl border-gray-500 border-[1px] shadow-sm rounded-full flex items-center py-2 pl-5 pr-2">
        {/* File Attachment Section */}
        <label
            htmlFor="file-upload"
            className="flex items-center cursor-pointer"
        >
            <FaPaperclip size={20} className="text-gray-500 mr-2" />
            <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".docx,.pdf,.txt"
            />
        </label>

        {/* Text Input Section */}
        <input
            type="text"
            placeholder="Describe how your file should be translated..."
            className="flex-grow bg-transparent text-gray-700 focus:outline-none px-4"
        />

        {/* Send Button */}
        <button className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <FaCircleArrowUp size={25} className="text-gray-500" />
        </button>
        </div>
      </div>
    </Layout>
  );
};

export default SuperTranslator;