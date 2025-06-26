export class SmartLayoutManager {
    generatePositions(layoutConfig) {
        const { name, params = {} } = layoutConfig;
        const layoutMethods = {
            'coordinate': () => ({ name, positions: params.positions }),
            'title-special': () => ({ name, positions: this.getTitleSpecialPositions(params) }),
            'alternating-split': () => ({ name, positions: this.getAlternatingSplitPositions(params) }),
            'image-content-stack': () => ({ name, positions: this.getImageContentStackPositions() }),
            'image-focus': () => ({ name, positions: this.getImageFocusPositions(params) }),
            'multi-column': () => ({ name, positions: this.getMultiColumnPositions(params) }),
            'compact-list': () => ({ name, positions: this.getCompactListPositions() }),
            'zigzag-timeline': () => ({ name, positions: this.getZigZagTimelinePositions(params) }),
            'pyramid': () => ({ name, positions: this.getPyramidPositions(params) }),
            'standard-text': () => ({ name, positions: this.getStandardTextPositions(params) }),
        };
        return (layoutMethods[name] || layoutMethods['standard-text'])();
    }
    
    getTitleSpecialPositions({ hasImage }) {
        return { title: { x: 0.1, y: 0.3, w: 0.8, h: 0.4 }, image: hasImage ? { x: 0.4, y: 0.75, w: 0.2, h: 0.15 } : null };
    }
    getStandardTextPositions({ titleHeight = 0.15 }) {
        const contentY = 0.1 + titleHeight + 0.05;
        return { title: { x: 0.05, y: 0.1, w: 0.9, h: titleHeight }, content: { x: 0.05, y: contentY, w: 0.9, h: 1 - contentY - 0.1 } };
    }
    getAlternatingSplitPositions({ isImageLeft }) {
        const textX = isImageLeft ? 0.52 : 0.05;
        const imageX = isImageLeft ? 0.05 : 0.52;
        return { title: { x: textX, y: 0.1, w: 0.43, h: 0.15 }, content: { x: textX, y: 0.28, w: 0.43, h: 0.62 }, image: { x: imageX, y: 0.15, w: 0.43, h: 0.7 } };
    }
    getImageContentStackPositions() {
        return { title: { x: 0.05, y: 0.05, w: 0.9, h: 0.12 }, image: { x: 0.1, y: 0.2, w: 0.8, h: 0.4 }, content: { x: 0.05, y: 0.62, w: 0.9, h: 0.33 } };
    }
    getImageFocusPositions({ isImageLeft }) {
        const textX = isImageLeft ? 0.68 : 0.05;
        const imageX = isImageLeft ? 0.05 : 0.32;
        return { title: { x: textX, y: 0.2, w: 0.27, h: 0.15 }, content: { x: textX, y: 0.38, w: 0.27, h: 0.42 }, image: { x: imageX, y: 0.1, w: 0.6, h: 0.8 } };
    }
    getCompactListPositions() {
        return { title: { x: 0.05, y: 0.05, w: 0.9, h: 0.1 }, content: { x: 0.05, y: 0.18, w: 0.9, h: 0.77 } };
    }
    getMultiColumnPositions({ columns = 2 }) {
        const positions = { title: { x: 0.05, y: 0.05, w: 0.9, h: 0.1 } };
        const colWidth = 0.9 / columns;
        for (let i = 0; i < columns; i++) {
            positions[`content${i}`] = { x: 0.05 + i * colWidth, y: 0.18, w: colWidth - 0.02, h: 0.77 };
        }
        return positions;
    }
    getZigZagTimelinePositions({ itemCount }) {
        const positions = { title: { x: 0.05, y: 0.02, w: 0.9, h: 0.13 } };
        const itemHeight = Math.max(0.08, 0.8 / itemCount);
        for (let i = 0; i < itemCount; i++) {
            const y = 0.15 + i * itemHeight;
            positions[`item${i}C`] = { x: 0.46, y: y + itemHeight / 2 - 0.035, w: 0.08, h: 0.07 };
            positions[`item${i}T`] = { x: (i % 2 === 0) ? 0.05 : 0.54, y, w: 0.4, h: itemHeight };
        }
        return positions;
    }
    getPyramidPositions({ itemCount }) { // This layout was not used in the analyzer, but keeping the logic.
        const positions = { title: { x: 0.05, y: 0.02, w: 0.9, h: 0.13 } };
        const itemHeight = Math.max(0.1, 0.75 / itemCount);
        for (let i = 0; i < itemCount; i++) {
            const y = 0.18 + i * itemHeight;
            positions[`item${i}C`] = { x: 0.46, y: y + itemHeight / 2 - 0.045, w: 0.08, h: 0.09 };
            positions[`item${i}T`] = { x: 0.05, y, w: 0.8, h: itemHeight };
        }
        return positions;
    }
}