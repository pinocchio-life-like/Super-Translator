// pages/auth/login.tsx
import React, { useEffect } from "react";
import { useAuth, AuthProvider } from "../../app/context/AuthContext"; // Ensure you use AuthProvider
import { useRouter } from "next/router";
import LoginForm from "../../app/components/LoginForm"; // Assume you have this component
import "../../app/globals.css";

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/"); // Redirect if already logged in
    }
  }, [isAuthenticated, router]);

  return (
    <>{!isAuthenticated ? <LoginForm /> : <p>Redirecting to dashboard...</p>}</>
  );
};

const LoginWithProvider: React.FC = () => {
  return (
    <AuthProvider>
      {" "}
      {/* Ensure AuthProvider is wrapping the entire page */}
      <LoginPage />
    </AuthProvider>
  );
};

export default LoginWithProvider;
