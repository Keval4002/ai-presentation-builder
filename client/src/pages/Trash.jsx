import React from 'react'
import Sidebar from '../layouts/Sidebar'
import ProjectCard from '../components/PptProjectCard'


const sampleProjects = [
  {
    id: 1,
    title: 'Q4 Financial Report & Analysis',
    lastModified: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 2,
    title: 'Project Phoenix - Marketing Kickoff',
    lastModified: '5 days ago',
    imageUrl: 'https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 3,
    title: 'New App UI/UX Design Flow',
    lastModified: '1 week ago',
    imageUrl: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 4,
    title: 'Technology Stack 2024 Overview',
    lastModified: '2 weeks ago',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1668790459273-8d8061d35d36?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 5,
    title: 'Company Onboarding Presentation',
    lastModified: '1 month ago',
    imageUrl: 'https://images.unsplash.com/photo-1487147264018-f937fba0c817?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBwdCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: 6,
    title: 'Minimalist Portfolio Draft',
    lastModified: '1 month ago',
    imageUrl: 'https://images.unsplash.com/photo-1513077202514-c511b41bd4c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBwdCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D'
  }
];

function Trash() {
  return (
    <div className='flex h-screen bg-gray-100'>
        <Sidebar/>
        <main className='flex-1 bg-white p-6 lg:p-8 overflow-y-auto'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Bin
          </h1>

          <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sampleProjects.map(project=>(
              <ProjectCard
                key = {project.id}
                title = {project.title}
                lastModified = {project.lastModified}
                imageUrl = {project.imageUrl}
              />
            ))}
          </div>
        </main>
    </div>
  )
}

export default Trash