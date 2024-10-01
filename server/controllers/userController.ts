import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { logActivity } from '../utils/activityLogger';
import { ActionType, EntityType } from '../types/enums'; 

const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '1h',
  });
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', {
    expiresIn: '7d', 
  });
};

// Save refresh token to the database
const saveRefreshToken = async (userId: string, token: string) => {
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
    },
  });
};

// Clear existing refresh tokens for a user
const clearRefreshTokens = async (userId: string) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });
};

// Set refresh token as an HTTP-only cookie
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
    sameSite: 'strict', 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Signup controller
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
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

    // Clear any existing refresh tokens for this user and save the new one
    await clearRefreshTokens(newUser.id);
    await saveRefreshToken(newUser.id, refreshToken);

    // Set refresh token in an HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Log successful signup activity
    await logActivity(req, newUser.id, ActionType.CREATE, EntityType.USER, newUser.id);

    res.status(201).json({ message: 'User created', accessToken });
  } catch (error) {
    console.error('Error creating user', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        res.status(400).json({ message: 'Invalid email or password' });
        return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Clear existing refresh tokens and save the new one
    await clearRefreshTokens(user.id);
    await saveRefreshToken(user.id, refreshToken);

    // Set refresh token in an HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Log successful login activity
    await logActivity(req, user.id, ActionType.LOGIN, EntityType.USER, user.id);

    res.status(200).json({ message: 'Login successful', accessToken });
  } catch (error) {
    console.error('Error logging in', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
