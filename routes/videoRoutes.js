import express from "express";
import { streamVideo } from "../controllers/videoController.js";

const router = express.Router();
router.get("/:filename", streamVideo);

export default router;
