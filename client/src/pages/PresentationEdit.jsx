import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditableCanvasSlide from '../components/EditableCanvasSlide';
import { convertPixelsToLayout } from '../components/Edit/Content-Parser';
import { ELEMENT_TYPES } from '../components/Edit/CanvaTypesConst';

function PresentationEdit() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/themes/project/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch presentation");
        const result = await res.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPresentation();
  }, [projectId]);

  const handleUpdateSlide = (index, updatedSlide) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = updatedSlide;
    setData({ ...data, slides: updatedSlides });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const slidesToSave = data.slides.map(slide => {
      if (!slide.canvasElements) return slide;
      
      const newLayout = { ...slide.layout };
      const interactiveElements = slide.canvasElements.filter(
        el => el.type !== ELEMENT_TYPES.LAYOUT_BOX
      );
      
      interactiveElements.forEach(element => {
        if (element.elementType) {
          newLayout[element.elementType] = convertPixelsToLayout(element);
        }
      });
      
      const { canvasElements, ...restOfSlide } = slide;
      return { ...restOfSlide, layout: newLayout };
    });

    const payload = { ...data, slides: slidesToSave };

    try {
      const response = await fetch(`http://localhost:5000/api/themes/project/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save presentation.');
      alert('Presentation saved successfully!');
      navigate(`/view/${projectId}`);
    } catch (err) {
      setError(err.message);
      alert(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const theme = {
    background_color: data?.theme?.background_color || '#FFFFFF',
    primary_color: data?.theme?.primary_color || '#1f2937',
    text_color: data?.theme?.text_color || '#374151',
    heading_font: data?.theme?.heading_font || 'Inter',
    body_font: data?.theme?.body_font || 'Inter',
  };

  if (loading) return <div className='p-10 text-center'>Loading Editor...</div>;
  if (error) return <div className='p-10 text-center text-red-500'>Error: {error}</div>;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate(`/view/${projectId}`)}
              className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 hover:bg-white/80"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to View
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
            >
              {isSaving ? 'Saving...' : 'Save & Finish'}
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-black text-slate-800 mb-2">Editing Presentation</h1>
            <p className="text-slate-500">Click and drag elements to adjust the layout</p>
          </div>
        </header>

        <main className="space-y-16">
          {data?.slides?.map((slide, index) => (
            <div key={slide.slideNumber || index} className="relative">
              <div className="absolute -left-6 top-6 z-30">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-2xl border-2 border-white/20"
                    style={{ background: `linear-gradient(135deg, ${theme.primary_color} 0%, ${theme.primary_color}cc 100%)` }}
                  >
                    {index + 1}
                  </div>
                  <div className="absolute inset-0 w-12 h-12 rounded-2xl opacity-20 blur-md" style={{ backgroundColor: theme.primary_color }} />
                </div>
              </div>
              <EditableCanvasSlide
                slide={slide}
                theme={theme}
                onUpdate={(updatedSlide) => handleUpdateSlide(index, updatedSlide)}
              />
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default PresentationEdit;