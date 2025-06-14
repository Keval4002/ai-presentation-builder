import React, {useState, useEffect} from 'react'
import Sidebar from '../layouts/Sidebar'
import ProjectCard from '../components/PptProjectCard'



function Trash() {

    const [sampleProjects, setSampleProjects] = useState(null); 
  
    useEffect(()=>{
    fetch('http://localhost:5000/api/projects/deleted')
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
        <main className='flex-1 bg-white p-6 lg:p-8 overflow-y-auto'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Bin
          </h1>

          <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {sampleProjects && sampleProjects.map(project=>(
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