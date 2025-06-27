import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// --- CHANGED ---
// `useLocation` is imported to check navigation state
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SlideCard from '../components/Presentation/SlideCard';
import { PptxExportManager } from '../utils/CoordinateUtility';

// --- Helper components (no changes) ---
const LoadingScreen = () => ( <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"><div className="text-center"><div className="relative flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute"></div></div><p className="mt-6 text-slate-700 text-lg font-medium">Loading Presentation...</p></div></div> );
const ErrorScreen = ({ message }) => ( <div className="p-8 text-center min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center"><div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-red-600 text-2xl">⚠</span></div><p className="text-red-800 font-medium text-lg">Error: {message}</p></div></div> );
const ExportFeedback = ({ status }) => { if (status.success) return <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"><span>✅</span> Presentation exported successfully!</div>; if (status.error) return <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"><span>❌</span> Export failed: {status.error}</div>; if (status.exporting) return <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div><span>Exporting...</span></div>; return null; };
const SaveFeedback = ({ status }) => { if (status.success) return <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"><span>💾</span> Presentation saved successfully!</div>; if (status.error) return <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"><span>❌</span> Save failed: {status.error}</div>; if (status.saving) return <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div><span>Saving...</span></div>; return null; };


const PresentationViewer = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    // --- CHANGED ---
    // Get the current location object, which includes state
    const location = useLocation();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [measuredLayouts, setMeasuredLayouts] = useState({});
    const [scaleFactors, setScaleFactors] = useState({});
    const [exportStatus, setExportStatus] = useState({});
    const [saveStatus, setSaveStatus] = useState({});
    const [isAlreadySaved, setIsAlreadySaved] = useState(false);
    const [checkingSaved, setCheckingSaved] = useState(true);
    const [isSlideShow, setIsSlideShow] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const exportManagerRef = useRef(new PptxExportManager());
    const calculationTimeoutRef = useRef(null);
    
    const STATUS = useMemo(() => ({ PENDING: 'pending', PROCESSING: 'processing', IMAGE_CREATION: 'image creation', COMPLETED: 'completed', FAILED: 'failed' }), []);
    const isCompleted = (status) => status === STATUS.COMPLETED;
    const shouldRenderSlides = (status) => [STATUS.PROCESSING, STATUS.IMAGE_CREATION, STATUS.COMPLETED].includes(status);

    useEffect(() => {
        const checkIfSaved = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/projects/check/${projectId}`);
                if (response.ok) {
                    const result = await response.json();
                    setIsAlreadySaved(result.alreadySaved);
                }
            } catch (err) { console.error('Error checking if saved:', err); setIsAlreadySaved(false); } 
            finally { setCheckingSaved(false); }
        };
        if (projectId) { checkIfSaved(); }
    }, [projectId]);

    useEffect(() => {
        const pollData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/themes/project/${projectId}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                setData(result);
                if (result.status === STATUS.COMPLETED || result.status === STATUS.FAILED) { clearInterval(intervalId); }
            } catch (err) { setError(err.message); clearInterval(intervalId); } 
            finally { setLoading(false); }
        };
        pollData();
        const intervalId = setInterval(pollData, 5000);
        return () => clearInterval(intervalId);
    }, [projectId, STATUS.COMPLETED, STATUS.FAILED]);
    
    useEffect(() => {
        if (isCompleted(data?.status)) {
            setMeasuredLayouts({});
            setScaleFactors({});
            calculationTimeoutRef.current = setTimeout(() => {
                console.warn('⚠️ Calculation safety timeout fired. Forcing export readiness.');
                setData(prev => ({ ...prev, _forceReady: true }));
            }, 8000);
        }
        return () => clearTimeout(calculationTimeoutRef.current);
    }, [data?.status]);

    const contentSlidesCount = useMemo(() => data?.slides?.filter(slide => slide.content).length || 0, [data?.slides]);
    const layoutsReady = useMemo(() => isCompleted(data?.status) && (data?._forceReady || (data?.slides && Object.keys(measuredLayouts).length >= data.slides.length)), [data, measuredLayouts]);
    const scalesReady = useMemo(() => layoutsReady && (data?._forceReady || contentSlidesCount === 0 || Object.keys(scaleFactors).length >= contentSlidesCount), [layoutsReady, scaleFactors, contentSlidesCount, data]);

    useEffect(() => { if (layoutsReady && scalesReady && calculationTimeoutRef.current) { clearTimeout(calculationTimeoutRef.current); calculationTimeoutRef.current = null; console.log('✅ All layouts and scales calculated successfully.'); } }, [layoutsReady, scalesReady]);
    const globalMinScale = useMemo(() => { if (!scalesReady) return 1; const allScales = Object.values(scaleFactors).filter(s => typeof s === 'number'); return allScales.length > 0 ? Math.min(...allScales) : 1; }, [scaleFactors, scalesReady]);
    const theme = useMemo(() => ({ background_color: data?.theme?.background_color || '#FFFFFF', primary_color: data?.theme?.primary_color || '#1f2937', text_color: data?.theme?.text_color || '#374151', heading_font: data?.theme?.heading_font || 'Inter', body_font: data?.theme?.body_font || 'Inter' }), [data?.theme]);
    const handleScaleReport = useCallback((index, scale) => { setScaleFactors(prev => ({ ...prev, [index]: scale })); }, []);
    const handleLayoutMeasure = useCallback((slideIndex, layout) => { setMeasuredLayouts(prev => ({ ...prev, [slideIndex]: layout })); }, []);
    
    const handleExport = useCallback(async () => {
        if (!layoutsReady || !scalesReady || exportStatus.exporting || !data) return;
        setExportStatus({ exporting: true });
        try {
            await exportManagerRef.current.exportPresentationWithUniformScale(data, theme, measuredLayouts, globalMinScale);
            setExportStatus({ exporting: false, success: true });
            setTimeout(() => setExportStatus(prev => ({ ...prev, success: false })), 3000);
        } catch (err) { console.error('❌ Export failed:', err); setExportStatus({ exporting: false, error: err.message }); setTimeout(() => setExportStatus(prev => ({ ...prev, error: null })), 5000); }
    }, [data, theme, measuredLayouts, globalMinScale, layoutsReady, scalesReady, exportStatus.exporting]);

    const handleSave = useCallback(async () => {
        if (!data || !data.slides || saveStatus.saving || isAlreadySaved) return;
        setSaveStatus({ saving: true });
        try {
            const response = await fetch('http://localhost:5000/api/projects/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: projectId, slides: data.slides, theme: theme, title: data.slides[0]?.title || 'Untitled Presentation' }),
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to save presentation'); }
            setSaveStatus({ saving: false, success: true });
            setIsAlreadySaved(true);
            setTimeout(() => {
                setSaveStatus(prev => ({ ...prev, success: false }));
                navigate('/', { state: { message: 'Presentation saved successfully!' } });
            }, 2000);
        } catch (err) { console.error('❌ Save failed:', err); setSaveStatus({ saving: false, error: err.message }); setTimeout(() => setSaveStatus(prev => ({ ...prev, error: null })), 5000); }
    }, [data, theme, projectId, saveStatus.saving, isAlreadySaved, navigate]);

    // Slide show logic (no changes)
    const startSlideShow = useCallback(() => { if (!data?.slides?.length) return; setCurrentSlideIndex(0); setIsSlideShow(true); }, [data?.slides]);
    const exitSlideShow = useCallback(() => setIsSlideShow(false), []);
    const nextSlide = useCallback(() => { if (!data?.slides) return; setCurrentSlideIndex(prev => Math.min(prev + 1, data.slides.length - 1)); }, [data?.slides]);
    const prevSlide = useCallback(() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0)), []);
    useEffect(() => { if (!isSlideShow) return; const handleKeyDown = (e) => { if (e.key === 'ArrowRight' || e.key === ' ') nextSlide(); else if (e.key === 'ArrowLeft') prevSlide(); else if (e.key === 'Escape') exitSlideShow(); }; document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isSlideShow, nextSlide, prevSlide, exitSlideShow]);

    const exportButtonState = useMemo(() => {
        if (exportStatus.exporting) return { text: "⏳ Exporting...", disabled: true };
        if (layoutsReady && scalesReady) return { text: "Export PPTX", disabled: false };
        return { text: `Calculating...`, disabled: true };
    }, [exportStatus.exporting, layoutsReady, scalesReady]);

    // --- CHANGED ---
    // This logic now prevents the Save button from showing if navigated from 'home'
    const saveButtonState = useMemo(() => {
        const cameFromHome = location.state?.from === 'home';

        // If we came from the home page, the project is already saved.
        // Do not show the save button at all.
        if (cameFromHome) {
            return { text: "Saved", disabled: true, show: false };
        }

        // Otherwise, use the original logic for new presentations
        if (checkingSaved) return { text: "⏳ Checking...", disabled: true, show: false };
        if (isAlreadySaved) return { text: "✅ Saved", disabled: true, show: true };
        if (saveStatus.saving) return { text: "💾 Saving...", disabled: true, show: true };
        if (isCompleted(data?.status)) return { text: "💾 Save", disabled: false, show: true };
        return { text: "💾 Save", disabled: true, show: false };
    }, [checkingSaved, isAlreadySaved, saveStatus.saving, data?.status, location.state]);

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;
    if (!data) return <ErrorScreen message="No data found for this presentation." />;

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen">
            <ExportFeedback status={exportStatus} />
            <SaveFeedback status={saveStatus} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-16 text-center">
                    <button onClick={() => navigate('/')} className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 hover:bg-white/80 absolute top-12 left-4 sm:left-6 lg:left-8">
                        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span> Back
                    </button>
                    
                    {isCompleted(data.status) && (
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button onClick={() => navigate(`/edit/${projectId}`)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg border border-blue-700 hover:bg-blue-700 transition-colors duration-200">Edit</button>
                            <button onClick={startSlideShow} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg border border-purple-700 hover:bg-purple-700 transition-colors duration-200">Slide Show</button>
                            
                            {/* --- CHANGED --- */}
                            {/* This now correctly respects the `show` property from `saveButtonState` */}
                            {saveButtonState.show && (
                                <button 
                                    onClick={handleSave} 
                                    disabled={saveButtonState.disabled} 
                                    className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                                        !saveButtonState.disabled && !isAlreadySaved
                                            ? 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700' 
                                            : isAlreadySaved
                                            ? 'bg-green-600 text-white border-green-700 cursor-default'
                                            : 'bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {saveButtonState.text}
                                </button>
                            )}
                            
                            <button onClick={handleExport} disabled={exportButtonState.disabled} className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${!exportButtonState.disabled ? 'bg-green-600 text-white border-green-700 hover:bg-green-700' : 'bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed'}`}>{exportButtonState.text}</button>
                        </div>
                    )}
                    
                    <div className="px-8">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent leading-tight" style={{ fontFamily: theme.heading_font }}>
                            {data.slides?.[0]?.title || 'Presentation'}
                        </h1>
                        <div className="w-32 h-1.5 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg" />
                    </div>
                </header>

                <main className="relative">
                    {data.status === STATUS.PENDING && ( <div className="text-center py-32"><div className="relative inline-flex items-center justify-center"><div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div><div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute"></div></div><h2 className="text-2xl font-bold text-slate-700 mt-8">Initializing Presentation...</h2></div> )}
                    {shouldRenderSlides(data.status) && ( <div className="space-y-8">{data.slides?.map((slide, index) => ( <div key={slide.slideNumber || index} className="relative group"><div className="absolute -left-4 top-1/2 -translate-y-1/2 z-30"><div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl border-2 border-white" style={{ backgroundColor: theme.primary_color }}>{index + 1}</div></div><SlideCard slide={slide} theme={theme} slideIndex={index} onScaleReport={isCompleted(data.status) ? handleScaleReport : null} onLayoutMeasure={isCompleted(data.status) ? handleLayoutMeasure : null} /></div> ))}</div> )}
                </main>
            </div>
            
            {isSlideShow && data?.slides && ( <div className="fixed inset-0 bg-black z-50 flex items-center justify-center"><button onClick={exitSlideShow} className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-60" title="Exit (ESC)">✕</button><button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-60" title="Previous (←)">‹</button><button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-60" title="Next (→)">›</button><div className="w-full h-full max-w-7xl max-h-screen p-8 flex items-center justify-center"><SlideCard slide={data.slides[currentSlideIndex]} theme={theme} slideIndex={currentSlideIndex} /></div><div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">{currentSlideIndex + 1} / {data.slides.length}</div></div> )}
        </div>
    );
};

export default PresentationViewer;