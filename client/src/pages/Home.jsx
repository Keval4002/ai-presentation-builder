import React, { useEffect, useState } from 'react'
import Sidebar from '../layouts/Sidebar'
import Navbar from '../layouts/Navbar'
import ProjectCard from '../components/PptProjectCard';
import { useSidebar } from '../contexts/SidebarProvider';



function Home() {

  const [sampleProjects, setSampleProjects] = useState(null); 

  useEffect(()=>{
  fetch('http://localhost:5000/api/projects/active')
    .then(res=>{
      return res.json();
    })
    .then(data=>{
      setSampleProjects(data);
    })
}, [])

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar/>
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Navbar/>
        <main className='flex-1 bg-white p-6 lg:p-8 overflow-y-auto'>
          <h1 className='text-3xl font-bold text-gray-900'>
            My Projects
          </h1>

          <p className='mt-2 text-gray-600'>
            Recent Presentations
          </p>

          <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sampleProjects && sampleProjects.map(project=>(
              <ProjectCard
                key = {project.id}
                title = {project.title}
                lastModified = {project.updated_label}
                imageUrl = {project.cover_image_url}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home