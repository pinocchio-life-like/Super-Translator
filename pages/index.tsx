// pages/index.tsx
import React from "react";
import { useAuth } from "../app/context/AuthContext";
import GuestPage from "../app/components/GuestPage";
import SuperTranslator from "../app/components/SuperTranslator";
import "../app/globals.css";
import Layout from "../app/layout";

const HomeContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <GuestPage />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Layout>
        <SuperTranslator />
      </Layout>
    </div>
  );
};

const Home: React.FC = () => {
  return <HomeContent />;
};

export default Home;
