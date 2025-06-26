import { v4 as uuidv4 } from 'uuid';
import { CANVAS_CONFIG, ELEMENT_TYPES, createTextElement, createImageElement, createCanvasElement } from "./CanvaTypesConst";

const LAYOUTS = {
  TitleSlide: {
    title: { x: 80, y: 240, width: 1120, height: 160 },
    image: { x: 440, y: 420, width: 400, height: 225 },
  },
  AgendaSlide: { // Matches the ListSlide for layout purposes
    title: { x: 80, y: 60, width: 1120, height: 90 },
    content: { x: 80, y: 180, width: 1120, height: 480 },
    image: { x: 80, y: 180, width: 400, height: 450 },
  },
  ContentSlide: {
    title: { x: 80, y: 60, width: 1120, height: 90 },
    content: { x: 520, y: 180, width: 680, height: 480 },
    image: { x: 80, y: 180, width: 400, height: 450 },
  },
  ConclusionSlide: {
    title: { x: 80, y: 240, width: 1120, height: 160 },
    image: { x: 440, y: 420, width: 400, height: 225 },
  },
  "Q&A": {
    title: { x: 80, y: 240, width: 1120, height: 160 },
  }
};


const parseContentText = (content) => {
  if (!content) return '';
  return content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^- /gm, '• ').trim();
};

const convertPixelsToLayout = (pixels) => {
  return {
    x: pixels.x / CANVAS_CONFIG.WIDTH,
    y: pixels.y / CANVAS_CONFIG.HEIGHT,
    width: pixels.width / CANVAS_CONFIG.WIDTH,
    height: pixels.height / CANVAS_CONFIG.HEIGHT,
  };
};

const convertSlideToCanvasElements = (slide, theme) => {
  const elements = [];
  const layout = LAYOUTS[slide.type] || {};

  if (slide.title) {
    const titleLayout = layout.title || { x: 80, y: 60, width: 1120, height: 100 };
    elements.push(createTextElement({
      id: `title-${slide.slideNumber || uuidv4()}`,
      elementType: 'title',
      text: slide.title,
      ...titleLayout,
      fontSize: slide.type === 'TitleSlide' ? 72 : 48,
      fontFamily: theme.heading_font,
      fill: theme.primary_color,
      fontStyle: 'bold',
      align: 'left',
      verticalAlign: 'middle',
    }));
  }

  if (slide.content) {
    const contentLayout = layout.content || { x: 80, y: 180, width: 1120, height: 450 };
    elements.push(createTextElement({
      id: `content-${slide.slideNumber || uuidv4()}`,
      elementType: 'content',
      text: parseContentText(slide.content),
      ...contentLayout,
      fontSize: 28,
      lineHeight: 1.5,
      fontFamily: theme.body_font,
      fill: theme.text_color,
      align: 'left',
      verticalAlign: 'top',
    }));
  }

  if (slide.imageUrl) {
    const imageLayout = layout.image || { x: 440, y: 420, width: 400, height: 225 };
    elements.push(createImageElement({
      id: `image-${slide.slideNumber || uuidv4()}`,
      elementType: 'image',
      src: slide.imageUrl,
      ...imageLayout,
    }));
  }
  return elements;
};

export {
  parseContentText,
  convertPixelsToLayout,
  convertSlideToCanvasElements
};