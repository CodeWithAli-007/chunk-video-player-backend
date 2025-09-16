import express from "express";
import { getDirectUploadUrl, verifyCloudflare, copyFromUrl } from "../controllers/cloudflareController.js";

const router = express.Router();

router.post("/stream/direct-upload", getDirectUploadUrl);
router.get("/stream/verify", verifyCloudflare);
router.post("/stream/copy", copyFromUrl);

export default router;


