import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import prisma from '../config/prisma';

const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '1h',
  });
};

// Middleware to verify access token and refresh it if expired
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.cookies.refreshToken;

  if (!token) {
    res.status(401).send('Access token missing');
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', async (err: VerifyErrors | null, user: any) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        // If access token expired, check refresh token
        if (!refreshToken) {
          res.status(403).send('Refresh token missing');
          return;
        }

        const storedToken = await prisma.refreshToken.findFirst({ where: { token: refreshToken } });

        if (!storedToken) {
          res.status(403).send('Invalid refresh token');
          return;
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', (refreshErr: VerifyErrors | null, decoded: any) => {
          if (refreshErr) {
            res.status(403).send('Invalid or expired refresh token');
            return;
          }

          // Generate a new access token
          const newAccessToken = generateAccessToken(decoded.id);

          // Optionally, set the new access token in the response header
          res.setHeader('Authorization', `Bearer ${newAccessToken}`);

          // Attach the new access token to the request object and continue
          req.headers['authorization'] = `Bearer ${newAccessToken}`;
          req.user = decoded;
          next(); // Continue with the original request
        });
      } else {
        // Invalid token for reasons other than expiration
        res.status(403).send('Invalid token');
        return;
      }
    } else {
      // Token is valid, continue the request
      req.user = user;
      next();
    }
  });
};
