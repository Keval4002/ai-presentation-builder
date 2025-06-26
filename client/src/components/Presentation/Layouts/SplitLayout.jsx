// import React, { useRef, useLayoutEffect, useState } from 'react';
// import SlideContent from '../SlideContent';
// import AdaptiveContentContainer from '../../../utils/AdaptiveContentContainer';

// function SplitLayout({ slide, theme, slideIndex, onScaleReport, onLayoutMeasure, measuredLayouts }) {
//   const containerRef = useRef(null);
//   const imageWrapperRef = useRef(null);
//   const titleRef = useRef(null);
//   const contentWrapperRef = useRef(null);
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
//         const coords = { x: (elemRect.left - containerRect.left) / containerRect.width, y: (elemRect.top - containerRect.top) / containerRect.height, w: element.offsetWidth / containerRect.width, h: element.offsetHeight / containerRect.height };
//         if (coords.x >= -0.05 && coords.y >= -0.05 && coords.w > 0.05 && coords.h > 0.05) {
//           measurementCount++;
//           return coords;
//         }
//         return null;
//       };

//       if (slide.imageUrl && imageWrapperRef.current) measuredLayout.image = calculateLayout(imageWrapperRef.current, 'image');
//       if (slide.title && titleRef.current) measuredLayout.title = calculateLayout(titleRef.current, 'title');
//       if (slide.content && contentWrapperRef.current) measuredLayout.content = calculateLayout(contentWrapperRef.current, 'content');
      
//       if (measurementCount > 0) onLayoutMeasure(slideIndex, measuredLayout);
//       else if(measurementAttempts < 3) {
//           setTimeout(performMeasurement, 200);
//           setMeasurementAttempts(p => p + 1);
//       }
//     };
//     const timeoutId = setTimeout(performMeasurement, 100);
//     return () => clearTimeout(timeoutId);
//   }, [slide, slideIndex, onLayoutMeasure, measuredLayouts, isImageLoaded, measurementAttempts]);

//   return (
//     <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'stretch', padding: '24px', gap: '24px' }}>
//       {/* MORE FLEXIBLE LAYOUT: Text container can grow and shrink, prioritizing text space. */}
//       <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden', minWidth: '40%' }}>
//         <div ref={titleRef} style={{ marginBottom: '16px', flexShrink: 0 }}>
//           <h3 style={{ fontFamily: theme.heading_font, color: theme.primary_color, fontWeight: 'bold', lineHeight: '1.2', margin: '0 0 8px 0', fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)', wordBreak: 'break-word' }}>
//             {slide.title}
//           </h3>
//           <div style={{ width: '48px', height: '3px', borderRadius: '1px', backgroundColor: theme.primary_color }} />
//         </div>
//         <div ref={contentWrapperRef} style={{ flex: '1', overflow: 'hidden', position: 'relative' }}>
//           <AdaptiveContentContainer contentKey={slide.content} slideIndex={slideIndex} onMeasure={onScaleReport}>
//             <SlideContent slide={slide} theme={theme} />
//           </AdaptiveContentContainer>
//         </div>
//       </div>
//       {/* MORE FLEXIBLE LAYOUT: Image container can also grow and shrink. */}
//       <div ref={imageWrapperRef} style={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '35%' }}>
//         <div style={{ position: 'relative', width: '100%', height: '90%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <img src={slide.imageUrl} alt={slide.title || 'Slide image'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onLoad={() => setIsImageLoaded(true)} onError={() => setIsImageLoaded(true)} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SplitLayout;