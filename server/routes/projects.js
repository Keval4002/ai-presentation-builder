import express from "express";
import { pool } from "../db/pool.js";
// fetch is no longer needed for cover generation
// import fetch from "node-fetch"; 
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// --- UPGRADED ---
// Replaced the Pollinations functions with a self-contained SVG generator.
// This function creates a clean, reliable, and theme-based cover image instantly.

/**
 * Generates a beautiful, programmatic SVG cover image based on the presentation theme and title.
 * @param {string} title - The title of the presentation.
 * @param {object} theme - The theme object containing colors.
 * @returns {string} A data URL for the generated SVG image.
 */
async function generateCoverImageSVG(title, theme) {
    // Sanitize colors and provide defaults
    const color1 = theme.primary_color || '#3B82F6';
    const color2 = theme.secondary_color || '#8B5CF6';
    const textColor = theme.text_color || '#FFFFFF';

    // Simple word wrapping for the title
    const words = title.split(' ');
    let lines = [''];
    let currentLine = 0;
    for (const word of words) {
        if ((lines[currentLine] + word).length > 25) { // Character limit per line
            currentLine++;
            lines[currentLine] = '';
        }
        lines[currentLine] += word + ' ';
    }
    const titleLines = lines.map((line, index) => 
        `<tspan x="50" y="${120 + index * 50}">${line.trim()}</tspan>`
    ).join('');

    const svg = `
        <svg width="600" height="338" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
            <text fill="${textColor}" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="start">
                ${titleLines}
            </text>
            <text x="580" y="320" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="end" opacity="0.7">
                AI Presentation Builder
            </text>
        </svg>
    `;

    // Return as a Data URL
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    return dataUrl;
}


// Check if project is already saved
router.get("/check/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const result = await pool.query(
            "SELECT id FROM projects WHERE project_id = $1 AND status = 'active'",
            [projectId]
        );
        res.json({ alreadySaved: result.rows.length > 0 });
    } catch (error) {
        console.error('Check project error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// FIXED: Enhanced save route with proper validation
router.post("/save", async (req, res) => {
    try {
        const { projectId, slides, theme, title: customTitle } = req.body;

        if (!projectId || !slides || !theme) {
            return res.status(400).json({ error: 'Missing required fields: projectId, slides, theme' });
        }

        console.log(`🔍 Processing save request for project ID: ${projectId}`);

        const pptProjectCheck = await pool.query(
            "SELECT id, status, slides FROM ppt_projects WHERE id = $1",
            [projectId]
        );

        if (pptProjectCheck.rows.length === 0) {
            console.error(`❌ PPT Project ${projectId} not found`);
            return res.status(404).json({ error: `Project ${projectId} not found in system` });
        }

        const pptProject = pptProjectCheck.rows[0];
        if (pptProject.status !== 'completed') {
            console.error(`❌ PPT Project ${projectId} status is ${pptProject.status}, not completed`);
            return res.status(400).json({ 
                error: `Cannot save project with status: ${pptProject.status}. Project must be completed.`,
                currentStatus: pptProject.status
            });
        }

        const existingResult = await pool.query(
            "SELECT id FROM projects WHERE (project_id = $1 OR source_ppt_project_id = $1) AND status = 'active'",
            [projectId]
        );

        if (existingResult.rows.length > 0) {
            console.log(`⚠️ Project ${projectId} already saved`);
            return res.status(409).json({ error: 'Project already saved' });
        }

        const title = customTitle || slides[0]?.title || 'Untitled Presentation';
        const description = `Saved presentation with ${slides.length} slides`;

        console.log(`🎨 Generating programmatic cover image for: ${title}`);

        // --- UPGRADED ---
        // Now calls our new, reliable SVG generator function.
        const coverImageUrl = await generateCoverImageSVG(title, theme);

        const newProjectId = uuidv4();
        const result = await pool.query(
            `INSERT INTO projects (
                id, 
                project_id, 
                source_ppt_project_id,
                title, 
                description, 
                cover_image_url, 
                content, 
                status, 
                created_at, 
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
             RETURNING *`,
            [
                newProjectId,
                projectId,
                parseInt(projectId),
                title,
                description,
                coverImageUrl,
                JSON.stringify({ slides, theme }),
                'active'
            ]
        );

        console.log(`✅ Project saved successfully with ID: ${newProjectId}`);

        res.status(201).json({
            success: true,
            project: result.rows[0],
            message: 'Presentation saved successfully'
        });

    } catch (error) {
        console.error('❌ Save project error:', error);
        res.status(500).json({ error: 'Failed to save presentation' });
    }
});

router.get("/active", async (req, res)=>{
  try {
    const result = await pool.query(
      "SELECT id, project_id, title, cover_image_url, content, status, description, CASE WHEN (CURRENT_DATE = updated_at::date) THEN 'Today' WHEN (CURRENT_DATE - updated_at::date) = 1 THEN 'Yesterday' ELSE (CURRENT_DATE - updated_at::date) || ' days ago' END AS updated_label FROM projects WHERE status = $1 ORDER BY updated_at DESC", ['active']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('DB query error : ', error);
    res.status(500).json({error:'Database Error'})
  }
});

router.get("/deleted", async (req, res)=>{
  try {
    const result = await pool.query(
      "SELECT id, title, cover_image_url, content, status, description, CASE WHEN (CURRENT_DATE = updated_at::date) THEN 'Today' WHEN (CURRENT_DATE - updated_at::date) = 1 THEN 'Yesterday' ELSE (CURRENT_DATE - updated_at::date) || ' days ago' END AS updated_label FROM projects WHERE status = $1 ORDER BY updated_at DESC", ['deleted']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('DB query error : ', error);
    res.status(500).json({error:'Database Error'})
  }
});

router.post("/:id/trash", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE projects SET status = $1 WHERE id = $2 RETURNING *",
      ['deleted', id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE projects SET status = $1 WHERE id = $2 RETURNING *",
      ['active', id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/sidebar", async (req, res) => {
  try {
    const recentResult = await pool.query(
      `SELECT id, title AS name, 
      CASE 
        WHEN CURRENT_DATE = updated_at::date THEN 'Today'
        WHEN (CURRENT_DATE - updated_at::date) = 1 THEN 'Yesterday'
        ELSE (CURRENT_DATE - updated_at::date) || ' days ago'
      END AS date
      FROM projects 
      ORDER BY updated_at DESC
      LIMIT 5`
    );

    res.json({
      recentlyViewed: recentResult.rows,
      navigation: [
        { label: "Home", path: "/", icon:"Home" },
        { label: "Trash", path: "/trash", icon:"Trash2" }
      ]
    });
  } catch (err) {
    console.error("Sidebar data fetch error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get('/user', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, created_at, name, email FROM users LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No user found' });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      created_at: user.created_at,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;