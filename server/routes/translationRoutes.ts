import express from "express";
import {
  translation,
  translationJson,
  getTranslationJobs,
  getTranslationHistory,
} from "../controllers/translationController";

const router = express.Router();

// Translation route
router.post("/translate", translation);

// Translate Json route
router.post("/translateJson", translationJson);

// Get User Translation History route
router.get("/translationJobs", getTranslationJobs);

// Get User Translation History route
router.get("/translationHistory/:id", getTranslationHistory);

export default router;
