export const FIXED_FONT_SIZES = {
    TITLE_SLIDE: 44,
    TITLE_NORMAL: 28,
    CONTENT_NORMAL: 16,
    CONTENT_TIMELINE: 14,
};

export function ensureHexColor(color) {
    if (!color) return null;
    if (color.startsWith('#')) return color;
    if (color.match(/^[0-9A-Fa-f]{6}$/)) return `#${color}`;
    return color;
}

export function colorToHex(color) {
    const hex = ensureHexColor(color);
    return hex ? hex.replace('#', '') : null;
}

function cleanMarkdown(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\*\*(.*?)\*\*|\*(.*?)\*/g, '$1$2').replace(/\s+/g, ' ').trim();
}

export function parseContentForUniformity(content) {
    if (!content || typeof content !== 'string') {
        return { items: [], totalItems: 0 };
    }
    
    const boldTitleRegex = /^(?:[-*•▪▫▸▹◦‣⁃]\s*)?\*\*(.*?)\*\*(?::\s*(.*))?$/;
    const lines = content.split('\n').filter(line => line.trim());
    const items = [];
    let currentItem = null;

    for (const line of lines) {
        const trimmed = line.trim();
        const boldMatch = trimmed.match(boldTitleRegex);

        if (boldMatch) {
            if (currentItem) items.push(currentItem);
            currentItem = {
                title: cleanMarkdown(boldMatch[1]),
                description: cleanMarkdown(boldMatch[2] || ''),
                hasTitle: true,
            };
        } else {
            const cleanedLine = cleanMarkdown(trimmed.replace(/^[-*•▪▫▸▹◦‣⁃]\s*/, ''));
            if (currentItem) {
                currentItem.description += (currentItem.description ? ' ' : '') + cleanedLine;
            } else {
                items.push({ title: '', description: cleanedLine, hasTitle: false });
            }
        }
    }
    if (currentItem) items.push(currentItem);

    return { items, totalItems: items.length };
}

export function generateUnifiedThemeStyles(theme) {
    return {
        background: theme.background_color || '#FFFFFF',
        primary: theme.primary_color || '#1f2937',
        text: theme.text_color || '#374151',
        headingFont: theme.heading_font || 'Inter',
        bodyFont: theme.body_font || 'Inter',
    };
}