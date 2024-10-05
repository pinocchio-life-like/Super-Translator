import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { generateAccessToken } from "../services/generateTokens"; // Correct the import path if necessary

// Function to validate the refresh token
export const validateRefreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret"
    );
    const storedToken = await prisma.refreshToken.findFirst({
      where: { token, expired: false },
    });
    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

// Define refreshController
export const refreshController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken; // Assuming the refresh token is sent as an HTTP-only cookie

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  try {
    const decoded = await validateRefreshToken(refreshToken);
    const userId = (decoded as any).id;

    // Generate new access token
    const accessToken = generateAccessToken(userId);

    // Send new access token with success message
    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};
