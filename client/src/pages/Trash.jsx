import React, { useState, useEffect } from 'react';
import Sidebar from '../layouts/Sidebar';
import ProjectCard from '../components/PptProjectCard';

function Trash() {
  const [sampleProjects, setSampleProjects] = useState(null);

  // Fetch deleted projects
  const fetchDeletedProjects = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects/deleted');
      if (!res.ok) throw new Error('Failed to load deleted projects');
      const data = await res.json();
      setSampleProjects(data);
    } catch (err) {
      console.error(err);
      alert('Could not load deleted projects');
    }
  };

  useEffect(() => {
    fetchDeletedProjects();
  }, []);

  // Restore project
  const handleRestore = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Restore failed');
      fetchDeletedProjects();  // Refresh list
    } catch (err) {
      console.error(err);
      alert('Could not restore project');
    }
  };

  // Permanently delete project
  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Permanent delete failed');
      fetchDeletedProjects();  // Refresh list
    } catch (err) {
      console.error(err);
      alert('Could not permanently delete project');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 bg-white p-6 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900">Bin</h1>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleProjects && sampleProjects.map(project => (
            <ProjectCard
              key={project.id}
              title={project.title}
              lastModified={project.updated_label}
              imageUrl={project.cover_image_url}
              status={project.status}
              onDelete={null}  // In trash, no "move to trash" option
              onRestore={() => handleRestore(project.id)}
              onPermanentDelete={() => handlePermanentDelete(project.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Trash;
