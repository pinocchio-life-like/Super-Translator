// pages/protected/dashboard.tsx
import React from 'react';
import ProtectedRoute from '../../app/components/ProtectedRoute';
import { AuthProvider } from '../../app/context/AuthContext'; // Import AuthProvider

const Dashboard: React.FC = () => {
  return (
    <AuthProvider> {/* Wrap AuthProvider around the component */}
      <ProtectedRoute>
        <h1>Welcome to your Dashboard</h1>
        {/* Add your dashboard content here */}
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default Dashboard;
