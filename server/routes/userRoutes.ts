import express from "express";
import { getMe } from "../controllers/userController";

const router = express.Router();

// Get User Profile
router.get("/me", getMe);

export default router;
