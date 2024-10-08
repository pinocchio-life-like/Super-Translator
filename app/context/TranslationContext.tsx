"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios";

interface TranslationJob {
  id: string;
  title: string;
}

interface TranslationContextType {
  data: {
    translationJobs: TranslationJob[];
  };
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export const useTranslationJobs = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslation must be used within an TranslationProvider"
    );
  }
  return context;
};

interface TranslationProviderProps {
  children: React.ReactNode;
  id: string; // Add id as a prop
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  id,
}) => {
  const [translationJobs, setTranslationJobs] = useState<{
    translationJobs: TranslationJob[];
  }>({
    translationJobs: [],
  });
  const [loading, setLoading] = useState<boolean>(true); // New state for loading

  useEffect(() => {
    const fetchTranslationJobs = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await axios.get(
            `http://localhost:5000/api/translate/translationJobs?id=${id}`
          );
          setTranslationJobs(response.data);
        }
      } catch (error) {
        console.error("Error fetching translation jobs:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchTranslationJobs();
  }, [id]); // Add id as a dependency

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while fetching data
  }

  return (
    <TranslationContext.Provider value={{ data: translationJobs }}>
      {children}
    </TranslationContext.Provider>
  );
};
