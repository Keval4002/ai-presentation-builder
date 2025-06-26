// import React, { useRef, useLayoutEffect, useState } from 'react';

// function TitleLayout({ slide, theme, slideIndex, onLayoutMeasure, measuredLayouts }) {
//   const containerRef = useRef(null);
//   const titleRef = useRef(null);
//   const imageRef = useRef(null);
//   const [isImageLoaded, setIsImageLoaded] = useState(false);
//   const [imageLoadAttempts, setImageLoadAttempts] = useState(0);

//   useLayoutEffect(() => {
//     if (measuredLayouts[slideIndex] || !onLayoutMeasure) return;
    
//     // For slides with images, wait for image to load completely
//     if (slide.imageUrl && !isImageLoaded) {
//       console.log(`⏳ Title layout waiting for image load on slide ${slideIndex}`);
//       return;
//     }
    
//     if (!containerRef.current) return;

//     const performMeasurement = () => {
//       const containerRect = containerRef.current.getBoundingClientRect();
//       const measuredLayout = {};
//       let measurementCount = 0;

//       const calculateLayout = (element, elementType) => {
//         if (!element) return null;
        
//         // Wait for element to be fully rendered
//         if (element.offsetWidth === 0 || element.offsetHeight === 0) {
//           console.warn(`⚠️ ${elementType} not ready for measurement on slide ${slideIndex}`);
//           return null;
//         }
        
//         const elemRect = element.getBoundingClientRect();
        
//         const coords = {
//           x: (elemRect.left - containerRect.left) / containerRect.width,
//           y: (elemRect.top - containerRect.top) / containerRect.height,
//           w: element.offsetWidth / containerRect.width,
//           h: element.offsetHeight / containerRect.height,
//         };

//         // Enhanced validation for title slides
//         if (coords.x >= 0 && coords.y >= 0 && coords.w > 0.05 && coords.h > 0.05) {
//           measurementCount++;
//           console.log(`📐 Title layout measured ${elementType} for slide ${slideIndex}:`, coords);
//           return coords;
//         } else {
//           console.warn(`❌ Invalid coordinates for ${elementType} on slide ${slideIndex}:`, coords);
//           return null;
//         }
//       };

//       if (slide.title && titleRef.current) {
//         const titleCoords = calculateLayout(titleRef.current, 'title');
//         if (titleCoords) measuredLayout.title = titleCoords;
//       }

//       if (slide.imageUrl && imageRef.current && isImageLoaded) {
//         // Additional wait to ensure image is fully rendered
//         setTimeout(() => {
//           const imageCoords = calculateLayout(imageRef.current, 'image');
//           if (imageCoords) {
//             measuredLayout.image = imageCoords;
//             console.log(`✅ Title layout measurement complete for slide ${slideIndex}:`, { ...measuredLayout, image: imageCoords });
//             onLayoutMeasure(slideIndex, { ...measuredLayout, image: imageCoords });
//           }
//         }, 100);
//         return; // Exit early, measurement will be called in setTimeout
//       }

//       if (measurementCount > 0) {
//         console.log(`✅ Title layout measurement complete for slide ${slideIndex}:`, measuredLayout);
//         onLayoutMeasure(slideIndex, measuredLayout);
//       }
//     };

//     // Delay measurement to ensure layout is stable
//     const timeoutId = setTimeout(performMeasurement, 200);
//     return () => clearTimeout(timeoutId);
//   }, [slide.title, slide.imageUrl, slideIndex, onLayoutMeasure, measuredLayouts, isImageLoaded]);

//   const handleImageLoad = () => {
//     console.log(`🖼️ Title layout image loaded for slide ${slideIndex}`);
//     setIsImageLoaded(true);
//   };

//   const handleImageError = () => {
//     console.warn(`⚠️ Title layout image failed to load for slide ${slideIndex}`);
//     setImageLoadAttempts(prev => prev + 1);
//     // Still set as loaded to allow measurement without image
//     if (imageLoadAttempts < 2) {
//       setTimeout(() => setIsImageLoaded(true), 1000);
//     }
//   };

//   return (
//     <div ref={containerRef} style={{ 
//       width: '100%', 
//       height: '100%', 
//       display: 'flex', 
//       flexDirection: 'column', 
//       alignItems: 'center', 
//       justifyContent: 'center', 
//       textAlign: 'center', 
//       padding: '32px', 
//       position: 'relative', 
//       overflow: 'hidden' 
//     }}>
//       <div style={{ position: 'absolute', inset: '0', opacity: '0.05' }}>
//         <div style={{ position: 'absolute', top: '32px', left: '32px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: theme.primary_color }} />
//         <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: theme.primary_color }} />
//       </div>
      
//       <div style={{ 
//         position: 'relative', 
//         zIndex: '10', 
//         display: 'flex', 
//         flexDirection: 'column', 
//         alignItems: 'center', 
//         justifyContent: 'center', 
//         maxWidth: '90%', 
//         height: '100%' 
//       }}>
//         <div ref={titleRef} style={{ 
//           marginBottom: slide.imageUrl ? '24px' : '0', 
//           flex: slide.imageUrl ? '0 0 auto' : '1', 
//           display: 'flex', 
//           flexDirection: 'column', 
//           justifyContent: 'center',
//           minHeight: '120px' // Ensure minimum height for measurement
//         }}>
//           <h3 style={{ 
//             fontFamily: theme.heading_font, 
//             fontWeight: '900', 
//             letterSpacing: '-0.02em', 
//             margin: '0 0 12px 0', 
//             background: 'linear-gradient(to right, #1f2937, #4b5563, #6b7280)', 
//             WebkitBackgroundClip: 'text', 
//             WebkitTextFillColor: 'transparent', 
//             backgroundClip: 'text', 
//             lineHeight: '1.1', 
//             fontSize: 'clamp(1.5rem, 4.5vw, 3rem)', 
//             wordBreak: 'break-word' 
//           }}>
//             {slide.title}
//           </h3>
//           <div style={{ 
//             width: '64px', 
//             height: '3px', 
//             margin: '0 auto', 
//             borderRadius: '2px', 
//             background: `linear-gradient(90deg, ${theme.primary_color}, ${theme.primary_color}80)` 
//           }} />
//         </div>
        
//         {slide.imageUrl && (
//           <div ref={imageRef} style={{ 
//             flex: '0 0 auto', 
//             maxWidth: '400px', 
//             maxHeight: '300px', // Increased height
//             width: '100%',
//             minHeight: '200px', // Ensure minimum height
//             borderRadius: '12px', 
//             overflow: 'hidden', 
//             boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)', 
//             border: '3px solid white', 
//             position: 'relative', 
//             backgroundColor: '#e5e7eb',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center'
//           }}>
//             <img 
//               src={slide.imageUrl} 
//               alt={slide.title} 
//               style={{ 
//                 width: '100%', 
//                 height: '100%', 
//                 objectFit: 'cover',
//                 display: 'block'
//               }} 
//               onLoad={handleImageLoad}
//               onError={handleImageError}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default TitleLayout;