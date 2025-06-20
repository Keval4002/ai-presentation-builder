import { pool } from "../db/pool.js"
import { callLLM } from "../utils/geminiApi.js"

const layoutStyles = [
  { name: "LeftImageRightContent", applicableTo: ["ContentSlide"], layout: { title: { x: 0.05, y: 0.05, width: 0.9, height: 0.1 }, image: { x: 0.05, y: 0.2, width: 0.4, height: 0.6 }, content: { x: 0.5, y: 0.2, width: 0.45, height: 0.6 } } },
  { name: "TopTitleBottomImage", applicableTo: ["ContentSlide"], layout: { title: { x: 0.05, y: 0.05, width: 0.9, height: 0.1 }, image: { x: 0.2, y: 0.65, width: 0.6, height: 0.25 }, content: { x: 0.05, y: 0.2, width: 0.9, height: 0.4 } } },
  { name: "FullImageWithOverlayText", applicableTo: ["TitleSlide", "ConclusionSlide", "Q&A"], layout: { title: { x: 0.2, y: 0.4, width: 0.6, height: 0.2 }, image: { x: 0, y: 0, width: 1, height: 1 }, content: null } },
  { name: "CenteredTitleAndImageOnly", applicableTo: ["TitleSlide", "ConclusionSlide", "Q&A"], layout: { title: { x: 0.1, y: 0.2, width: 0.8, height: 0.15 }, image: { x: 0.25, y: 0.4, width: 0.5, height: 0.4 } } },
  { name: "TwoColumnTextImage", applicableTo: ["ContentSlide"], layout: { title: { x: 0.05, y: 0.05, width: 0.9, height: 0.08 }, content: { x: 0.05, y: 0.2, width: 0.4, height: 0.6 }, image: { x: 0.55, y: 0.2, width: 0.4, height: 0.6 } } },
  { name: "ImageTopContentBottom", applicableTo: ["ContentSlide"], layout: { image: { x: 0.1, y: 0.05, width: 0.8, height: 0.4 }, content: { x: 0.05, y: 0.5, width: 0.9, height: 0.4 }, title: { x: 0.05, y: 0.92, width: 0.9, height: 0.06 } } },
  { name: "DiagonalVisualFlow", applicableTo: ["ContentSlide"], layout: { title: { x: 0.05, y: 0.05, width: 0.6, height: 0.1 }, content: { x: 0.1, y: 0.25, width: 0.6, height: 0.6 }, image: { x: 0.65, y: 0.65, width: 0.3, height: 0.3 } } },
  { name: "WideTitleImageOverlay", applicableTo: ["TitleSlide", "Q&A"], layout: { title: { x: 0.05, y: 0.1, width: 0.9, height: 0.15 }, image: { x: 0, y: 0.3, width: 1, height: 0.7 } } },
  { name: "CenteredBoxedContent", applicableTo: ["ContentSlide"], layout: { title: { x: 0.1, y: 0.1, width: 0.8, height: 0.1 }, content: { x: 0.15, y: 0.25, width: 0.7, height: 0.4 }, image: { x: 0.35, y: 0.7, width: 0.3, height: 0.2 } } },
  { name: "MinimalCenteredImageTitle", applicableTo: ["TitleSlide", "ConclusionSlide", "Q&A"], layout: { title: { x: 0.25, y: 0.3, width: 0.5, height: 0.2 }, image: { x: 0.35, y: 0.55, width: 0.3, height: 0.3 } } }
];

function getRandomLayout(slideType) {
    const filtered = layoutStyles.filter(style => style.applicableTo.includes(slideType));
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)]?.layout || null;
}

export async function geminiAgent2(requestId, slideCount) {
    console.log(`Starting geminiAgent2 for requestId: ${requestId}, slideCount: ${slideCount}`);
    
    const baseRetries = 5;
    const interval = 5000;
    const maxRetries = slideCount * baseRetries;
    let attempts = 0;

    return new Promise((resolve, reject) => {
        const poll = async () => {
            try {
                console.log(`Polling attempt ${attempts + 1}/${maxRetries} for requestId: ${requestId}`);
                
                const result = await pool.query(
                    'SELECT slides, status FROM content WHERE request_id = $1', 
                    [requestId]
                );

                if (result.rows.length === 0) {
                    if (attempts >= maxRetries) {
                        return reject(new Error("Request ID not found in content table after multiple attempts."));
                    }
                    attempts++;
                    setTimeout(poll, interval);
                    return;
                }
                
                const slidesData = result.rows[0]?.slides;
                const status = result.rows[0]?.status;
                
                let slides;
                try {
                    slides = typeof slidesData === 'string' ? JSON.parse(slidesData) : slidesData;
                } catch (parseError) {
                    return reject(new Error(`Failed to parse slides data: ${parseError.message}`));
                }

                if (!Array.isArray(slides)) {
                    return reject(new Error('Slides data is not in expected array format'));
                }

                const slidesWithLayout = slides.map((slide) => ({
                    ...slide,
                    layout: getRandomLayout(slide.type),
                }));

                try {
                    const existingLayout = await pool.query('SELECT id FROM layout_slides WHERE request_id = $1', [requestId]);
                    const slidesJSON = JSON.stringify(slidesWithLayout);

                    if (existingLayout.rows.length === 0) {
                        await pool.query('INSERT INTO layout_slides (request_id, slides) VALUES ($1, $2)', [requestId, slidesJSON]);
                    } else {
                        await pool.query('UPDATE layout_slides SET slides = $1, updated_at = NOW() WHERE request_id = $2', [slidesJSON, requestId]);
                    }
                } catch (dbError) {
                    console.error('Database operation in geminiAgent2 failed:', dbError);
                }

                if (status === 'completed') {
                    console.log('Content generation completed, returning slides with layout.');
                    return resolve(slidesWithLayout);
                }

                if (attempts >= maxRetries) {
                    return reject(new Error('Timed out waiting for content generation to complete.'));
                }

                attempts++;
                setTimeout(poll, interval);
                
            } catch (error) {
                console.error('geminiAgent2 polling error:', error);
                reject(error);
            }
        };
        poll();
    });
}