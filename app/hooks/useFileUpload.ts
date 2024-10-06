import { useState, useRef } from "react";

export const useFileUpload = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTextareaEnabled, setIsTextareaEnabled] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const truncateFileName = (name: string) => {
    const maxLength = 20;
    const extension = name.split(".").pop();
    const baseName = name.substring(0, name.lastIndexOf("."));
    if (baseName.length > maxLength) {
      return `${baseName.substring(0, maxLength)}...${extension}`;
    }
    return name;
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(truncateFileName(file.name));
      readFileContent(file);
      setIsTextareaEnabled(true);
    } else {
      setFileName(null);
      setFileContent("");
      setIsTextareaEnabled(false);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    fileContent,
    fileName,
    isTextareaEnabled,
    handleFileChange,
    fileInputRef,
    resetFileInput,
  };
};
