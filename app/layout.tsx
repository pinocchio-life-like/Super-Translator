import React from 'react';
import { useAuth } from './context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-white text-black h-16 flex items-center justify-between px-6 shadow-sm">
        <h1 className="text-xl font-semibold">Super Translator</h1>
        <div className="relative">
          <button
            onClick={handleLogout}
            className="focus:outline-none hover:bg-gray-200 p-2"
          >
            logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 min-h-calc-100vh-16">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100">
          <nav className="mt-4">
            <ul>
              <li className="px-6 py-2 hover:bg-gray-200">
                <a href="#" className="flex items-center">
                  <span className="ml-2">Chat 1</span>
                </a>
              </li>
              <li className="px-6 py-2 hover:bg-gray-200">
                <a href="#" className="flex items-center">
                  <span className="ml-2">Chat 1</span>
                </a>
              </li>
              <li className="px-6 py-2 hover:bg-gray-200">
                <a href="#" className="flex items-center">
                  <span className="ml-2">Chat 1</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;