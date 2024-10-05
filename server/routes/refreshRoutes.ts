import express from "express";
import { refreshController } from "../controllers/refreshController";

const router = express.Router();

// Translation route
router.post("/accessToken", refreshController);

export default router;
