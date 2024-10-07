import React, { useRef, useEffect } from "react";
import { FaPaperclip } from "react-icons/fa";
import { FaCircleArrowUp } from "react-icons/fa6";
import { useFileUpload } from "../hooks/useFileUpload";
import { usePrompt } from "../hooks/usePrompt";

interface FileUploadAndPromptFormProps {
  onSubmit: (formDataObj: any) => void;
  setFormHeight: (height: number) => void;
  setFileExtension: (fileExtension: string) => void;
}

export const FileUploadAndPromptForm: React.FC<
  FileUploadAndPromptFormProps
> = ({ onSubmit, setFormHeight, setFileExtension }) => {
  const {
    fileContent,
    fileName,
    isTextareaEnabled,
    handleFileChange,
    fileExtension,
    fileInputRef,
    resetFileInput,
  } = useFileUpload();

  const {
    prompt,
    setPrompt,
    textareaRef,
    adjustTextareaHeight,
    handleTextareaKeyPress,
  } = usePrompt();

  const formRef = useRef<HTMLDivElement>(null);

  if (fileExtension) {
    setFileExtension(fileExtension);
  }

  useEffect(() => {
    if (formRef.current) {
      setFormHeight(formRef.current.offsetHeight);
    }
  }, [setFormHeight]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const source = form.elements.namedItem("source") as HTMLSelectElement;
    const target = form.elements.namedItem("target") as HTMLSelectElement;

    const formDataObj = {
      content: fileContent,
      prompt,
      source: source.value,
      target: target.value,
    };

    onSubmit(formDataObj);
    setPrompt("");
    resetFileInput();
  };

  return (
    <div
      ref={formRef}
      className="w-full max-w-2xl border-gray-500 border shadow-sm rounded-lg px-4 py-2 mt-4 fixed bottom-2 bg-white"
    >
      <form onSubmit={handleSubmit}>
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

        <div className="w-full flex items-end py-2 pl-5 pr-2 border-gray-500 border rounded-md">
          <label
            htmlFor="file-upload"
            className="flex items-center cursor-pointer py-2"
          >
            <FaPaperclip size={20} className="text-gray-500 mr-2" />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".txt, .json"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>

          <textarea
            ref={textareaRef}
            name="prompt"
            placeholder={
              isTextareaEnabled
                ? "Describe how your file should be translated..."
                : "Please attach a file first"
            }
            className="flex-grow pb-1 bg-transparent text-gray-700 focus:outline-none px-1 max-h-36 overflow-auto resize-none"
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
  );
};
