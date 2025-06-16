import React, { useEffect, useState } from 'react';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';
import ProjectCard from '../components/PptProjectCard';

function Home() {
  const [sampleProjects, setSampleProjects] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/projects/active')
      .then(res => res.json())
      .then(data => setSampleProjects(data))
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  const moveToTrash = (id) => {
    fetch(`http://localhost:5000/api/projects/${id}/trash`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(() => {
      // Remove from UI list after move to trash
      setSampleProjects(prev => prev.filter(p => p.id !== id));
    })
    .catch(err => console.error('Error moving to trash:', err));
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar />
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Navbar />
        <main className='flex-1 bg-white p-6 lg:p-8 overflow-y-auto'>
          <h1 className='text-3xl font-bold text-gray-900'>My Projects</h1>
          <p className='mt-2 text-gray-600'>Recent Presentations</p>
          <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sampleProjects && sampleProjects.map(project => (
              <ProjectCard
                key={project.id}
                title={project.title}
                lastModified={project.updated_label}
                imageUrl={project.cover_image_url}
                status={project.status}
                onDelete={() => moveToTrash(project.id)}
                // onRestore / onPermanentDelete not needed on Home (active list)
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
