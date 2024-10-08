// app/context/TranslationContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios";
import { useAuth } from "./AuthContext"; // Import useAuth

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
      "useTranslationJobs must be used within a TranslationProvider"
    );
  }
  return context;
};

interface TranslationProviderProps {
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [translationJobs, setTranslationJobs] = useState<{
    translationJobs: TranslationJob[];
  }>({
    translationJobs: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranslationJobs = async () => {
      try {
        if (user) {
          const response = await axios.get(
            `/api/translate/translationJobs?id=${user.id}`
          );
          setTranslationJobs(response.data);
        }
      } catch (error) {
        console.error("Error fetching translation jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslationJobs();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <TranslationContext.Provider value={{ data: translationJobs }}>
      {children}
    </TranslationContext.Provider>
  );
};
