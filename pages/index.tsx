import React from "react";
import { useAuth } from "../app/context/AuthContext";
import GuestPage from "../app/components/GuestPage";
import SuperTranslator from "../app/components/SuperTranslator";
import "../app/globals.css";
import Layout from "../app/layout";
import { useRouter } from "next/router";

const HomeContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  if (user === undefined) {
    // Authentication state is loading
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    router.push("/auth/login");
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
