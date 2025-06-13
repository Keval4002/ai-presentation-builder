import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  ChevronFirst, ChevronLast, User2, Home, Trash2, 
  Clock, ChevronDown, ChevronRight 
} from 'lucide-react';

import logo from '../assets/images/logo.svg';
import { useSidebar } from '../contexts/SidebarProvider';

// --- Static Data ---
const recentlyViewedItems = [
  { id: 1, name: "Project Alpha", date: "2 hours ago" },
  { id: 2, name: "Design System", date: "Yesterday" },
  { id: 3, name: "User Research", date: "3 days ago" },
  { id: 4, name: "Marketing Plan", date: "1 week ago" },
  { id: 5, name: "Q4 Report", date: "2 weeks ago" }
];

const navigationItems = [
  { icon: Home, label: "Home", path: '/' },
  { icon: Trash2, label: "Trash", path: '/trash' }
];

// --- Component ---
function Sidebar() {
  // --- Hooks & State ---
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [activeLabel, setActiveLabel] = useState("Home");
  const [isRecentlyViewedOpen, setIsRecentlyViewedOpen] = useState(false);
  const navigate = useNavigate();

  // --- Handlers ---
  const handleNavigationClick = (item) => {
    setActiveLabel(item.label);
    navigate(item.path);
  };

  const toggleRecentlyViewed = () => {
    if (!isCollapsed) {
      setIsRecentlyViewedOpen(prev => !prev);
    }
  };

  // --- Render ---
  return (
    <aside 
      className={`
        h-screen bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      <nav className="h-full flex flex-col">
        {/* Header Section */}
        <div 
          className={`
            p-4 border-gray-100 flex items-center justify-between
            ${isCollapsed ? 'px-2' : 'px-4'}
          `}
        >
          <div 
            className={`
              flex items-center gap-3 overflow-hidden transition-all duration-300
              ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <div className="rounded-lg flex items-center justify-center w-24">
              <img src={logo} alt="logo" />
            </div>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed 
              ? <ChevronLast className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              : <ChevronFirst className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            }
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6">
          <nav className="px-3 space-y-1">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigationClick(item)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 text-left
                  ${activeLabel === item.label && !isCollapsed 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon 
                  className={`
                    w-5 h-5 flex-shrink-0
                    ${activeLabel === item.label && !isCollapsed ? 'text-blue-600' : 'text-gray-500'}
                  `} 
                />
                <span 
                  className={`
                    font-medium transition-all duration-300
                    ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                  `}
                >
                  {item.label}
                </span>
              </button>
            ))}

            {/* Recently Viewed Section */}
            <div className="pt-6">
              <button
                onClick={toggleRecentlyViewed}
                disabled={isCollapsed}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 text-left text-gray-700 
                  hover:bg-gray-50 hover:text-gray-900
                  ${isCollapsed ? 'justify-center cursor-not-allowed opacity-50' : ''}
                `}
              >
                <Clock className="w-5 h-5 flex-shrink-0 text-gray-500" />
                <span 
                  className={`
                    font-medium transition-all duration-300
                    ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                  `}
                >
                  Recently Viewed
                </span>
                {!isCollapsed && (
                  <div className="ml-auto">
                    {isRecentlyViewedOpen 
                      ? <ChevronDown className="w-4 h-4 text-gray-400" /> 
                      : <ChevronRight className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                )}
              </button>

              <div 
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isRecentlyViewedOpen && !isCollapsed ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="mt-2 space-y-1">
                  {recentlyViewedItems.map((item) => (
                    <button
                      key={item.id}
                      className="w-full px-6 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                    >
                      <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.date}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-100 p-3">
          <div 
            className={`
              flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50
              transition-all duration-200 cursor-pointer
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User2 className="w-4 h-4 text-gray-600" />
            </div>
            <div 
              className={`
                transition-all duration-300 overflow-hidden
                ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
              `}
            >
              <div className="text-sm font-medium text-gray-900">John Doe</div>
              <div className="text-xs text-gray-500 truncate">john@example.com</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;