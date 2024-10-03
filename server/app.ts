import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes'; 
import translationRoutes from './routes/translationRoutes'; 
import prisma from './config/prisma'; 
import { authenticateToken } from './utils/authMiddleware';

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: ['https://super-translator-demo.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy' });
});

// User routes
app.use('/api/users', userRoutes);

// Translation routes
app.use('/api/translate',authenticateToken, translationRoutes);

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Gracefully disconnect Prisma when the app is terminated
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

export default app;
