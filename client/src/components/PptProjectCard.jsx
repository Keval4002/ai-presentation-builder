// Links to ppts remain

import React from 'react'
import { MoreVertical } from 'lucide-react';

function ProjectCard({imageUrl, title, lastModified}) {
  return (
    <div className='group w-full rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-sm transition-shadow duration-300 ease-in-out'>

        {/* {Card Cover} */}
        <div className='relative w-full aspect-video h-48 bg-gray-100'>
            <img src={imageUrl} alt={`Cover for ${title}`} className='w-full h-full object-cover'/>

            {/* {Button Overlay} */}
            <div className='absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                <button className='px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transform hover:scale-105 transition-transform'>Open</button>
            </div>
        </div>

        {/* {Card Detail Section} */}

        <div className='p-4 flex justify-between items-start'>
            <div>
                <h3 className='font-bold text-gray-800 truncate'>{title}</h3>
                <p className='text-sm text-gray-500 mt-1'>Modified: {lastModified}</p>
            </div>
            <button className='text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100'>
                <MoreVertical size={20}/> 
            </button>
        </div>
    </div>
  )
}

export default ProjectCard