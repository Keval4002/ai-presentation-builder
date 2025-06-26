import { parseContentForUniformity } from './UnifiedContentProcessor';

export function parseStructuredContent(content) {
    const result = parseContentForUniformity(content);
    return result.items.map(item => ({
        title: item.title || '',
        description: item.description || ''
    }));
}