import { callLLM } from "../utils/geminiApi.js";
import { pool } from "../db/pool.js";
import { geminiAgent3 } from "./geminiAgent3.js";

// FIX: Added pptProjectId to handle status updates directly
async function geminiAgent1({ prompt, outline, slideCount, themeSlug, mode, requestId, pptProjectId }) {
  try {
    const themes = await pool.query(
      `SELECT name, description, primary_color, secondary_color, background_color, text_color, thumbnail_style
       FROM themes
       WHERE slug = $1`,
      [themeSlug]
    );

    if (themes.rows.length === 0) {
      throw new Error(`Theme "${themeSlug}" not found`);
    }
    const theme = themes.rows[0];
    const finalPrompt = `You are a world-class presentation designer and expert content strategist. Your task is to generate the complete structure and content for a presentation that is both informative and engaging, based on user requirements and a specific visual theme.

**Core Task:**
- Main Topic/Prompt: "${prompt}"
- Total Number of Slides: ${slideCount}

(✨) **Content Philosophy (Crucial):**
- **Create a Narrative:** The presentation should tell a story. Each slide must logically flow from the previous one, building a cohesive narrative journey for the audience.
- **Substantive Content:** The content on each slide should be insightful and valuable. Avoid superficial bullet points. The goal is to provide the audience with the core takeaways they need to understand the topic.
- **Balanced Pacing:** Distribute the information evenly across the content slides. Avoid having one slide with very sparse text and another that is overwhelmingly dense. All 'ContentSlide' types should feel similarly weighted.

**Visual Theme Guidelines (Strictly Adhere to This):**
- Theme Name: "${theme.name}"
- Style Description: "${theme.description}"
- Key Colors: Use the feeling of Primary (${theme.primary_color}), Secondary (${theme.secondary_color}), and Background (${theme.background_color}) to inform your image suggestions.

**Instructions:**
1. Your response MUST be a single, valid JSON object. Do not include any text or explanations outside of the JSON.
2. The root of the JSON object must be a key named "slides", which is an array of slide objects.
3. Generate exactly ${slideCount} slide objects.
4. The first slide must be a 'TitleSlide' and the last a 'ConclusionSlide' or 'Q&A'.

5. For each slide object, provide all the following key-value pairs:
    - "slideNumber": (Number)
    - "type": (String) Choose from: "TitleSlide", "AgendaSlide", "ContentSlide", "ConclusionSlide", "Q&A".
    - "header": (String) A short, consistent header. Often the main presentation title.
    - "title": (String) The main, impactful title for the slide.
    
    (✨) - "content": (String) This is the text the audience will read on the slide. Use markdown-style bullet points. For each bullet:
        - Start with a **bolded concept or label**.
        - Follow it with a **concise yet comprehensive explanation (1-2 detailed sentences)** that provides real value and insight. This text should be professional and well-written, able to stand on its own.
        - **Aim for 3-5 comprehensive bullet points** for each 'ContentSlide' to ensure a well-balanced layout.
        - **Example of good depth:** "- **Strategic Keyword Integration**: We don't just add keywords; we weave them naturally into your site's copy and metadata. This improves search rankings while maintaining a high-quality user experience."
        
    (✨) - "speakerNotes": (String) A detailed, human-like script for the presenter. This is where you expand *significantly* on the slide's bullet points. The content on the slide is the 'what'; the speaker notes are the 'why' and 'how'. Include anecdotes, deeper explanations, transitions to the next slide, or questions for the audience. This should sound like a natural, confident speaker.
    
    - "footer": (String) Consistent footer text (e.g., company name or event title).
    
    - "imageSuggestion": (Object)
        - "description": (String) A vivid, detailed prompt for an image generation AI. **It must incorporate the mood, style, and colors of the chosen theme.** Think like an art director.
        - "style": (String) The suggested style for the image (e.g., "photorealistic", "cinematic", "minimalist vector art", "data visualization graph").

6. Do not include any backticks, json markers, code fences, Markdown formatting, or extra text — only return a raw JSON object.

⚠ Your response will be fed directly to a parser. If it is not valid JSON, it will fail.
`.trim();

    let rawResponse = await callLLM({ model: "gemini-2.0-flash", prompt: finalPrompt, apiType: "gemini" });
    rawResponse = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    let slidesData;
    try {
      slidesData = JSON.parse(rawResponse);
    } catch (parseErr) {
      console.error("Gemini response parse error:", parseErr);
      throw new Error("LLM returned unstructured data.");
    }
    if (!slidesData.slides || !Array.isArray(slidesData.slides)) {
      throw new Error("LLM response missing 'slides' array");
    }
    
    const contentOnlySlides = slidesData.slides;

    // FIX: Update project status to 'image creation' and save text content.
    // This allows the frontend to show progress.
    await pool.query(
      `UPDATE ppt_projects 
       SET slides = $1, status = 'image creation', updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(contentOnlySlides), pptProjectId]
    );
    console.log(`Project ${pptProjectId} status updated to 'image creation'.`);
    
    // Insert initial content into `content` table for logging/polling
    await pool.query(
        `INSERT INTO content (slides, request_id, theme_slug, prompt, status, slide_count) VALUES ($1, $2, $3, $4, 'image creation', $5)`,
        [JSON.stringify(contentOnlySlides), requestId, themeSlug, prompt, slideCount]
    );
    
    // Begin image generation
    const enrichedSlides = await geminiAgent3(contentOnlySlides);

    // FIX: Final update. Status is now 'completed' with image URLs.
    await pool.query(
      `UPDATE ppt_projects 
       SET slides = $1, status = 'completed', updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(enrichedSlides), pptProjectId]
    );
    console.log(`Project ${pptProjectId} status updated to 'completed'.`);
    
    // Also update the 'content' table to reflect completion.
    await pool.query(
        `UPDATE content SET slides = $1, status = 'completed' WHERE request_id = $2`,
        [JSON.stringify(enrichedSlides), requestId]
    );

    return enrichedSlides;

  } catch (error) {
    console.error("geminiAgent1 error:", error.message);
    // Let the error bubble up to aiGeneratorService, which will set the project status to 'failed'
    throw error;
  }
}

export { geminiAgent1 };