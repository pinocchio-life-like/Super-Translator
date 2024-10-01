import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import prisma from '../config/prisma';

const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '1h',
  });
};

// CHeck if the user is authenticated
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err: VerifyErrors | null, user: any) => {
    if (err) return res.sendStatus(403); // Token invalid or expired
    req.user = user;
    next();
  });
};

// To refresh the access token using refresh token if expired
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const storedToken = await prisma.refreshToken.findFirst({ where: { token: refreshToken } });

    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }

      const accessToken = generateAccessToken(decoded.id);

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error('Error verifying refresh token', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
