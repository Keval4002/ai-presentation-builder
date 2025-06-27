import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';
import ProjectCard from '../components/PptProjectCard';

function Home() {
  const [sampleProjects, setSampleProjects] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/projects/active')
      .then(res => res.json())
      .then(data => setSampleProjects(data))
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 3000);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const moveToTrash = (id) => {
    fetch(`http://localhost:5000/api/projects/${id}/trash`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(() => {
      setSampleProjects(prev => prev.filter(p => p.id !== id));
    })
    .catch(err => console.error('Error moving to trash:', err));
  };

  // --- CHANGED ---
  // This function now correctly navigates and passes state
  const openProject = (project) => {
    // The context confirms `project_id` links to the original generation data.
    // The PresentationViewer at `/presentation/:projectId` expects this ID.
    const targetProjectId = project.project_id || project.id;

    // Navigate to the viewer, passing state to indicate we came from 'home'.
    navigate(`/presentation/${targetProjectId}`, { state: { from: 'home' } });
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar />
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Navbar />
        
        {successMessage && (
          <div className="bg-green-500 text-white px-6 py-3 mx-6 mt-4 rounded-lg shadow-lg flex items-center gap-2">
            <span>✅</span> {successMessage}
          </div>
        )}
        
        <main className='flex-1 bg-white p-6 lg:p-8 overflow-y-auto'>
          <h1 className='text-3xl font-bold text-gray-900'>My Projects</h1>
          <p className='mt-2 text-gray-600'>Recent Presentations</p>
          <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sampleProjects && sampleProjects.map(project => (
              // --- CHANGED ---
              // The `onOpen` prop is now correctly passed to the ProjectCard.
              // The unnecessary wrapper div and its onClick are removed.
              <ProjectCard
                key={project.id}
                title={project.title}
                lastModified={project.updated_label}
                imageUrl={project.cover_image_url}
                status={project.status}
                onDelete={() => moveToTrash(project.id)}
                onOpen={() => openProject(project)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;