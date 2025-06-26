// import React, { useRef, useLayoutEffect, useState } from 'react';
// import SlideContent from '../SlideContent';
// import AdaptiveContentContainer from '../../../utils/AdaptiveContentContainer';

// function CoordinateLayout({ slide, theme, elementPositions, duringImageCreation, slideIndex, onScaleReport, onLayoutMeasure, measuredLayouts }) {
//   const containerRef = useRef(null);
//   const titleWrapperRef = useRef(null);
//   const contentWrapperRef = useRef(null);
//   const imageWrapperRef = useRef(null);
//   const [isImageLoaded, setIsImageLoaded] = useState(false);
//   const [measurementAttempts, setMeasurementAttempts] = useState(0);

//   useLayoutEffect(() => {
//     if (measuredLayouts[slideIndex] || !onLayoutMeasure) return;
//     if (slide.imageUrl && !isImageLoaded) return;
//     if (!containerRef.current) return;

//     const performMeasurement = () => {
//       const containerRect = containerRef.current.getBoundingClientRect();
//       const measuredLayout = {};
//       let measurementCount = 0;

//       const calculateLayout = (element, elementType) => {
//         if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) return null;
//         const elemRect = element.getBoundingClientRect();
//         const coords = {
//           x: (elemRect.left - containerRect.left) / containerRect.width,
//           y: (elemRect.top - containerRect.top) / containerRect.height,
//           w: element.offsetWidth / containerRect.width,
//           h: element.offsetHeight / containerRect.height,
//         };
//         let minWidth = 0.05, minHeight = 0.05;
//         if (elementType === 'image') { minWidth = 0.15; minHeight = 0.15; }
//         if (coords.x >= 0 && coords.y >= 0 && coords.w > minWidth && coords.h > minHeight) {
//           measurementCount++;
//           return coords;
//         }
//         return null;
//       };

//       if (slide.title && titleWrapperRef.current) measuredLayout.title = calculateLayout(titleWrapperRef.current, 'title');
//       if (slide.content && contentWrapperRef.current) measuredLayout.content = calculateLayout(contentWrapperRef.current, 'content');
//       if (slide.imageUrl && imageWrapperRef.current && isImageLoaded) measuredLayout.image = calculateLayout(imageWrapperRef.current, 'image');

//       if (measurementCount > 0) {
//         onLayoutMeasure(slideIndex, measuredLayout);
//       } else {
//         if (measurementAttempts < 3) {
//           setTimeout(performMeasurement, 200 * (measurementAttempts + 1));
//           setMeasurementAttempts(prev => prev + 1);
//         }
//       }
//     };

//     const timeoutId = setTimeout(performMeasurement, 300);
//     return () => clearTimeout(timeoutId);
    
//   }, [slide, elementPositions, slideIndex, onLayoutMeasure, measuredLayouts, isImageLoaded, measurementAttempts]);

//   const { title: titlePos, content: contentPos, image: imagePos } = elementPositions;
//   const hasTitle = slide.title && titlePos;
//   const hasContent = slide.content && contentPos;
//   const hasImage = slide.imageUrl && imagePos && !duringImageCreation;

//   return (
//     <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
//       {hasTitle && ( <div ref={titleWrapperRef} style={{...titlePos, display: 'flex', alignItems: 'center', justifyContent: slide.type === 'TitleSlide' ? 'center' : 'flex-start' }}><div style={{ textAlign: slide.type === 'TitleSlide' ? 'center' : 'left', width: '100%', padding: '12px' }}> <h3 style={{ fontFamily: theme.heading_font, color: theme.primary_color, fontWeight: 'bold', lineHeight: '1.2', margin: '0 0 8px 0', fontSize: slide.type === 'TitleSlide' ? 'clamp(1.75rem, 4vw, 2.75rem)' : 'clamp(1.25rem, 3vw, 2rem)', wordBreak: 'break-word' }}>{slide.title}</h3><div style={{ width: slide.type === 'TitleSlide' ? '64px' : '40px', height: '3px', backgroundColor: theme.primary_color, borderRadius: '2px', margin: slide.type === 'TitleSlide' ? '0 auto' : '0' }} /></div></div> )}
//       {hasContent && ( <div ref={contentWrapperRef} style={{ ...contentPos, overflow: 'hidden', padding: '12px' }}><AdaptiveContentContainer contentKey={slide.content} slideIndex={slideIndex} onMeasure={onScaleReport}><SlideContent slide={slide} theme={theme} /></AdaptiveContentContainer></div> )}
//       {hasImage && ( <div ref={imageWrapperRef} style={{ ...imagePos, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', minHeight: '200px' }}><div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)', border: '3px solid white', position: 'relative', backgroundColor: '#e5e7eb', minHeight: '180px' }}><img src={slide.imageUrl} alt={slide.title || 'Slide image'} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onLoad={() => setIsImageLoaded(true)} onError={() => setIsImageLoaded(true)} /></div></div> )}
//     </div>
//   );
// }

// export default CoordinateLayout;