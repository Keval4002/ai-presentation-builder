import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const themes = await pool.query(
      "SELECT slug, name, description, primary_color, secondary_color, background_color, text_color, heading_font FROM themes WHERE is_active = true ORDER BY sort_order ASC"
    );
    res.json(themes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;