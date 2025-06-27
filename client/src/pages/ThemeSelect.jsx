import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeCard from '../components/ThemeCard';

// A fallback in case the API fails, as was in the original code.
const fallbackThemes = [
    { slug: 'default-light', name: 'Default Light', primary_color: '#3B82F6', secondary_color: '#10B981', background_color: '#F9FAFB', text_color: '#1F2937', heading_font: 'Inter' },
    { slug: 'default-dark', name: 'Default Dark', primary_color: '#60A5FA', secondary_color: '#34D399', background_color: '#1F2937', text_color: '#F9FAFB', heading_font: 'Inter' },
];

const ThemeSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const sendPptDetails = async (slug, requestData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/themes/${slug}/details`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send ppt details');
      }

      const data = await res.json();
      return data;

    } catch (error) {
      console.error('Error sending PPT details:', error.message);
      alert(`Error sending PPT details: ${error.message}`);
    }
  }

  const { mode = 'ai', initialSlideCount = 5 } = location.state || {};

  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [outlineItems, setOutlineItems] = useState([]);
  const [slideCount, setSlideCount] = useState(initialSlideCount);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (mode === 'outline') {
      const items = Array.from({ length: slideCount }, (_, index) => ({
        id: index + 1,
        text: index === 0 ? 'Introduction' : index === slideCount - 1 ? 'Conclusion' : `Slide ${index + 1}`
      }));
      setOutlineItems(items);
    }
  }, [slideCount, mode]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/themes');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        if (data.length > 0) {
          setThemes(data);
          setSelectedTheme(data[0]);
        } else {
          setFetchError('No themes found. Showing fallback options.');
          setThemes(fallbackThemes);
          setSelectedTheme(fallbackThemes[0]);
        }
      } catch (err) {
        console.error('Error fetching themes:', err);
        setFetchError('Could not load themes. Showing fallback options.');
        setThemes(fallbackThemes);
        setSelectedTheme(fallbackThemes[0]);
      }
    };

    fetchThemes();
  }, []);

  const handleSlideCountChange = (newCount) => {
    setSlideCount(newCount);
    if (mode === 'outline') {
      const current = [...outlineItems];
      if (newCount > current.length) {
        for (let i = current.length; i < newCount; i++) {
          current.push({
            id: i + 1,
            text: i === newCount - 1 ? 'Conclusion' : `Slide ${i + 1}`
          });
        }
      } else {
        current.splice(newCount);
      }
      setOutlineItems(current);
    }
  };

  const updateOutlineItem = (id, text) => {
    setOutlineItems(outlineItems.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleProceed = async () => {
    if (!selectedTheme) {
      alert('Please select a theme');
      return;
    }
    if (mode === 'ai' && !prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    if (mode === 'outline' && outlineItems.some(item => !item.text.trim())) {
      alert('Please provide titles for all slides');
      return;
    }

    setIsLoading(true);

    const requestData = {
      mode,
      slideCount,
      ...(mode === 'ai' ? { prompt } : { outline: outlineItems.map(i => i.text) })
    };

    const result = await sendPptDetails(selectedTheme.slug, requestData);

    if (result?.projectId) {
      navigate(`/presentation/${result.projectId}`);
    } else {
      alert('Something went wrong, please try again.');
    }
    setIsLoading(false);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Presentation</h1>
              <p className="text-sm text-gray-600">{mode === 'ai' ? 'AI Generated' : 'Custom Outline'} • {slideCount} slides</p>
            </div>
          </div>
          <button
            onClick={handleProceed}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Processing...' : 'Proceed'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Theme</h2>
              {fetchError && <p className="text-sm text-red-500 mb-3">{fetchError}</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map(theme => (
                  <ThemeCard
                    key={theme.slug}
                    theme={theme}
                    isSelected={selectedTheme?.slug === theme.slug}
                    onClick={() => setSelectedTheme(theme)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Creation Mode</h3>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {mode === 'ai' ? (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <div>
                      <span className="font-medium text-gray-900">AI Generated</span>
                      <p className="text-sm text-gray-600">Create with AI assistance</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="font-medium text-gray-900">Custom Outline</span>
                      <p className="text-sm text-gray-600">Define your own structure</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Slides</h3>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={slideCount}
                onChange={(e) => handleSlideCountChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>3</span>
                <span className="font-medium text-gray-900">{slideCount} slides</span>
                <span>20</span>
              </div>
            </div>

            {mode === 'ai' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-500 inline mr-2" />
                  AI Prompt
                </h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your presentation topic, key points, and target audience..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-3">💡 Be specific about your topic, audience, and key messages for better results.</p>
              </div>
            )}

            {mode === 'outline' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <FileText className="w-5 h-5 text-blue-500 inline mr-2" />
                  Slide Outline
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {outlineItems.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500 font-medium w-8 flex-shrink-0">{index + 1}.</div>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateOutlineItem(item.id, e.target.value)}
                        placeholder={`Slide ${index + 1} title...`}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">📝 Adjust the slide count above to add or remove slides automatically.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectionPage;