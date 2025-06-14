import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

router.get("/active", async (req, res)=>{
  try {
    const result = await pool.query(
      "SELECT id, title, cover_image_url, content, status, description, CASE WHEN (CURRENT_DATE = updated_at::date) THEN 'Today' WHEN (CURRENT_DATE - updated_at::date) = 1 THEN 'Yesterday' ELSE (CURRENT_DATE - updated_at::date) || ' days ago' END AS updated_label FROM projects WHERE status = $1 ORDER BY updated_at DESC", ['active']
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


export default router;