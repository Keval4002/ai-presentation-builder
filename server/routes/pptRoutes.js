import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT p.slides, p.status, p.updated_at
      FROM ppt_projects p
      JOIN ppt_requests r ON p.request_id = r.id
      WHERE r.project_id = $1
      `,
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching project data:", err);
    res.status(500).json({ error: "Failed to fetch project data." });
  }
});

export default router;
