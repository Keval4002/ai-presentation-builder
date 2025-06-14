// server/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projects.js"

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

app.use("/api/projects", projectRoutes);


export default app;
