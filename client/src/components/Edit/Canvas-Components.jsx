import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Text, Image as KonvaImage, Rect, Line } from 'react-konva';
import useImageFit from "./useImageFit";
import { CANVAS_CONFIG } from "./CanvaTypesConst";

const CanvasTextElement = ({ element, isSelected, onUpdate, onSelect, onDragMove, onDragEnd }) => {
  const textRef = useRef(null);
  const [measuredDims, setMeasuredDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (textRef.current) {
      const newWidth = textRef.current.width();
      const newHeight = textRef.current.height();
      if (newWidth !== measuredDims.width || newHeight !== measuredDims.height) {
        setMeasuredDims({ width: newWidth, height: newHeight });
        // Pass a flag to indicate this is an internal update for measurement
        onUpdate(element.id, { width: newWidth, height: newHeight }, true);
      }
    }
  }, [element.text, element.fontSize, element.width, onUpdate, element.id, measuredDims.width, measuredDims.height]);

  const measuredElement = { ...element, ...measuredDims };
  const selectionBounds = getSelectionBounds(measuredElement);

  return (
    <>
      <Text
        ref={textRef}
        {...element}
        draggable
        onClick={() => onSelect(element.id)}
        onTap={() => onSelect(element.id)}
        onDragMove={(e) => {
          const newPos = { x: e.target.x(), y: e.target.y() };
          onDragMove(measuredElement, newPos);
        }}
        onDragEnd={(e) => {
          const constrained = constrainElementToBounds(measuredElement, e.target.x(), e.target.y());
          onUpdate(element.id, { ...constrained, width: measuredDims.width, height: measuredDims.height });
          onDragEnd();
        }}
      />
      {isSelected && (
        <Rect
          {...selectionBounds}
          stroke={CANVAS_CONFIG.SELECTION_BOX_COLOR}
          strokeWidth={2}
          fill="transparent"
          listening={false}
        />
      )}
    </>
  );
};

const CanvasImageElement = ({ element, isSelected, onUpdate, onSelect, onDragMove, onDragEnd }) => {
  const [img] = useimage(element.src);
  const selectionBounds = getSelectionBounds(element);
  if (!img) return null;

  return (
    <>
      <KonvaImage
        {...element}
        image={img}
        draggable
        onClick={() => onSelect(element.id)}
        onTap={() => onSelect(element.id)}
        onDragMove={(e) => {
          const newPos = { x: e.target.x(), y: e.target.y() };
          onDragMove(element, newPos);
        }}
        onDragEnd={(e) => {
          const constrained = constrainElementToBounds(element, e.target.x(), e.target.y());
          onUpdate(element.id, constrained);
          onDragEnd();
        }}
      />
      {isSelected && (
        <Rect
          {...selectionBounds}
          stroke={CANVAS_CONFIG.SELECTION_BOX_COLOR}
          strokeWidth={2}
          fill="transparent"
          listening={false}
        />
      )}
    </>
  );
};

const SnapGuides = ({ guides }) => {
  const { WIDTH, HEIGHT, GUIDE_COLOR, GUIDE_OPACITY } = CANVAS_CONFIG;
  return (
    <>
      {guides.vertical.map((x, i) => (
        <Line
          key={`v-${i}`}
          points={[x, 0, x, HEIGHT]}
          stroke={GUIDE_COLOR}
          strokeWidth={1.5}
          opacity={GUIDE_OPACITY}
          listening={false}
        />
      ))}
      {guides.horizontal.map((y, i) => (
        <Line
          key={`h-${i}`}
          points={[0, y, WIDTH, y]}
          stroke={GUIDE_COLOR}
          strokeWidth={1.5}
          opacity={GUIDE_OPACITY}
          listening={false}
        />
      ))}
    </>
  );
};

export { CanvasTextElement, CanvasImageElement, SnapGuides };