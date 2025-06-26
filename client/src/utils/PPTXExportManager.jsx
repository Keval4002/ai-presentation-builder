import PptxGenJS from 'pptxgenjs';
import { parseContentForUniformity, getDynamicFontSizes, calculateOptimalFontSize } from './UnifiedContentProcessor';

export const PPTX_DIMENSIONS = { WIDTH: 10, HEIGHT: 5.625 };

export class CoordinateManager {
    webToPptx(webCoords) {
        if (!this.isValidWebCoordinate(webCoords)) return null;
        const { x, y, w, h } = webCoords;
        return { 
            x: x * PPTX_DIMENSIONS.WIDTH, 
            y: y * PPTX_DIMENSIONS.HEIGHT, 
            w: w * PPTX_DIMENSIONS.WIDTH, 
            h: h * PPTX_DIMENSIONS.HEIGHT 
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

export class PptxExportManager {
    constructor() {
        this.coordinateManager = new CoordinateManager();
    }

    _getPptxTextOptions(type, theme, containerDimensions, content = '') {
        const fontSizes = getDynamicFontSizes(theme);
        const baseSize = fontSizes[type] || fontSizes.CONTENT_NORMAL;
        
        const optimalSize = calculateOptimalFontSize(content, containerDimensions, theme, type);
        const fontSize = Math.max(8, Math.min(optimalSize, baseSize * 1.2));

        const configs = {
            title: { fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true },
            title_slide: { fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true, align: 'center' },
            content_title: { fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
            content_desc: { fontFaceKey: 'body_font', colorKey: 'text_color', bold: false },
            timeline: { fontFaceKey: 'body_font', colorKey: 'text_color' },
            timeline_bullet: { fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
        };

        const config = configs[type] || configs.content_desc;
        
        return {
            fontFace: theme[config.fontFaceKey],
            color: theme[config.colorKey].replace('#', ''),
            bold: config.bold || false,
            align: config.align || 'left',
            fontSize: fontSize,
        };
    }
    
    async exportPresentation(data, measuredLayouts, contentMeasurements = {}) {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = data.slides?.[0]?.title || "Presentation";

        data.slides.forEach((slideData, index) => {
            const measurements = this.coordinateManager.validateAndNormalizeLayout(measuredLayouts[index]);
            if (measurements) {
                this.addSlide(pptx, slideData, measurements, data.theme, contentMeasurements[index] || {});
            }
        });

        await pptx.writeFile({ fileName: `${pptx.title}.pptx` });
    }

    addSlide(pptx, slideData, measurements, theme, contentMeasurements) {
        const slide = pptx.addSlide({ bkgd: theme.background_color.replace('#', '') });
        const isTitleSlide = slideData.type === 'TitleSlide' || slideData.type === 'Q&A';
        const parsedContent = parseContentForUniformity(slideData.content);

        if (measurements.title && slideData.title) {
            const titleCoords = this.coordinateManager.webToPptx(measurements.title);
            const titleOptions = this._getPptxTextOptions(
                isTitleSlide ? 'title_slide' : 'title', 
                theme, 
                titleCoords, 
                slideData.title
            );
            slide.addText(slideData.title, { ...titleCoords, ...titleOptions, valign: 'top' });
        }

        if (measurements.image && slideData.imageUrl) {
            slide.addImage({ 
                path: slideData.imageUrl, 
                ...this.coordinateManager.webToPptx(measurements.image), 
                sizing: { type: 'contain' } 
            });
        }
        
        const timelineKeys = Object.keys(measurements).filter(k => k.match(/^item\d+T$/));
        if (timelineKeys.length > 0) {
            this.addTimelineContent(slide, parsedContent.items, measurements, theme, contentMeasurements, timelineKeys);
        } else {
            const contentKeys = Object.keys(measurements).filter(k => k.startsWith('content'));
            contentKeys.forEach((key, i) => {
                const itemsForBlock = (contentKeys.length > 1) ? 
                    (parsedContent.items[i] ? [parsedContent.items[i]] : []) : 
                    parsedContent.items;
                if (itemsForBlock.length > 0) {
                    const contentMeasurement = contentMeasurements[key] || {};
                    this.addStandardContent(slide, itemsForBlock, measurements[key], theme, contentMeasurement);
                }
            });
        }
    }
    
    _addBulletedText(slide, item, coords, theme, contentMeasurement) {
        if (!item) return;
        
        slide.addText('•', {
            ...coords, w: 0.25,
            fontFace: theme.body_font, 
            color: theme.primary_color.replace('#', ''),
            fontSize: Math.max(10, (contentMeasurement.calculatedFontSize || 16) * 1.2),
            bold: true, valign: 'top'
        });

        const textX = coords.x + 0.25;
        const textW = coords.w - 0.25;
        const baseFontSize = contentMeasurement.calculatedFontSize || 16;
        
        if (item.hasTitle && item.description) {
            slide.addText([
                { 
                    text: `${item.title}: `, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: theme.primary_color.replace('#', ''),
                        fontSize: Math.max(10, baseFontSize),
                        bold: true 
                    } 
                },
                { 
                    text: item.description, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: theme.text_color.replace('#', ''),
                        fontSize: Math.max(10, baseFontSize),
                        bold: false 
                    } 
                }
            ], { x: textX, y: coords.y, w: textW, h: coords.h, valign: 'top' });
        } else {
            const text = item.title || item.description;
            const options = {
                fontFace: theme.body_font,
                color: (item.hasTitle ? theme.primary_color : theme.text_color).replace('#', ''),
                fontSize: Math.max(10, baseFontSize),
                bold: item.hasTitle,
                valign: 'top'
            };
            if (text) slide.addText(text, { x: textX, y: coords.y, w: textW, h: coords.h, ...options });
        }
    }

    addStandardContent(slide, items, contentCoords, theme, contentMeasurement) {
        const pptxCoords = this.coordinateManager.webToPptx(contentCoords);
        if (!pptxCoords || items.length === 0) return;

        const itemHeight = pptxCoords.h / items.length;

        items.forEach((item, i) => {
            const itemCoords = { ...pptxCoords, y: pptxCoords.y + (i * itemHeight), h: itemHeight };
            this._addBulletedText(slide, item, itemCoords, theme, contentMeasurement);
        });
    }

    addTimelineContent(slide, items, measurements, theme, contentMeasurements, timelineKeys) {
        timelineKeys.forEach((key, i) => {
            const item = items[i];
            if (!item) return;

            const circleKey = `item${i}C`;
            if (measurements[circleKey]) {
                const circleCoords = this.coordinateManager.webToPptx(measurements[circleKey]);
                slide.addShape('roundRect', { 
                    ...circleCoords, 
                    fill: { color: theme.primary_color.replace('#', '') }, 
                    line: { width: 0 }, 
                    rectRadius: Math.min(circleCoords.w, circleCoords.h) / 2 
                });
                slide.addText(`${i + 1}`, { 
                    ...circleCoords, 
                    fontFace: theme.body_font,
                    color: theme.background_color.replace('#', ''), 
                    fontSize: Math.max(10, (contentMeasurements[key]?.calculatedFontSize || 14)),
                    bold: true, 
                    align: 'center', 
                    valign: 'middle' 
                });
            }

            const textCoords = this.coordinateManager.webToPptx(measurements[key]);
            if (textCoords) {
                this._addBulletedText(slide, item, textCoords, theme, contentMeasurements[key] || {});
            }
        });
    }
}