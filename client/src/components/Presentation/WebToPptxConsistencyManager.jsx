// Enhanced Web State Capture and PPTX Recreation System
import PptxGenJS from 'pptxgenjs';
import { generateUnifiedThemeStyles, UNIFIED_FONT_SIZES } from './UnifiedContentProcessor';

// Updated DynamicLayoutRenderer integration
export const updateDynamicLayoutRenderer = (existingRenderer) => {
    // Add web state capture to the existing useLayoutEffect
    const originalUseLayoutEffect = existingRenderer.useLayoutEffect;
    
    return {
        ...existingRenderer,
        // Enhanced capture method
        captureWebStateAfterRender: (slideIndex, containerRef, theme, slide, webStateCapture) => {
            if (webStateCapture && containerRef.current) {
                const captureTimer = setTimeout(() => {
                    // Get the applied scale from AdaptiveContentContainer if available
                    const adaptiveContainers = containerRef.current.querySelectorAll('[data-adaptive-scale]');
                    let appliedScale = 1;
                    
                    if (adaptiveContainers.length > 0) {
                        // Extract scale from transform style
                        const transform = adaptiveContainers[0].style.transform;
                        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
                        if (scaleMatch) {
                            appliedScale = parseFloat(scaleMatch[1]);
                        }
                    }
                    
                    webStateCapture.captureCompleteWebState(slideIndex, containerRef.current, theme, slide, appliedScale);
                    console.log(`✅ Captured web state for slide ${slideIndex} with scale ${appliedScale}`);
                }, 500); // Increased delay to ensure all animations complete

                return () => clearTimeout(captureTimer);
            }
        }
    };
};

export class EnhancedWebStateCapture {
    constructor() {
        this.capturedStates = new Map();
        this.globalMetrics = {
            minFontSize: Infinity,
            maxFontSize: 0,
            averageScale: 1
        };
    }

    captureCompleteWebState(slideIndex, slideElement, theme, slideData, appliedScale = 1) {
        const slideRect = slideElement.getBoundingClientRect();
        const capturedElements = new Map();
        const computedStyles = new Map();

        // Capture all positioned elements with comprehensive style data
        const positionedElements = slideElement.querySelectorAll('[data-element-type]');
        
        positionedElements.forEach(element => {
            const elementType = element.getAttribute('data-element-type');
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);
            
            // Extract comprehensive styling information
            const styleData = this._extractCompleteStyles(element, computedStyle);
            
            capturedElements.set(elementType, {
                position: {
                    x: (rect.left - slideRect.left) / slideRect.width,
                    y: (rect.top - slideRect.top) / slideRect.height,
                    w: rect.width / slideRect.width,
                    h: rect.height / slideRect.height
                },
                styling: styleData,
                content: this._extractElementContent(element, elementType),
                isVisible: rect.width > 0 && rect.height > 0,
                appliedScale: appliedScale,
                elementType
            });

            computedStyles.set(elementType, styleData);
        });

        // Capture theme application state
        const themeState = this._captureThemeApplication(slideElement, theme);
        
        // Store complete state
        this.capturedStates.set(slideIndex, {
            elements: capturedElements,
            slideData,
            theme: generateUnifiedThemeStyles(theme),
            themeApplication: themeState,
            appliedScale: appliedScale,
            slideRect: {
                width: slideRect.width,
                height: slideRect.height
            },
            timestamp: Date.now()
        });

        // Update global metrics for consistency
        this._updateGlobalMetrics(computedStyles, appliedScale);

        return capturedElements;
    }

    _extractCompleteStyles(element, computedStyle) {
        return {
            // Typography
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            fontWeight: computedStyle.fontWeight,
            lineHeight: computedStyle.lineHeight,
            letterSpacing: computedStyle.letterSpacing,
            
            // Colors
            color: computedStyle.color,
            backgroundColor: computedStyle.backgroundColor,
            
            // Text formatting
            textAlign: computedStyle.textAlign,
            textDecoration: computedStyle.textDecoration,
            textTransform: computedStyle.textTransform,
            
            // Layout
            display: computedStyle.display,
            flexDirection: computedStyle.flexDirection,
            alignItems: computedStyle.alignItems,
            justifyContent: computedStyle.justifyContent,
            
            // Spacing
            padding: computedStyle.padding,
            margin: computedStyle.margin,
            gap: computedStyle.gap,
            
            // Transforms
            transform: computedStyle.transform,
            transformOrigin: computedStyle.transformOrigin,
            
            // Visual effects
            borderRadius: computedStyle.borderRadius,
            boxShadow: computedStyle.boxShadow,
            opacity: computedStyle.opacity
        };
    }

    _captureThemeApplication(slideElement, theme) {
        return {
            backgroundApplied: slideElement.style.backgroundColor || theme.background_color,
            primaryColorUsage: this._findPrimaryColorUsage(slideElement, theme.primary_color),
            textColorUsage: this._findTextColorUsage(slideElement, theme.text_color),
            fontUsage: {
                heading: this._findFontUsage(slideElement, theme.heading_font),
                body: this._findFontUsage(slideElement, theme.body_font)
            }
        };
    }

    _findPrimaryColorUsage(element, primaryColor) {
        const usage = [];
        const elements = element.querySelectorAll('*');
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.color === primaryColor || style.backgroundColor === primaryColor) {
                usage.push({
                    selector: el.tagName.toLowerCase(),
                    property: style.color === primaryColor ? 'color' : 'backgroundColor',
                    elementType: el.getAttribute('data-element-type') || 'unknown'
                });
            }
        });
        return usage;
    }

    _findTextColorUsage(element, textColor) {
        const usage = [];
        const elements = element.querySelectorAll('*');
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.color === textColor) {
                usage.push({
                    selector: el.tagName.toLowerCase(),
                    elementType: el.getAttribute('data-element-type') || 'unknown'
                });
            }
        });
        return usage;
    }

    _findFontUsage(element, fontFamily) {
        const usage = [];
        const elements = element.querySelectorAll('*');
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.fontFamily.includes(fontFamily)) {
                usage.push({
                    selector: el.tagName.toLowerCase(),
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    elementType: el.getAttribute('data-element-type') || 'unknown'
                });
            }
        });
        return usage;
    }

    _updateGlobalMetrics(computedStyles, appliedScale) {
        for (const [elementType, styles] of computedStyles) {
            const fontSize = parseFloat(styles.fontSize);
            if (fontSize) {
                this.globalMetrics.minFontSize = Math.min(this.globalMetrics.minFontSize, fontSize);
                this.globalMetrics.maxFontSize = Math.max(this.globalMetrics.maxFontSize, fontSize);
            }
        }
        
        // Update average scale
        const currentScales = Array.from(this.capturedStates.values()).map(state => state.appliedScale);
        currentScales.push(appliedScale);
        this.globalMetrics.averageScale = currentScales.reduce((a, b) => a + b, 0) / currentScales.length;
    }

    getCapturedState(slideIndex) {
        return this.capturedStates.get(slideIndex);
    }

    getAllCapturedStates() {
        return this.capturedStates;
    }

    getGlobalConsistencyMetrics() {
        return {
            ...this.globalMetrics,
            totalSlides: this.capturedStates.size,
            consistencyScore: this._calculateConsistencyScore()
        };
    }

    _calculateConsistencyScore() {
        const states = Array.from(this.capturedStates.values());
        if (states.length === 0) return 0;

        const scaleVariance = this._calculateVariance(states.map(s => s.appliedScale));
        const fontSizeRange = this.globalMetrics.maxFontSize - this.globalMetrics.minFontSize;
        
        // Lower variance and smaller font size range indicate better consistency
        const scaleScore = Math.max(0, 1 - (scaleVariance * 10));
        const fontScore = Math.max(0, 1 - (fontSizeRange / 100));
        
        return (scaleScore + fontScore) / 2;
    }

    _calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    clearCapturedStates() {
        this.capturedStates.clear();
        this.globalMetrics = {
            minFontSize: Infinity,
            maxFontSize: 0,
            averageScale: 1
        };
    }
}

export class ConsistentPptxExportManager {
    constructor() {
        this.coordinateManager = new CoordinateManager();
        this.webStateCapture = new EnhancedWebStateCapture();
    }

    async exportWithWebConsistency(data, theme, capturedStates, globalScale) {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = data.slides?.[0]?.title || "Presentation";

        // Apply global theme with enhanced consistency
        this._applyEnhancedTheme(pptx, theme, capturedStates);

        console.log('🎯 Exporting with captured web states for maximum consistency');
        
        // Export each slide using captured web state
        for (const [slideIndex, capturedState] of capturedStates) {
            await this._createSlideFromWebState(pptx, capturedState, globalScale);
        }

        await pptx.writeFile({ fileName: `${pptx.title}.pptx` });
        return pptx;
    }

    _applyEnhancedTheme(pptx, theme, capturedStates) {
        const unifiedTheme = generateUnifiedThemeStyles(theme);
        
        // Enhanced theme object with consistency metrics
        const consistencyMetrics = this.webStateCapture.getGlobalConsistencyMetrics();
        
        pptx.theme = {
            background: unifiedTheme.background,
            text: unifiedTheme.text,
            accent1: unifiedTheme.primary,
            // Add theme consistency data
            _consistency: {
                globalScale: consistencyMetrics.averageScale,
                minFontSize: consistencyMetrics.minFontSize,
                maxFontSize: consistencyMetrics.maxFontSize,
                score: consistencyMetrics.consistencyScore
            }
        };

        // Set slide master with consistent formatting
        pptx.defineSlideMaster({
            title: 'WEB_CONSISTENT_MASTER',
            background: { color: unifiedTheme.background.replace('#', '') },
            objects: [
                // Define consistent text styles based on captured web state
                {
                    text: {
                        options: {
                            name: 'TITLE_STYLE',
                            fontFace: unifiedTheme.headingFont,
                            fontSize: Math.round(UNIFIED_FONT_SIZES.TITLE_NORMAL * consistencyMetrics.averageScale),
                            color: unifiedTheme.primary.replace('#', ''),
                            bold: true
                        }
                    }
                },
                {
                    text: {
                        options: {
                            name: 'CONTENT_STYLE',
                            fontFace: unifiedTheme.bodyFont,
                            fontSize: Math.round(UNIFIED_FONT_SIZES.CONTENT_NORMAL * consistencyMetrics.averageScale),
                            color: unifiedTheme.text.replace('#', '')
                        }
                    }
                }
            ]
        });
    }

    async _createSlideFromWebState(pptx, capturedState, globalScale) {
        const slide = pptx.addSlide({ 
            masterName: 'WEB_CONSISTENT_MASTER',
            bkgd: capturedState.theme.background.replace('#', '') 
        });

        // Process each captured element with web-state fidelity
        for (const [elementType, elementData] of capturedState.elements) {
            await this._recreateElementFromWebState(slide, elementType, elementData, capturedState, globalScale);
        }

        return slide;
    }

    async _recreateElementFromWebState(slide, elementType, elementData, capturedState, globalScale) {
        const { position, styling, content, isVisible, appliedScale } = elementData;
        
        if (!isVisible) return;

        const pptxCoords = this.coordinateManager.webToPptx(position);
        if (!pptxCoords) return;

        // Convert web styling to PPTX with maximum fidelity
        const pptxOptions = this._convertWebStyleToPptxFaithfully(styling, capturedState.theme, appliedScale, globalScale);

        switch (elementType) {
            case 'title':
                slide.addText(content.text, {
                    ...pptxCoords,
                    ...pptxOptions,
                    bold: true,
                    valign: 'top'
                });
                break;

            case 'content':
                this._recreateContentFromWebState(slide, content.items, pptxCoords, pptxOptions, capturedState);
                break;

            case 'image':
                if (content.src) {
                    slide.addImage({
                        path: content.src,
                        ...pptxCoords,
                        sizing: { type: 'contain' }
                    });
                }
                break;

            case 'timeline-item':
                // Handle timeline circles with exact web styling
                slide.addShape('roundRect', {
                    ...pptxCoords,
                    fill: { color: capturedState.theme.primary.replace('#', '') },
                    line: { width: 0 },
                    rectRadius: Math.min(pptxCoords.w, pptxCoords.h) / 2
                });
                
                if (content.text) {
                    slide.addText(content.text, {
                        ...pptxCoords,
                        ...pptxOptions,
                        align: 'center',
                        valign: 'middle',
                        color: capturedState.theme.background.replace('#', ''),
                        bold: true
                    });
                }
                break;

            default:
                if (content.text) {
                    slide.addText(content.text, {
                        ...pptxCoords,
                        ...pptxOptions,
                        valign: 'top'
                    });
                }
        }
    }

    _convertWebStyleToPptxFaithfully(webStyle, theme, appliedScale, globalScale) {
        // Extract actual pixel values from web styles
        const fontSize = this._extractPixelValue(webStyle.fontSize);
        const lineHeight = this._extractPixelValue(webStyle.lineHeight) || fontSize * 1.2;
        
        // Apply scaling with high fidelity
        const scaleFactor = Math.min(appliedScale, globalScale);
        const finalFontSize = Math.max(8, Math.round(fontSize * scaleFactor));
        
        return {
            fontSize: finalFontSize,
            fontFace: this._extractFontFamily(webStyle.fontFamily),
            color: this._convertColorToHex(webStyle.color),
            align: this._convertTextAlign(webStyle.textAlign),
            bold: this._extractBoldness(webStyle.fontWeight),
            // Preserve line spacing
            lineSpacing: Math.round((lineHeight / fontSize) * 100),
            // Preserve character spacing if needed
            charSpacing: webStyle.letterSpacing !== 'normal' ? this._extractPixelValue(webStyle.letterSpacing) : 0
        };
    }

    _extractPixelValue(cssValue) {
        if (!cssValue) return 0;
        const match = cssValue.match(/(\d+\.?\d*)px/);
        return match ? parseFloat(match[1]) : 0;
    }

    _extractFontFamily(fontFamily) {
        if (!fontFamily) return 'Inter';
        // Extract first font from font-family stack
        return fontFamily.split(',')[0].replace(/["']/g, '').trim();
    }

    _extractBoldness(fontWeight) {
        if (!fontWeight) return false;
        return fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 600;
    }

    _recreateContentFromWebState(slide, items, coords, baseOptions, capturedState) {
        if (!items || items.length === 0) return;

        const itemHeight = coords.h / items.length;
        
        items.forEach((item, index) => {
            const yPos = coords.y + (index * itemHeight);
            
            // Add bullet with exact web styling
            slide.addText('•', {
                x: coords.x,
                y: yPos,
                w: 0.25,
                h: itemHeight,
                ...baseOptions,
                fontSize: Math.round(baseOptions.fontSize * 1.2),
                color: capturedState.theme.primary.replace('#', ''),
                bold: true,
                valign: 'top'
            });

            const textX = coords.x + 0.25;
            const textW = coords.w - 0.25;

            // Recreate text content with exact web formatting
            if (item.hasTitle && item.description) {
                slide.addText([
                    { 
                        text: `${item.title}: `, 
                        options: { 
                            ...baseOptions, 
                            bold: true,
                            color: capturedState.theme.primary.replace('#', '')
                        } 
                    },
                    { 
                        text: item.description, 
                        options: {
                            ...baseOptions,
                            color: capturedState.theme.text.replace('#', '')
                        }
                    }
                ], {
                    x: textX,
                    y: yPos,
                    w: textW,
                    h: itemHeight,
                    valign: 'top'
                });
            } else {
                const text = item.title || item.description;
                if (text) {
                    slide.addText(text, {
                        x: textX,
                        y: yPos,
                        w: textW,
                        h: itemHeight,
                        ...baseOptions,
                        bold: item.hasTitle,
                        color: item.hasTitle ? 
                            capturedState.theme.primary.replace('#', '') : 
                            capturedState.theme.text.replace('#', ''),
                        valign: 'top'
                    });
                }
            }
        });
    }

    _convertColorToHex(color) {
        if (!color) return '000000';
        
        if (color.startsWith('#')) {
            return color.replace('#', '');
        }
        
        if (color.startsWith('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                return matches.slice(0, 3)
                    .map(x => parseInt(x).toString(16).padStart(2, '0'))
                    .join('');
            }
        }
        
        // Fallback for named colors or other formats
        return '000000';
    }

    _convertTextAlign(align) {
        const alignMap = {
            'left': 'left',
            'center': 'center',
            'right': 'right',
            'justify': 'justify',
            'start': 'left',
            'end': 'right'
        };
        return alignMap[align] || 'left';
    }
}

// Helper class for coordinate management (keeping existing functionality)
export class CoordinateManager {
    static PPTX_DIMENSIONS = { WIDTH: 10, HEIGHT: 5.625 };

    webToPptx(webCoords) {
        if (!this.isValidWebCoordinate(webCoords)) return null;
        const { x, y, w, h } = webCoords;
        return { 
            x: x * CoordinateManager.PPTX_DIMENSIONS.WIDTH, 
            y: y * CoordinateManager.PPTX_DIMENSIONS.HEIGHT, 
            w: w * CoordinateManager.PPTX_DIMENSIONS.WIDTH, 
            h: h * CoordinateManager.PPTX_DIMENSIONS.HEIGHT 
        };
    }

    isValidWebCoordinate(coords) {
        if (!coords || typeof coords !== 'object') return false;
        const { x, y, w, h } = coords;
        return [x, y, w, h].every(val => typeof val === 'number' && isFinite(val)) && w >= 0 && h >= 0;
    }

    validateAndNormalizeLayout(layout) {
        if (!layout || typeof layout !== 'object') return null;
        const validatedLayout = {};
        for (const key in layout) {
            if (Object.prototype.hasOwnProperty.call(layout, key) && layout[key] && this.isValidWebCoordinate(layout[key])) {
                validatedLayout[key] = layout[key];
            }
        }
        return Object.keys(validatedLayout).length > 0 ? validatedLayout : null;
    }
}