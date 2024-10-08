// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios";
import { useRouter } from "next/router";
import { setLogoutFunction } from "../utils/authUtils";

interface User {
  id: string;
  // Include other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post("/api/auth/login", {
        email,
        password,
      });
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        await fetchUser(); // Fetch user data after login
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    setLogoutFunction(logout);
  }, []);

  if (user === undefined) {
    // While user data is being fetched
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
