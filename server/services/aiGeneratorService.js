import { pool } from "../db/pool.js";

// Simulate AI generation (replace this with actual API call)
async function triggerAIGeneration({ pptProjectId, themeSlug, mode, slideCount, prompt, outline }) {
  console.log(`Starting AI generation for PPT Project ID: ${pptProjectId}`);

  try {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate delay

    const slides = Array.from({ length: slideCount }, (_, i) => ({
      slideNumber: i + 1,
      title: `Slide ${i + 1} - ${themeSlug}`,
      content: mode === "ai" ? `Generated content based on: ${prompt}` : outline[i] || `Outline ${i + 1}`
    }));

    await pool.query(
      `UPDATE ppt_projects 
       SET slides = $1, status = 'completed', updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(slides), pptProjectId]
    );

    console.log(`AI generation completed for PPT Project ID: ${pptProjectId}`);
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
