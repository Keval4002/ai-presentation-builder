import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { CANVAS_CONFIG, ELEMENT_TYPES } from './Edit/CanvaTypesConst';
import { convertSlideToCanvasElements } from './Edit/Content-Parser';
import { generateSnapGuides } from './Edit/Canvas-utilities';
import { CanvasTextElement, CanvasImageElement, SnapGuides } from './Edit/Canvas-Components';

function EditableCanvasSlide({ slide, theme, onUpdate }) {
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [snapGuides, setSnapGuides] = useState({ vertical: [], horizontal: [] });

  useEffect(() => {
    const elements = slide.canvasElements || convertSlideToCanvasElements(slide, theme);
    setCanvasElements(elements);
  }, [slide, theme]);

  const handleElementUpdate = (elementId, newProps, isInternalUpdate = false) => {
    const updatedElements = canvasElements.map(el =>
      el.id === elementId ? { ...el, ...newProps } : el
    );
    setCanvasElements(updatedElements);

    if (!isInternalUpdate) {
      onUpdate({
        ...slide,
        canvasElements: updatedElements,
      });
    }
  };

  const handleElementSelect = (elementId) => {
    setSelectedElementId(elementId);
    setSnapGuides({ vertical: [], horizontal: [] });
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedElementId(null);
    }
  };

  const handleDragMove = (draggedElement, newPosition) => {
    const elementWithNewPos = { ...draggedElement, ...newPosition };
    const guides = generateSnapGuides(elementWithNewPos, canvasElements);
    setSnapGuides(guides);
  };

  const handleDragEnd = () => {
    setSnapGuides({ vertical: [], horizontal: [] });
  };

  const renderCanvasElement = (element) => {
    const commonProps = {
      element,
      isSelected: selectedElementId === element.id,
      onUpdate: handleElementUpdate,
      onSelect: handleElementSelect,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
    };

    switch (element.type) {
      case ELEMENT_TYPES.TEXT:
        return <CanvasTextElement key={element.id} {...commonProps} />;
      case ELEMENT_TYPES.IMAGE:
        return <CanvasImageElement key={element.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className='mb-12 border rounded-3xl overflow-hidden shadow-xl'>
      <Stage
        width={CANVAS_CONFIG.WIDTH}
        height={CANVAS_CONFIG.HEIGHT}
        style={{ backgroundColor: theme.background_color }}
        onClick={handleStageClick}
      >
        <Layer>
          {canvasElements.map(renderCanvasElement)}
          <SnapGuides guides={snapGuides} />
        </Layer>
      </Stage>
    </div>
  );
}

export default EditableCanvasSlide;