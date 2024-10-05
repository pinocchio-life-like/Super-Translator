import express from "express";
import { translation } from "../controllers/translationController";

const router = express.Router();

// Translation route
router.post("/translate", translation);

export default router;
