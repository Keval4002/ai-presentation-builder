import { CANVAS_CONFIG } from './CanvaTypesConst';

const constrainElementToBounds = (element, newX, newY) => {
  const { WIDTH, HEIGHT } = CANVAS_CONFIG;
  const { width = 200, height = 50 } = element;

  return {
    x: Math.max(0, Math.min(newX, WIDTH - width)),
    y: Math.max(0, Math.min(newY, HEIGHT - height)),
  };
};

const generateSnapGuides = (draggedElement, allElements) => {
  const guides = { vertical: [], horizontal: [] };
  const { SNAP_THRESHOLD, WIDTH, HEIGHT } = CANVAS_CONFIG;
  const draggedRight = draggedElement.x + draggedElement.width;
  const draggedBottom = draggedElement.y + draggedElement.height;
  const draggedCenterX = draggedElement.x + draggedElement.width / 2;
  const draggedCenterY = draggedElement.y + draggedElement.height / 2;

  // Check against other elements
  allElements.forEach(el => {
    if (el.id === draggedElement.id) return;

    const elRight = el.x + el.width;
    const elBottom = el.y + el.height;
    const elCenterX = el.x + el.width / 2;
    const elCenterY = el.y + el.height / 2;

    // Vertical alignment
    if (Math.abs(el.x - draggedElement.x) < SNAP_THRESHOLD) guides.vertical.push(el.x);
    if (Math.abs(elRight - draggedRight) < SNAP_THRESHOLD) guides.vertical.push(elRight);
    if (Math.abs(el.x - draggedRight) < SNAP_THRESHOLD) guides.vertical.push(el.x);
    if (Math.abs(elRight - draggedElement.x) < SNAP_THRESHOLD) guides.vertical.push(elRight);
    if (Math.abs(elCenterX - draggedCenterX) < SNAP_THRESHOLD) guides.vertical.push(elCenterX);

    // Horizontal alignment
    if (Math.abs(el.y - draggedElement.y) < SNAP_THRESHOLD) guides.horizontal.push(el.y);
    if (Math.abs(elBottom - draggedBottom) < SNAP_THRESHOLD) guides.horizontal.push(elBottom);
    if (Math.abs(el.y - draggedBottom) < SNAP_THRESHOLD) guides.horizontal.push(el.y);
    if (Math.abs(elBottom - draggedElement.y) < SNAP_THRESHOLD) guides.horizontal.push(elBottom);
    if (Math.abs(elCenterY - draggedCenterY) < SNAP_THRESHOLD) guides.horizontal.push(elCenterY);
  });

  // Canvas center snapping
  const canvasCenterX = WIDTH / 2;
  const canvasCenterY = HEIGHT / 2;
  if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) guides.vertical.push(canvasCenterX);
  if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) guides.horizontal.push(canvasCenterY);

  return {
    vertical: [...new Set(guides.vertical)],
    horizontal: [...new Set(guides.horizontal)],
  };
};

const getSelectionBounds = (element) => {
  const { SELECTION_PADDING } = CANVAS_CONFIG;
  return {
    x: element.x - SELECTION_PADDING,
    y: element.y - SELECTION_PADDING,
    width: (element.width || 200) + SELECTION_PADDING * 2,
    height: (element.height || 50) + SELECTION_PADDING * 2,
  };
};


export {
  constrainElementToBounds,
  generateSnapGuides,
  getSelectionBounds
};