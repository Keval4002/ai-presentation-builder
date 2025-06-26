// Professional, user-friendly colors for the editor UI.
const EDITOR_COLORS = {
  GUIDE: '#007BFF', // A standard, non-intrusive blue
  SELECTION: '#007BFF', // Match the guide color for consistency
};

const CANVAS_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  SNAP_THRESHOLD: 8,
  SELECTION_PADDING: 5,
  GUIDE_COLOR: EDITOR_COLORS.GUIDE,
  SELECTION_BOX_COLOR: EDITOR_COLORS.SELECTION,
  GUIDE_OPACITY: 0.9,
};

const ELEMENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SHAPE: 'shape'
};

const createCanvasElement = ({
  id,
  type,
  x = 0,
  y = 0,
  width = 200,
  height = 50,
  ...props
}) => ({
  id,
  type,
  x,
  y,
  width,
  height,
  ...props
});

const createTextElement = ({
  id,
  text,
  x,
  y,
  width,
  height,
  fontSize = 20,
  fontFamily = 'Arial',
  fill = '#000000',
  align = 'left',
  verticalAlign = 'top',
  fontStyle = 'normal',
  lineHeight = 1.2,
  ...props
}) => createCanvasElement({
  id,
  type: ELEMENT_TYPES.TEXT,
  text,
  x,
  y,
  width,
  height,
  fontSize,
  fontFamily,
  fill,
  align,
  verticalAlign,
  fontStyle,
  lineHeight,
  ...props
});

const createImageElement = ({
  id,
  src,
  x,
  y,
  width,
  height,
  ...props
}) => createCanvasElement({
  id,
  type: ELEMENT_TYPES.IMAGE,
  src,
  x,
  y,
  width,
  height,
  ...props
});

export {
  CANVAS_CONFIG,
  ELEMENT_TYPES,
  createCanvasElement,
  createTextElement,
  createImageElement
};