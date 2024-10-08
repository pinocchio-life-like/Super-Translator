import express from "express";
import { signup, login } from "../controllers/authController";

const router = express.Router();

// User registration
router.post("/signup", signup);

// User login
router.post("/login", login);

export default router;
