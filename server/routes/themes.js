// filepath: server/routes/themes.js
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

// FIXED: Added missing slash to route path
// Receive PPT details, save to DB, trigger AI generation
router.post("/:slug/details", async (req, res) => {
  const { slug } = req.params;
  const { mode, slideCount, prompt, outline } = req.body;

  try {
    console.log(`🎨 Creating new project with theme: ${slug}`);
    
    const randomProjectId = Math.floor(Math.random() * 10000);

    const requestResult = await pool.query(
      `INSERT INTO ppt_requests (project_id, theme_slug, mode, slide_count, prompt, outline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [randomProjectId, slug, mode, slideCount, prompt || null, outline && outline.length > 0 ? outline : null]
    );

    const requestId = requestResult.rows[0].id;
    console.log(`📝 Request created with ID: ${requestId}`);

    const pptProjectResult = await pool.query(
      `INSERT INTO ppt_projects (request_id, status) VALUES ($1, 'pending') RETURNING id`,
      [requestId]
    );

    const pptProjectId = pptProjectResult.rows[0].id;
    console.log(`🚀 PPT Project created with ID: ${pptProjectId}. This ID will be sent to the frontend.`);

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
    console.log(`📊 Fetching project ${projectId}`);
    
    // Step 1: Get the project data and its request_id
    const projectResult = await pool.query(
      `SELECT id, status, slides, updated_at, request_id FROM ppt_projects WHERE id = $1`,
      [projectId]
    );
    if (projectResult.rows.length === 0) {
      console.error(`❌ Project ${projectId} not found`);
      return res.status(404).json({ message: "Project not found." });
    }
    const project = projectResult.rows[0];
    console.log(`📊 Project ${projectId} status: ${project.status}`);

    // Step 2: Use the request_id to get the theme_slug
    const requestResult = await pool.query(
      `SELECT theme_slug FROM ppt_requests WHERE id = $1`,
      [project.request_id]
    );
    if (requestResult.rows.length === 0) {
      console.error(`❌ No request found for project ${projectId}`);
      throw new Error(`Could not find original request for project ID ${projectId}`);
    }
    const themeSlug = requestResult.rows[0].theme_slug;
    
    // Step 3: Use the theme_slug to get the full theme details
    const themeResult = await pool.query(
      `SELECT background_color, primary_color, secondary_color, text_color, heading_font, body_font
       FROM themes WHERE slug = $1`,
      [themeSlug]
    );
    if (themeResult.rows.length === 0) {
        console.error(`❌ Theme not found: ${themeSlug}`);
        throw new Error(`Theme with slug "${themeSlug}" not found.`);
    }
    const theme = themeResult.rows[0];

    console.log(`✅ Successfully fetched project ${projectId}`);

    // Step 4: Combine project data and theme data into a single response
    res.json({
      ...project, // Contains id, status, slides, etc.
      theme: theme // Nests all theme properties under a 'theme' key
    });

  } catch (error) {
    console.error("Error fetching project:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;