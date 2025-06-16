import React from 'react'
import Sidebar from '../layouts/Sidebar'
import NewProjectCard from '../components/NewProjectCard'
import { Wand2, PenSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function NewProject() {
  const navigate = useNavigate();

  const handleAiClick = () => {
    navigate('/themes', { 
      state: { 
        mode: 'ai', 
        initialSlideCount: 5 
      } 
    });
  }

  const handleManualClick = () => {
    navigate('/themes', { 
      state: { 
        mode: 'outline', 
        initialSlideCount: 8 
      } 
    });
  }

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar />

      <main className='flex-1 bg-white p-6 lg:p-8 overflow-y-auto'>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className='text-4xl font-bold text-gray-900'>
            Create a New Project
          </h1>

          <p className='mt-3 text-lg text-gray-600'>
            Choose how you want to start your next presentation.
          </p>
        </div>

        <div className='mt-12 flex flex-col md:flex-row justify-center items-center gap-8'>
          <NewProjectCard
            Icon={Wand2}
            title="Generate with AI"
            description="Let AI create a professional draft for you in minutes"
            buttonText="Start with AI"
            onClick={handleAiClick}
            isRecommended={true}
          />
          <NewProjectCard
            Icon={PenSquare}
            title="Start From Scratch"
            description="Build your presentation slide by slide with our powerful and easy to use editor"
            buttonText="Create Manually"
            onClick={handleManualClick}
            isRecommended={false}
          />
        </div>

      </main>
    </div>
  )
}

export default NewProject
