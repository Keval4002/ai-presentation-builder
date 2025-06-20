import express from "express";
import { pool } from "../db/pool.js";
import { triggerAIGeneration } from "../services/aiGeneratorService.js";

const router = express.Router();

// Get active themes
router.get("/", async (req, res) => {
  try {
    const themes = await pool.query(
      `SELECT slug, name, description, primary_color, secondary_color, background_color, text_color, heading_font
       FROM themes
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );
    res.json(themes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Receive PPT details, save to DB, trigger AI generation
router.post("/:slug/details", async (req, res) => {
  const { slug } = req.params;
  const { mode, slideCount, prompt, outline } = req.body;

  try {
    const randomProjectId = Math.floor(Math.random() * 10000);

    const requestResult = await pool.query(
      `INSERT INTO ppt_requests (project_id, theme_slug, mode, slide_count, prompt, outline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [randomProjectId, slug, mode, slideCount, prompt || null, outline && outline.length > 0 ? outline : null]
    );

    const requestId = requestResult.rows[0].id;

    const pptProjectResult = await pool.query(
      `INSERT INTO ppt_projects (request_id, status) VALUES ($1, 'pending') RETURNING id`,
      [requestId]
    );

    const pptProjectId = pptProjectResult.rows[0].id;
    console.log(`Project created with DB ID: ${pptProjectId}. This ID will be sent to the frontend.`);

    triggerAIGeneration({
      pptProjectId,
      themeSlug: slug,
      mode,
      slideCount,
      prompt,
      outline,
      requestId,
    });

    res.status(200).json({
      message: "PPT details saved and AI generation started",
      projectId: pptProjectId,
    });

  } catch (err) {
    console.error("Error saving PPT details:", err);
    res.status(500).json({ error: "Failed to save PPT details" });
  }
});

// Get last request
router.get("/last-request", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT project_id, theme_slug, mode, slide_count, prompt, outline, created_at FROM ppt_requests ORDER BY created_at DESC LIMIT 1`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No PPT request found." });
    }
    res.status(200).json({ lastPptRequest: result.rows[0] });
  } catch (err) {
    console.error("Error fetching last PPT request:", err);
    res.status(500).json({ error: "Failed to fetch last PPT request" });
  }
});

// Get project by ID
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, status, slides, updated_at FROM ppt_projects WHERE id = $1`,
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    const project = result.rows[0];

    const slides = project.slides || null;

    res.json({
      id: project.id,
      status: project.status,
      slides: slides, // Use the already-parsed object
      updated_at: project.updated_at,
    });

  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;