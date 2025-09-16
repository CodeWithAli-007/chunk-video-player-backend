import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

dotenv.config();

export const getDirectUploadUrl = async (req, res) => {
  try {
    const { title, description } = req.body || {};
    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_STREAM_API_TOKEN;

    if (!accountId || !apiToken) {
      return res.status(500).json({ success: false, error: "Cloudflare credentials not configured" });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta: { title, description },
        }),
      }
    );

    let json;
    try {
      json = await response.json();
    } catch (_) {
      const text = await response.text();
      return res.status(502).json({ success: false, status: response.status, error: "Invalid JSON from Cloudflare", body: text?.slice(0, 500) });
    }

    if (!response.ok || !json?.success) {
      return res.status(502).json({ success: false, status: response.status, error: json?.errors || json?.messages || "Failed to get direct upload URL", raw: json });
    }

    const { uploadURL, uid } = json.result || {};
    return res.status(200).json({ success: true, uploadURL, uid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to request Cloudflare upload URL" });
  }
};

export const verifyCloudflare = async (_req, res) => {
  try {
    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_STREAM_API_TOKEN;
    if (!accountId || !apiToken) {
      return res.status(200).json({ configured: false, message: "Missing CF_ACCOUNT_ID or CF_STREAM_API_TOKEN" });
    }
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${apiToken}` },
    });
    const json = await response.json().catch(async () => ({ text: await response.text() }));
    return res.status(200).json({ configured: true, httpStatus: response.status, ok: response.ok, body: json });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ configured: false, error: String(err) });
  }
};

export const copyFromUrl = async (req, res) => {
  try {
    const accountId = process.env.CF_ACCOUNT_ID;
    const apiToken = process.env.CF_STREAM_API_TOKEN;
    const { url, title, description, uploaded_by } = req.body || {};

    if (!accountId || !apiToken) {
      return res.status(500).json({ success: false, error: "Cloudflare credentials not configured" });
    }
    if (!url) {
      return res.status(400).json({ success: false, error: "Missing 'url' in body" });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/copy`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, meta: { title, description } }),
      }
    );

    const json = await response.json().catch(async () => ({ text: await response.text() }));
    if (!response.ok || !json?.success) {
      return res.status(502).json({ success: false, status: response.status, error: json?.errors || json, raw: json });
    }

    const { uid } = json.result || {};

    // Save minimal metadata locally
    const dataDir = path.join(process.cwd(), "backend", "data");
    const dataFile = path.join(dataDir, "videos.json");
    fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");
    let videos = [];
    try {
      videos = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
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
      cloudflare_uid: uid || null,
      source_url: url,
      created_at: new Date().toISOString(),
    };
    videos.push(newEntry);
    fs.writeFileSync(dataFile, JSON.stringify(videos, null, 2), "utf-8");

    return res.status(201).json({ success: true, uid, video: newEntry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Failed to create copy from URL" });
  }
};


