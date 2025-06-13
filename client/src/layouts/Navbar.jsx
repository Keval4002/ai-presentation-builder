import React, {useState} from 'react';
import {Search, Upload, Plus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar() {

    const [querySearch, setQuerySearch] = useState('');

    const navigate = useNavigate();

    const handleSearch = (e)=>{
        console.log('Searched');
    }

    const handleImport = ()=>{
        console.log('Imported');
        
    }

    const handleNewProject = ()=>{

        navigate('/new')
        console.log('Project started');
        
    }

  return (
    <header className='w-full bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
            {/* {Searchbar} */}
            <div className='flex-1 max-w-md'>
                <div className='relative'>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="text"
                    placeholder='Search projects ...'
                    onChange={(e)=> setQuerySearch(e.target.value)}
                    onKeyDown={(e)=>e.key=='Enter' && handleSearch(e)}
                    className='w-full pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                </div>
            </div>


            {/* {Action Buttons - Import, New Project} */}

            <div className='flex items-center gap-3 ml-6'>
                <button onClick={handleImport} className='flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200'>
                    <Upload className='w-4 h-4'/>
                    <span>Import</span>
                </button>
                <button onClick={handleNewProject} className='flex items-center px-4 py-2 gap-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200'>
                    <Plus className='w-4 h-4'/>
                    <span>New Project</span>
                </button>
            </div>

        </div>
    </header>
  )
}

export default Navbar