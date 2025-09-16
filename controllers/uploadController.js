import fs from "fs";
import path from "path";

export const saveVideoMeta = async (req, res) => {
  try {
    const { title, description, uploaded_by } = req.body;
    const filename = req.file.filename;

    const dataDir = path.join(process.cwd(), "backend", "data");
    const dataFile = path.join(dataDir, "videos.json");

    // Ensure data directory exists
    fs.mkdirSync(dataDir, { recursive: true });

    // Initialize file if missing
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, "[]", "utf-8");
    }

    // Read existing entries
    const raw = fs.readFileSync(dataFile, "utf-8");
    let videos = [];
    try {
      videos = JSON.parse(raw);
      if (!Array.isArray(videos)) videos = [];
    } catch {
      videos = [];
    }

    const newEntry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
      title: title || null,
      description: description || null,
      filename,
      uploaded_by: uploaded_by || null,
      created_at: new Date().toISOString(),
    };

    videos.push(newEntry);
    fs.writeFileSync(dataFile, JSON.stringify(videos, null, 2), "utf-8");

    res.status(201).json({ success: true, video: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
};

export const saveVideoMetaJson = async (req, res) => {
  try {
    const { title, description, uploaded_by, cf_uid, hls_url, mp4_url, original_filename } = req.body || {};

    const dataDir = path.join(process.cwd(), "backend", "data");
    const dataFile = path.join(dataDir, "videos.json");
    fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, "[]", "utf-8");
    }

    const raw = fs.readFileSync(dataFile, "utf-8");
    let videos = [];
    try {
      videos = JSON.parse(raw);
      if (!Array.isArray(videos)) videos = [];
    } catch {
      videos = [];
    }

    const newEntry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
      title: title || null,
      description: description || null,
      uploaded_by: uploaded_by || null,
      storage: "cloudflare",
      cloudflare_uid: cf_uid || null,
      hls_url: hls_url || null,
      mp4_url: mp4_url || null,
      original_filename: original_filename || null,
      created_at: new Date().toISOString(),
    };

    videos.push(newEntry);
    fs.writeFileSync(dataFile, JSON.stringify(videos, null, 2), "utf-8");

    res.status(201).json({ success: true, video: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Metadata save failed" });
  }
};
