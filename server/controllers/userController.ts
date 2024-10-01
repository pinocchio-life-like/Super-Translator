import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import prisma from '../config/prisma';

const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '1h',
  });
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', {
    expiresIn: '7d', // Refresh token lives longer, e.g., 7 days
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

    res.status(201).json({ message: 'User created', accessToken, refreshToken });
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
    if (!user) {
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

    res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
  } catch (error) {
    console.error('Error logging in', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Refresh token controller
export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
  
      if (!storedToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
  
      jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', (err: VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
  
        const accessToken = generateAccessToken(decoded.id);
        res.status(200).json({ accessToken });
      });
    } catch (error) {
      console.error('Error refreshing token', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};
