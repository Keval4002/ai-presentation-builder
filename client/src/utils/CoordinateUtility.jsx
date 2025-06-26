import PptxGenJS from 'pptxgenjs';
import { parseContentForUniformity, FIXED_FONT_SIZES, colorToHex } from './UnifiedContentProcessor';

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

    calculateOptimalImageSizing(imageCoords) {
        if (!imageCoords) return { type: 'contain' };
        
        const { w: width, h: height } = imageCoords;
        const aspectRatio = width / height;
        const area = width * height;
        
        // For large containers, use crop to fill space better
        if (area > 15 && aspectRatio > 1.5) {
            return { type: 'crop', fit: 'cover' };
        }
        
        // For narrow containers, ensure image fits properly
        if (aspectRatio < 0.8) {
            return { type: 'contain', fit: 'contain' };
        }
        
        // For standard containers, use contain with proper fit
        return { type: 'contain', fit: 'contain' };
    }

    analyzeContentDensity(slides, measuredLayouts) {
        const contentAnalysis = slides.map((slide, index) => {
            const layout = measuredLayouts[index];
            if (!layout) return { density: 0, charCount: 0, itemCount: 0 };
            
            const parsedContent = parseContentForUniformity(slide.content);
            const totalChars = parsedContent.items.reduce((sum, item) => 
                sum + (item.title?.length || 0) + (item.description?.length || 0), 0
            );
            
            const titleChars = slide.title?.length || 0;
            const contentKeys = Object.keys(layout).filter(k => k.startsWith('content') || k.match(/^item\d+T$/));
            const avgContainerArea = contentKeys.reduce((sum, key) => {
                const coords = layout[key];
                return sum + (coords ? coords.w * coords.h : 0);
            }, 0) / Math.max(contentKeys.length, 1);
            
            const density = avgContainerArea > 0 ? (totalChars + titleChars) / avgContainerArea : 0;
            
            return {
                density,
                charCount: totalChars + titleChars,
                itemCount: parsedContent.totalItems,
                containerArea: avgContainerArea,
                slideIndex: index
            };
        });
        
        return contentAnalysis.filter(analysis => analysis.density > 0);
    }

    calculateSafePptxFontSizes(slides, measuredLayouts) {
        const contentAnalysis = this.analyzeContentDensity(slides, measuredLayouts);
        if (contentAnalysis.length === 0) return FIXED_FONT_SIZES;
        
        const maxDensity = Math.max(...contentAnalysis.map(a => a.density));
        const maxItems = Math.max(...contentAnalysis.map(a => a.itemCount));
        
        let scaleFactor = 1;
        if (maxDensity > 800) scaleFactor = 0.7;
        else if (maxDensity > 500) scaleFactor = 0.8;
        else if (maxDensity > 300) scaleFactor = 0.9;
        else if (maxItems > 8) scaleFactor = 0.85;
        else if (maxItems > 6) scaleFactor = 0.95;
        
        return {
            TITLE_SLIDE: Math.max(24, Math.round(FIXED_FONT_SIZES.TITLE_SLIDE * scaleFactor)),
            TITLE_NORMAL: Math.max(18, Math.round(FIXED_FONT_SIZES.TITLE_NORMAL * scaleFactor)),
            CONTENT_NORMAL: Math.max(10, Math.round(FIXED_FONT_SIZES.CONTENT_NORMAL * scaleFactor)),
            CONTENT_TIMELINE: Math.max(9, Math.round(FIXED_FONT_SIZES.CONTENT_TIMELINE * scaleFactor)),
        };
    }

    _getPptxTextOptions(type, theme) {
        const configs = {
            title: { fontSize: FIXED_FONT_SIZES.TITLE_NORMAL, fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true },
            title_slide: { fontSize: FIXED_FONT_SIZES.TITLE_SLIDE, fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true, align: 'center' },
            content_title: { fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL, fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
            content_desc: { fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL, fontFaceKey: 'body_font', colorKey: 'text_color', bold: false },
            timeline: { fontSize: FIXED_FONT_SIZES.CONTENT_TIMELINE, fontFaceKey: 'body_font', colorKey: 'text_color' },
            timeline_bullet: { fontSize: FIXED_FONT_SIZES.CONTENT_TIMELINE, fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
        };

        const config = configs[type] || configs.content_desc;
        
        return {
            fontFace: theme[config.fontFaceKey],
            color: colorToHex(theme[config.colorKey]) || '000000',
            bold: config.bold || false,
            align: config.align || 'left',
            fontSize: config.fontSize,
        };
    }

    _getPptxTextOptionsWithScale(type, theme, scale) {
        const configs = {
            title: { fontSize: FIXED_FONT_SIZES.TITLE_NORMAL, fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true },
            title_slide: { fontSize: FIXED_FONT_SIZES.TITLE_SLIDE, fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true, align: 'center' },
            content_title: { fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL, fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
            content_desc: { fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL, fontFaceKey: 'body_font', colorKey: 'text_color', bold: false },
            timeline: { fontSize: FIXED_FONT_SIZES.CONTENT_TIMELINE, fontFaceKey: 'body_font', colorKey: 'text_color' },
            timeline_bullet: { fontSize: FIXED_FONT_SIZES.CONTENT_TIMELINE, fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
        };

        const config = configs[type] || configs.content_desc;
        
        return {
            fontFace: theme[config.fontFaceKey],
            color: colorToHex(theme[config.colorKey]) || '000000',
            bold: config.bold || false,
            align: config.align || 'left',
            fontSize: Math.max(8, Math.round(config.fontSize * scale)),
        };
    }
    
    async exportPresentation(data, measuredLayouts) {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = data.slides?.[0]?.title || "Presentation";

        data.slides.forEach((slideData, index) => {
            const measurements = this.coordinateManager.validateAndNormalizeLayout(measuredLayouts[index]);
            if (measurements) {
                this.addSlide(pptx, slideData, measurements, data.theme);
            }
        });

        await pptx.writeFile({ fileName: `${pptx.title}.pptx` });
    }

    async exportPresentationWithUniformScale(data, theme, measuredLayouts, globalScale) {
        const safeFontSizes = this.calculateSafePptxFontSizes(data.slides, measuredLayouts);
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = data.slides?.[0]?.title || "Presentation";

        data.slides.forEach((slideData, index) => {
            const measurements = this.coordinateManager.validateAndNormalizeLayout(measuredLayouts[index]);
            if (measurements) {
                this.addSlideWithSafeSizes(pptx, slideData, measurements, theme, safeFontSizes);
            } else {
                console.warn(`⚠️ Skipping Slide ${index + 1} - missing or invalid layout measurements.`);
            }
        });

        await pptx.writeFile({ fileName: `${pptx.title}.pptx` });
    }

    addSlideWithSafeSizes(pptx, slideData, measurements, theme, safeFontSizes) {
        const backgroundHex = colorToHex(theme.background_color);
        const slide = pptx.addSlide();
        
        // Set background color using fill property
        if (backgroundHex) {
            slide.background = { fill: backgroundHex };
        }
        
        const isTitleSlide = slideData.type === 'TitleSlide' || slideData.type === 'Q&A';
        const parsedContent = parseContentForUniformity(slideData.content);

        if (measurements.title && slideData.title) {
            const titleCoords = this.coordinateManager.webToPptx(measurements.title);
            const titleOptions = this._getPptxTextOptionsWithSafeSizes(isTitleSlide ? 'title_slide' : 'title', theme, safeFontSizes);
            slide.addText(slideData.title, { ...titleCoords, ...titleOptions, valign: 'top' });
        }

        if (measurements.image && slideData.imageUrl) {
            const imageCoords = this.coordinateManager.webToPptx(measurements.image);
            const imageSizing = this.calculateOptimalImageSizing(imageCoords);
            slide.addImage({ 
                path: slideData.imageUrl, 
                ...imageCoords,
                sizing: imageSizing
            });
        }
        
        const timelineKeys = Object.keys(measurements).filter(k => k.match(/^item\d+T$/));
        if (timelineKeys.length > 0) {
            this.addTimelineContentWithSafeSizes(slide, parsedContent.items, measurements, theme, safeFontSizes, timelineKeys);
        } else {
            const contentKeys = Object.keys(measurements).filter(k => k.startsWith('content'));
            contentKeys.forEach((key, i) => {
                const itemsForBlock = (contentKeys.length > 1) ? 
                    (parsedContent.items[i] ? [parsedContent.items[i]] : []) : 
                    parsedContent.items;
                if (itemsForBlock.length > 0) {
                    this.addStandardContentWithSafeSizes(slide, itemsForBlock, measurements[key], theme, safeFontSizes);
                }
            });
        }
    }

    _getPptxTextOptionsWithSafeSizes(type, theme, safeFontSizes) {
        const configs = {
            title: { fontSizeKey: 'TITLE_NORMAL', fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true },
            title_slide: { fontSizeKey: 'TITLE_SLIDE', fontFaceKey: 'heading_font', colorKey: 'primary_color', bold: true, align: 'center' },
            content_title: { fontSizeKey: 'CONTENT_NORMAL', fontFaceKey: 'body_font', colorKey: 'primary_color', bold: true },
            content_desc: { fontSizeKey: 'CONTENT_NORMAL', fontFaceKey: 'body_font', colorKey: 'text_color', bold: false },
            timeline: { fontSizeKey: 'CONTENT_TIMELINE', fontFaceKey: 'body_font', colorKey: 'text_color' },
        };

        const config = configs[type] || configs.content_desc;
        
        return {
            fontFace: theme[config.fontFaceKey],
            color: colorToHex(theme[config.colorKey]) || '000000',
            bold: config.bold || false,
            align: config.align || 'left',
            fontSize: safeFontSizes[config.fontSizeKey],
        };
    }

    _addBulletedTextWithSafeSizes(slide, item, coords, theme, safeFontSizes) {
        if (!item) return;
        
        slide.addText('•', {
            ...coords, w: 0.25,
            fontFace: theme.body_font, 
            color: colorToHex(theme.primary_color) || '000000',
            fontSize: Math.round(safeFontSizes.CONTENT_NORMAL * 1.2),
            bold: true, valign: 'top'
        });

        const textX = coords.x + 0.25;
        const textW = coords.w - 0.25;
        
        if (item.hasTitle && item.description) {
            slide.addText([
                { 
                    text: `${item.title}: `, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: colorToHex(theme.primary_color) || '000000',
                        fontSize: safeFontSizes.CONTENT_NORMAL,
                        bold: true 
                    } 
                },
                { 
                    text: item.description, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: colorToHex(theme.text_color) || '000000',
                        fontSize: safeFontSizes.CONTENT_NORMAL,
                        bold: false 
                    } 
                }
            ], { x: textX, y: coords.y, w: textW, h: coords.h, valign: 'top' });
        } else {
            const text = item.title || item.description;
            const options = {
                fontFace: theme.body_font,
                color: colorToHex(item.hasTitle ? theme.primary_color : theme.text_color) || '000000',
                fontSize: safeFontSizes.CONTENT_NORMAL,
                bold: item.hasTitle,
                valign: 'top'
            };
            if (text) slide.addText(text, { x: textX, y: coords.y, w: textW, h: coords.h, ...options });
        }
    }

    addStandardContentWithSafeSizes(slide, items, contentCoords, theme, safeFontSizes) {
        const pptxCoords = this.coordinateManager.webToPptx(contentCoords);
        if (!pptxCoords || items.length === 0) return;

        const itemHeight = pptxCoords.h / items.length;

        items.forEach((item, i) => {
            const itemCoords = { ...pptxCoords, y: pptxCoords.y + (i * itemHeight), h: itemHeight };
            this._addBulletedTextWithSafeSizes(slide, item, itemCoords, theme, safeFontSizes);
        });
    }

    addTimelineContentWithSafeSizes(slide, items, measurements, theme, safeFontSizes, timelineKeys) {
        timelineKeys.forEach((key, i) => {
            const item = items[i];
            if (!item) return;

            const circleKey = `item${i}C`;
            if (measurements[circleKey]) {
                const circleCoords = this.coordinateManager.webToPptx(measurements[circleKey]);
                slide.addShape('roundRect', { 
                    ...circleCoords, 
                    fill: { color: colorToHex(theme.primary_color) || '000000' }, 
                    line: { width: 0 }, 
                    rectRadius: Math.min(circleCoords.w, circleCoords.h) / 2 
                });
                slide.addText(`${i + 1}`, { 
                    ...circleCoords, 
                    fontFace: theme.body_font,
                    color: colorToHex(theme.background_color) || 'FFFFFF', 
                    fontSize: safeFontSizes.CONTENT_TIMELINE,
                    bold: true, 
                    align: 'center', 
                    valign: 'middle' 
                });
            }

            const textCoords = this.coordinateManager.webToPptx(measurements[key]);
            if (textCoords) {
                this._addBulletedTextWithSafeSizes(slide, item, textCoords, theme, safeFontSizes);
            }
        });
    }
    _addBulletedTextWithScale(slide, item, coords, theme, scale) {
        if (!item) return;
        
        slide.addText('•', {
            ...coords, w: 0.25,
            fontFace: theme.body_font, 
            color: colorToHex(theme.primary_color) || '000000',
            fontSize: Math.max(8, Math.round(FIXED_FONT_SIZES.CONTENT_NORMAL * 1.2 * scale)),
            bold: true, valign: 'top'
        });

        const textX = coords.x + 0.25;
        const textW = coords.w - 0.25;
        
        if (item.hasTitle && item.description) {
            slide.addText([
                { 
                    text: `${item.title}: `, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: colorToHex(theme.primary_color) || '000000',
                        fontSize: Math.max(8, Math.round(FIXED_FONT_SIZES.CONTENT_NORMAL * scale)),
                        bold: true 
                    } 
                },
                { 
                    text: item.description, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: colorToHex(theme.text_color) || '000000',
                        fontSize: Math.max(8, Math.round(FIXED_FONT_SIZES.CONTENT_NORMAL * scale)),
                        bold: false 
                    } 
                }
            ], { x: textX, y: coords.y, w: textW, h: coords.h, valign: 'top' });
        } else {
            const text = item.title || item.description;
            const options = {
                fontFace: theme.body_font,
                color: colorToHex(item.hasTitle ? theme.primary_color : theme.text_color) || '000000',
                fontSize: Math.max(8, Math.round(FIXED_FONT_SIZES.CONTENT_NORMAL * scale)),
                bold: item.hasTitle,
                valign: 'top'
            };
            if (text) slide.addText(text, { x: textX, y: coords.y, w: textW, h: coords.h, ...options });
        }
    }

    addStandardContentWithScale(slide, items, contentCoords, theme, scale) {
        const pptxCoords = this.coordinateManager.webToPptx(contentCoords);
        if (!pptxCoords || items.length === 0) return;

        const itemHeight = pptxCoords.h / items.length;

        items.forEach((item, i) => {
            const itemCoords = { ...pptxCoords, y: pptxCoords.y + (i * itemHeight), h: itemHeight };
            this._addBulletedTextWithScale(slide, item, itemCoords, theme, scale);
        });
    }

    addTimelineContentWithScale(slide, items, measurements, theme, scale, timelineKeys) {
        timelineKeys.forEach((key, i) => {
            const item = items[i];
            if (!item) return;

            const circleKey = `item${i}C`;
            if (measurements[circleKey]) {
                const circleCoords = this.coordinateManager.webToPptx(measurements[circleKey]);
                slide.addShape('roundRect', { 
                    ...circleCoords, 
                    fill: { color: colorToHex(theme.primary_color) || '000000' }, 
                    line: { width: 0 }, 
                    rectRadius: Math.min(circleCoords.w, circleCoords.h) / 2 
                });
                slide.addText(`${i + 1}`, { 
                    ...circleCoords, 
                    fontFace: theme.body_font,
                    color: colorToHex(theme.background_color) || 'FFFFFF', 
                    fontSize: Math.max(8, Math.round(FIXED_FONT_SIZES.CONTENT_TIMELINE * scale)),
                    bold: true, 
                    align: 'center', 
                    valign: 'middle' 
                });
            }

            const textCoords = this.coordinateManager.webToPptx(measurements[key]);
            if (textCoords) {
                this._addBulletedTextWithScale(slide, item, textCoords, theme, scale);
            }
        });
    }

    addSlide(pptx, slideData, measurements, theme) {
        const backgroundHex = colorToHex(theme.background_color);
        const slide = pptx.addSlide();
        
        // Set background color using fill property
        if (backgroundHex) {
            slide.background = { fill: backgroundHex };
        }
        const isTitleSlide = slideData.type === 'TitleSlide' || slideData.type === 'Q&A';
        const parsedContent = parseContentForUniformity(slideData.content);

        if (measurements.title && slideData.title) {
            const titleCoords = this.coordinateManager.webToPptx(measurements.title);
            const titleOptions = this._getPptxTextOptions(isTitleSlide ? 'title_slide' : 'title', theme);
            slide.addText(slideData.title, { ...titleCoords, ...titleOptions, valign: 'top' });
        }

        if (measurements.image && slideData.imageUrl) {
            const imageCoords = this.coordinateManager.webToPptx(measurements.image);
            const imageSizing = this.calculateOptimalImageSizing(imageCoords);
            slide.addImage({ 
                path: slideData.imageUrl, 
                ...imageCoords,
                sizing: imageSizing
            });
        }
        
        const timelineKeys = Object.keys(measurements).filter(k => k.match(/^item\d+T$/));
        if (timelineKeys.length > 0) {
            this.addTimelineContent(slide, parsedContent.items, measurements, theme, timelineKeys);
        } else {
            const contentKeys = Object.keys(measurements).filter(k => k.startsWith('content'));
            contentKeys.forEach((key, i) => {
                const itemsForBlock = (contentKeys.length > 1) ? 
                    (parsedContent.items[i] ? [parsedContent.items[i]] : []) : 
                    parsedContent.items;
                if (itemsForBlock.length > 0) {
                    this.addStandardContent(slide, itemsForBlock, measurements[key], theme);
                }
            });
        }
    }
    
    _addBulletedText(slide, item, coords, theme) {
        if (!item) return;
        
        slide.addText('•', {
            ...coords, w: 0.25,
            fontFace: theme.body_font, 
            color: colorToHex(theme.primary_color) || '000000',
            fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL * 1.2,
            bold: true, valign: 'top'
        });

        const textX = coords.x + 0.25;
        const textW = coords.w - 0.25;
        
        if (item.hasTitle && item.description) {
            slide.addText([
                { 
                    text: `${item.title}: `, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: colorToHex(theme.primary_color) || '000000',
                        fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL,
                        bold: true 
                    } 
                },
                { 
                    text: item.description, 
                    options: { 
                        fontFace: theme.body_font, 
                        color: colorToHex(theme.text_color) || '000000',
                        fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL,
                        bold: false 
                    } 
                }
            ], { x: textX, y: coords.y, w: textW, h: coords.h, valign: 'top' });
        } else {
            const text = item.title || item.description;
            const options = {
                fontFace: theme.body_font,
                color: colorToHex(item.hasTitle ? theme.primary_color : theme.text_color) || '000000',
                fontSize: FIXED_FONT_SIZES.CONTENT_NORMAL,
                bold: item.hasTitle,
                valign: 'top'
            };
            if (text) slide.addText(text, { x: textX, y: coords.y, w: textW, h: coords.h, ...options });
        }
    }

    addStandardContent(slide, items, contentCoords, theme) {
        const pptxCoords = this.coordinateManager.webToPptx(contentCoords);
        if (!pptxCoords || items.length === 0) return;

        const itemHeight = pptxCoords.h / items.length;

        items.forEach((item, i) => {
            const itemCoords = { ...pptxCoords, y: pptxCoords.y + (i * itemHeight), h: itemHeight };
            this._addBulletedText(slide, item, itemCoords, theme);
        });
    }

    addTimelineContent(slide, items, measurements, theme, timelineKeys) {
        timelineKeys.forEach((key, i) => {
            const item = items[i];
            if (!item) return;

            const circleKey = `item${i}C`;
            if (measurements[circleKey]) {
                const circleCoords = this.coordinateManager.webToPptx(measurements[circleKey]);
                slide.addShape('roundRect', { 
                    ...circleCoords, 
                    fill: { color: colorToHex(theme.primary_color) || '000000' }, 
                    line: { width: 0 }, 
                    rectRadius: Math.min(circleCoords.w, circleCoords.h) / 2 
                });
                slide.addText(`${i + 1}`, { 
                    ...circleCoords, 
                    fontFace: theme.body_font,
                    color: colorToHex(theme.background_color) || 'FFFFFF', 
                    fontSize: FIXED_FONT_SIZES.CONTENT_TIMELINE,
                    bold: true, 
                    align: 'center', 
                    valign: 'middle' 
                });
            }

            const textCoords = this.coordinateManager.webToPptx(measurements[key]);
            if (textCoords) {
                this._addBulletedText(slide, item, textCoords, theme);
            }
        });
    }
}