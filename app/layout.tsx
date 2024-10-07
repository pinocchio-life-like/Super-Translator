"use client";

import React from "react";
import { useTranslationJobs } from "./context/TranslationContext";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

interface TranslationJob {
  id: string;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const { data } = useTranslationJobs();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full bg-white text-black h-16 flex items-center justify-between px-6 shadow-sm fixed top-0 left-0 right-0 z-10">
        <h1 className="text-xl font-semibold">Super Translator</h1>
        <div className="relative">
          <button
            onClick={logout}
            className="focus:outline-none hover:bg-gray-200 p-2"
          >
            logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-[#F9F9F9] fixed top-16 bottom-0 left-0 z-10 overflow-auto">
          <nav className="mt-4">
            <ul>
              {data.translationJobs.map((job: TranslationJob) => (
                <li key={job.id} className="px-6 py-2 hover:bg-gray-200">
                  <Link
                    href={`/translations/${job.id}`}
                    className="flex items-center"
                  >
                    <span className="ml-2">
                      {job.title.substring(0, 20)}...
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-grow p-2 ml-64 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
