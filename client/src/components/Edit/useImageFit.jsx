// src/components/Edit/useImageFit.js

import { useState, useEffect } from 'react';
import useImage from 'use-image';

/**
 * A custom hook to calculate the position and dimensions for an image to fit
 * within a bounding box while maintaining its aspect ratio, mimicking object-fit: cover.
 * @param {string} src - The source URL of the image.
 * @param {object} boundingBox - The target area { x, y, width, height }.
 * @returns {object} - The loaded image object and the calculated props { image, props }.
 */
const useImageFit = (src, boundingBox) => {
  const [image] = useImage(src);
  const [calculatedProps, setCalculatedProps] = useState(null);

  useEffect(() => {
    if (image && boundingBox) {
      const { width: boxWidth, height: boxHeight } = boundingBox;
      const { width: imgWidth, height: imgHeight } = image;

      const boxAspect = boxWidth / boxHeight;
      const imgAspect = imgWidth / imgHeight;

      let finalWidth, finalHeight, finalX, finalY;

      if (imgAspect > boxAspect) {
        // Image is wider than the box, so height determines the scale
        finalHeight = boxHeight;
        finalWidth = finalHeight * imgAspect;
        finalX = boundingBox.x - (finalWidth - boxWidth) / 2;
        finalY = boundingBox.y;
      } else {
        // Image is taller than the box, so width determines the scale
        finalWidth = boxWidth;
        finalHeight = finalWidth / imgAspect;
        finalY = boundingBox.y - (finalHeight - boxHeight) / 2;
        finalX = boundingBox.x;
      }

      setCalculatedProps({
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight,
      });
    }
  }, [image, boundingBox]);

  return { image, props: calculatedProps };
};

export default useImageFit;