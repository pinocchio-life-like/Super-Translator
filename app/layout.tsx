import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleLogout = () => {
    console.log('Logged out');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Super Translator</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="flex-grow p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default Layout;
