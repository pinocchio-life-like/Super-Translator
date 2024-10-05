import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { Response } from "express";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "10s",
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    {
      expiresIn: "7d",
    }
  );
};

export const saveRefreshToken = async (userId: string, token: string) => {
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
    },
  });
};

export const clearRefreshTokens = async (userId: string) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
