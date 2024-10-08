import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { logActivity } from "../utils/activityLogger";
import { ActionType, EntityType } from "../types/enums";
import {
  generateAccessToken,
  generateRefreshToken,
  // clearRefreshTokens,
  saveRefreshToken,
  setRefreshTokenCookie,
} from "../services/generateTokens";

// Signup controller
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    await saveRefreshToken(newUser.id, refreshToken);

    // Set refresh token in an HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Log successful signup activity
    await logActivity(
      req,
      newUser.id,
      ActionType.CREATE,
      EntityType.USER,
      newUser.id
    );

    res.status(201).json({ message: "User created", accessToken });
  } catch (error) {
    console.error("Error creating user", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await saveRefreshToken(user.id, refreshToken);

    // Set refresh token in an HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Log successful login activity
    await logActivity(req, user.id, ActionType.LOGIN, EntityType.USER, user.id);

    // Exclude the password field from the user object
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: userWithoutPassword, // Include user data in the response
    });
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
