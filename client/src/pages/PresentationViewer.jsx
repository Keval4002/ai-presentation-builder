import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PresentationViewer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPresentationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/ppt/project/${projectId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPresentationData();
    } else {
      // If no projectId, redirect to home
      navigate('/');
    }
  }, [projectId, navigate]);

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const SlideCard = ({ slide }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{slide.title}</h3>
      <p className="text-gray-700 leading-relaxed">{slide.content}</p>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading presentation...</p>
        </div>
      </div>
    );
  }

  // Network error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Home
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">Error loading presentation: {error}</p>
          <button
            onClick={fetchPresentationData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Home
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">No presentation data available.</p>
        </div>
      </div>
    );
  }

    if (data.status === 'image creation') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 mb-4 flex items-center">← Back to Home</button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Images are currently being generated...</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(data.updated_at).toLocaleString()}</p>
          <button onClick={fetchPresentationData} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mt-4 transition-colors">Check Status</button>
        </div>
      </div>
    );
  }

  // Pending state
  if (data.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Home
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Slides are being generated...</p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(data.updated_at).toLocaleString()}
          </p>
          <button
            onClick={fetchPresentationData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mt-4 transition-colors"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  // Failed state
  if (data.status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Home
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">Generation failed, please retry.</p>
          <p className="text-sm text-gray-600 mb-4">
            Last updated: {new Date(data.updated_at).toLocaleString()}
          </p>
          <button
            onClick={fetchPresentationData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry Generation
          </button>
        </div>
      </div>
    );
  }

  // Completed state
  if (data.status === 'completed' && data.slides) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Presentation Slides</h1>
          <p className="text-sm text-gray-600 mt-1">
            Project ID: {projectId} • Generated on: {new Date(data.updated_at).toLocaleString()}
          </p>
        </div>
        
        <div className="grid gap-6">
          {data.slides.map((slide) => (
            <SlideCard key={slide.slideNumber} slide={slide} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={fetchPresentationData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Unknown status fallback
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Home
        </button>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Unknown presentation status: {data.status}</p>
        <button
          onClick={fetchPresentationData}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg mt-4 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default PresentationViewer;