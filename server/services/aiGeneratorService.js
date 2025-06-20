import { pool } from "../db/pool.js";
import { geminiAgent1 } from "./geminiAgent1.js";

// Simulate AI generation (replace this with actual API call)
async function triggerAIGeneration({ pptProjectId, themeSlug, mode, slideCount, prompt, outline, requestId }) {
  console.log(`Starting AI generation for PPT Project ID: ${pptProjectId}`);

  try {
    // await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate delay

    const enrichedSlides = await geminiAgent1({ prompt, outline, slideCount, themeSlug, mode, requestId });

    // ✅ Step 1: Get status from content table (latest)
    const statusResult = await pool.query(
      `SELECT status FROM content 
       WHERE prompt = $1 AND theme_slug = $2
       ORDER BY updated_at DESC 
       LIMIT 1`,
      [prompt, themeSlug]
    );

    const contentStatus = statusResult.rows[0]?.status || "in_progress";

    // ✅ Step 2: Update ppt_projects with that status + slides
    await pool.query(
      `UPDATE ppt_projects 
       SET slides = $1, status = $2, updated_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(enrichedSlides), contentStatus, pptProjectId]
    );


    console.log(`PPT Project ${pptProjectId} updated with status: ${contentStatus}`);


  } catch (err) {
    console.error(`AI generation failed for PPT Project ID: ${pptProjectId}:`, err);
    await pool.query(
      `UPDATE ppt_projects 
       SET status = 'failed', updated_at = NOW()
       WHERE id = $1`,
      [pptProjectId]
    );
  }
}

export { triggerAIGeneration };
