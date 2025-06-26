import React, { useMemo } from 'react';
import DynamicLayoutRenderer from './layouts/DynamicLayoutRenderer';
import { SmartLayoutManager } from '../../utils/SmartLayoutManager';
import { IntelligentLayoutAnalyzer } from '../../utils/IntelligentLayoutAnalyzer';

const smartLayoutManager = new SmartLayoutManager();
const intelligentAnalyzer = new IntelligentLayoutAnalyzer();

function SlideCard({ slide, theme, slideIndex, onScaleReport, onLayoutMeasure }) {
    const finalLayout = useMemo(() => {
        const layoutConfig = intelligentAnalyzer.analyzeContent(slide, slideIndex);
        return smartLayoutManager.generatePositions(layoutConfig);
    }, [slide, slideIndex]);

    return (
        <div
            className="w-full border-0 shadow-2xl relative overflow-hidden bg-white aspect-[16/9]"
            style={{ backgroundColor: theme.background_color }}
            data-layout-name={finalLayout.name}
        >
            <DynamicLayoutRenderer
                slide={slide}
                theme={theme}
                layout={finalLayout}
                slideIndex={slideIndex}
                onLayoutMeasure={onLayoutMeasure}
                onScaleReport={onScaleReport}
            />
        </div>
    );
}

export default SlideCard;