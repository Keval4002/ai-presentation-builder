import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PresentationViewer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This useEffect hook is the core of the automatic refresh logic.
  useEffect(() => {
    // We declare a variable for the interval ID within the effect's scope.
    let intervalId;

    // This function fetches the data and updates the state, triggering a re-render.
    const pollData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/themes/project/${projectId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // This is the most important line: it updates the component's state with the new data.
        // React sees this change and automatically re-renders the page.
        setData(result);
        setLoading(false); // We have data, so we are no longer in the initial loading state.

        // If the process is finished (completed or failed), we stop the polling.
        if (result.status === 'completed' || result.status === 'failed') {
          console.log(`Polling stopped. Final status: ${result.status}`);
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // Stop polling if an error occurs.
        clearInterval(intervalId);
      }
    };

    // Start the process immediately when the component loads.
    pollData();
    
    // Then, set up the interval to call pollData every 5 seconds.
    intervalId = setInterval(pollData, 5000);

    // This is a crucial cleanup function. React runs this when the user navigates away
    // from the page, preventing memory leaks by stopping the interval.
    return () => {
      clearInterval(intervalId);
    };
  }, [projectId]); // The effect re-runs only if the projectId changes.

  // --- The rest of the file is for rendering the UI based on the `data` state ---

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const SlideCard = ({ slide }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{slide.title}</h3>
      {slide.imageUrl ? (
        <img src={slide.imageUrl} alt={slide.imageSuggestion?.description || 'Slide image'} className="w-full h-56 object-cover rounded-md mb-4 border" />
      ) : (
        <div className="w-full h-56 bg-gray-200 rounded-md mb-4 flex items-center justify-center animate-pulse">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm mt-2">Generating image...</p>
          </div>
        </div>
      )}
      <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: (slide.content || "").replace(/\n/g, '<br/>') }} />
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-12">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Fetching presentation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 mb-4">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="max-w-4xl mx-auto p-6 text-center py-12"><p className="text-gray-600">No data found for this presentation.</p></div>
  }

  if (data.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-12">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Generating content... Page will refresh automatically.</p>
      </div>
    );
  }

  if (data.status === 'failed') {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
             <p className="text-red-800 mb-4 font-semibold">Presentation Generation Failed</p>
             <button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Back to Home</button>
          </div>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 mb-4 flex items-center">← Back to Home</button>
        <h1 className="text-2xl font-bold text-gray-900">{data.slides?.[0]?.header || 'Presentation Slides'}</h1>
        {data.status === 'image creation' && (
          <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 flex items-center">
            <LoadingSpinner />
            <span className="ml-3">Content is ready. Images are being generated and will appear automatically...</span>
          </div>
        )}
        {data.status === 'completed' && (
           <div className="mt-2 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3">
             Presentation complete!
           </div>
        )}
      </div>
      
      <div className="grid gap-6">
        {data.slides && data.slides.map((slide) => (
          <SlideCard key={slide.slideNumber} slide={slide} />
        ))}
      </div>
    </div>
  );
};

export default PresentationViewer;