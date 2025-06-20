import { pool } from "../db/pool.js";
import { geminiAgent1 } from "./geminiAgent1.js";
import { geminiAgent2 } from "./geminiAgent2.js";

async function triggerAIGeneration({ pptProjectId, themeSlug, mode, slideCount, prompt, outline, requestId }) {
  console.log(`Starting AI generation for PPT Project ID: ${pptProjectId}`);

  try {
    // geminiAgent1 now handles the entire content+image generation process and its own status updates.
    // It will update the project status to 'image creation' and then 'completed'.
    const enrichedSlides = await geminiAgent1({ prompt, outline, slideCount, themeSlug, mode, requestId, pptProjectId });
  
    console.log(`Content and images generated for project ${pptProjectId}. Now adding layout information.`);

    let layoutSlides;
    try {
      // geminiAgent2 polls the `content` table. Since geminiAgent1 just finished,
      // it will find the 'completed' status and data immediately and add layout info.
      layoutSlides = await geminiAgent2(requestId, slideCount);
      console.log("✅ Layout processing done via geminiAgent2");
    } catch (layoutErr) {
      console.warn("⚠ Failed to process layout slides with Agent2, using slides without layout info:", layoutErr.message);
      // Fallback to the slides we have if layout generation fails.
      layoutSlides = enrichedSlides;
    }

    // FINAL UPDATE: Save the slides that now include layout information from geminiAgent2.
    // The status is already 'completed' from geminiAgent1, so we just update the slides blob.
    await pool.query(
      `UPDATE ppt_projects 
       SET slides = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(layoutSlides), pptProjectId]
    );

    console.log(`PPT Project ${pptProjectId} successfully finalized with layout information.`);

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