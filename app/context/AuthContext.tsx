"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axios"; // Import your custom axios instance
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  const fetchUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await axiosInstance.get("/api/users/me");
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);

        // Set the Authorization header for future requests
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.accessToken}`;

        // Set user directly from response
        setUser(data.user);
        setIsAuthenticated(true);

        // Refresh the page after login
        window.location.reload();
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    router.push("/");
  };

  useEffect(() => {
    setLogoutFunction(logout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    // While user data is being fetched
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
