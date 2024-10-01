import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes'; 
import prisma from './config/prisma'; // Prisma client

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy' });
});

// User routes
app.use('/api/users', userRoutes);

// Gracefully disconnect Prisma when the app is terminated
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

export default app;
