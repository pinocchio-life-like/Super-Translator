import { Request, Response } from "express";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";

// GetMe controller
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not defined");
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, jwtSecret);
    const userId = decoded.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error("Error fetching user", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
