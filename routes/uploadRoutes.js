import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { saveVideoMeta, saveVideoMetaJson } from "../controllers/uploadController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "backend", "uploads", "videos");
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (_) {
      // swallow directory creation errors; multer will surface issues on write
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.single("video"), saveVideoMeta);
router.post("/metadata", saveVideoMetaJson);

export default router;
