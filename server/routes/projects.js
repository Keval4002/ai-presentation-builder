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


router.get("/sidebar", async (req, res) => {
  try {
    // Example: Fetch recently viewed (latest 5 projects)
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