// server/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projects.js"
import themeRoutes from "./routes/themes.js"
import pptRoutes from "./routes/pptRoutes.js"
import { callLLM } from "./utils/geminiApi.js";
import testing from "./routes/ai.js"

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());



// Basic test route
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

app.get("/api/test-llm", async (req, res) => {
  try {
    const result = await callLLM({
      model: "gemini-2.0-flash",   // or your chosen model
      prompt: "Explain how AI works in a few words",
      apiType: "gemini"
    });

    res.status(200).json({ success: true, result });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/api/projects", projectRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/ppt", pptRoutes);
app.use("/api/ai", testing);

export default app;
