import Link from 'next/link';
import React from 'react';

const GuestPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome, Guest!</h1>
        <div className="flex justify-center gap-4 mb-6">
          <Link href="/auth/login">
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Login
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestPage;
