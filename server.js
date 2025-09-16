import express from "express";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cfRoutes from "./routes/cfRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/videos", videoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cf", cfRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
