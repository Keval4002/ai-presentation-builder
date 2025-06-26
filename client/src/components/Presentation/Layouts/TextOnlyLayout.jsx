// import React, { useRef, useLayoutEffect } from 'react';
// import SlideContent from '../SlideContent';
// import AdaptiveContentContainer from '../../../utils/AdaptiveContentContainer';

// function TextOnlyLayout({ slide, theme, slideIndex, onScaleReport, onLayoutMeasure, measuredLayouts }) {
//   const containerRef = useRef(null);
//   const titleRef = useRef(null);
//   const contentRef = useRef(null);

//   useLayoutEffect(() => {
//     if (measuredLayouts[slideIndex] || !onLayoutMeasure) return;
//     if (!containerRef.current) return;

//     const performMeasurement = () => {
//       const containerRect = containerRef.current.getBoundingClientRect();
//       const measuredLayout = {};
//       let measurementCount = 0;

//       const calculateLayout = (element, elementType) => {
//         if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) return null;
//         const elemRect = element.getBoundingClientRect();
//         const coords = { x: (elemRect.left - containerRect.left) / containerRect.width, y: (elemRect.top - containerRect.top) / containerRect.height, w: element.offsetWidth / containerRect.width, h: element.offsetHeight / containerRect.height };
//         if (coords.x >= 0 && coords.y >= 0 && coords.w > 0.05 && coords.h > 0.05) {
//           measurementCount++;
//           return coords;
//         }
//         return null;
//       };

//       if (slide.title && titleRef.current) measuredLayout.title = calculateLayout(titleRef.current, 'title');
//       if (slide.content && contentRef.current) measuredLayout.content = calculateLayout(contentRef.current, 'content');

//       if (measurementCount > 0) {
//         onLayoutMeasure(slideIndex, measuredLayout);
//       }
//     };

//     const timeoutId = setTimeout(performMeasurement, 50);
//     return () => clearTimeout(timeoutId);
//   }, [slide, slideIndex, onLayoutMeasure, measuredLayouts]);
  
//   return (
//     <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '28px', position: 'relative', overflow: 'hidden' }}>
//       <div style={{ position: 'absolute', inset: '0', opacity: '0.05' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', height: '100%', padding: '16px' }}>{Array(48).fill().map((_, i) => (<div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.primary_color }}/>))}</div></div>
//       <div style={{ position: 'relative', zIndex: '10', height: '100%', display: 'flex', flexDirection: 'column' }}>
//         <div ref={titleRef} style={{ textAlign: 'center', marginBottom: '20px', flexShrink: 0 }}>
//           <h3 style={{ fontFamily: theme.heading_font, color: theme.primary_color, fontWeight: 'bold', lineHeight: '1.2', margin: '0 0 10px 0', fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', wordBreak: 'break-word' }}>{slide.title}</h3>
//           <div style={{ width: '64px', height: '3px', margin: '0 auto', borderRadius: '2px', background: `linear-gradient(90deg, ${theme.primary_color}, ${theme.primary_color}80)` }} />
//         </div>
//         <div ref={contentRef} style={{ flex: '1', width: '100%', overflow: 'hidden' }}>
//           <AdaptiveContentContainer contentKey={slide.content} slideIndex={slideIndex} onMeasure={onScaleReport}>
//             <SlideContent slide={slide} theme={theme} />
//           </AdaptiveContentContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TextOnlyLayout;