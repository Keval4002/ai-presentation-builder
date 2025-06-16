import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, RotateCcw, Trash } from 'lucide-react';

function ProjectCard({ imageUrl, title, lastModified, status, onDelete, onRestore, onPermanentDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const menuRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        closeMenu();
      }
    }

    // Add slight delay to prevent immediate closing
    if (showMenu) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const openMenu = () => {
    setShowMenu(true);
    setIsMenuAnimating(true);
  };

  const closeMenu = () => {
    setIsMenuAnimating(false);
    // Delay hiding to allow exit animation
    setTimeout(() => setShowMenu(false), 150);
  };

  const toggleMenu = () => {
    if (showMenu) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleMenuAction = (action) => {
    closeMenu();
    // Small delay to allow menu to close before action
    setTimeout(() => action?.(), 100);
  };

  return (
    <div className="group w-full rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 ease-in-out relative overflow-visible">
      
      {/* Card Cover */}
      <div className="relative w-full aspect-video h-48 bg-gray-100">
        <img src={imageUrl} alt={`Cover for ${title}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200">
            Open
          </button>
        </div>
      </div>

      {/* Card Detail Section */}
      <div className="p-4 flex justify-between items-start overflow-visible">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-bold text-gray-800 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">Modified: {lastModified}</p>
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            ref={buttonRef}
            className={`
              p-2 rounded-full transition-all duration-200 ease-in-out
              ${showMenu 
                ? 'bg-gray-100 text-gray-700 shadow-sm' 
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            `}
            onClick={toggleMenu}
            aria-label="More options"
            aria-expanded={showMenu}
          >
            <MoreVertical size={18} className={`transition-transform duration-200 ${showMenu ? 'rotate-90' : ''}`} />
          </button>

          {/* Menu */}
          {showMenu && (
            <div 
              className={`
                absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50
                transform origin-top-right transition-all duration-200 ease-out
                ${isMenuAnimating 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2'
                }
              `}
              style={{
                animation: isMenuAnimating 
                  ? 'menuSlideIn 0.2s ease-out forwards' 
                  : 'menuSlideOut 0.15s ease-in forwards'
              }}
            >
              <div className="py-1">
                {status === 'active' ? (
                  <button
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 flex items-center gap-3 group"
                    onClick={() => handleMenuAction(onDelete)}
                  >
                    <Trash2 size={16} className="text-gray-400 group-hover:text-red-500" />
                    <span className="font-medium">Move to Trash</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-3 group"
                      onClick={() => handleMenuAction(onRestore)}
                    >
                      <RotateCcw size={16} className="text-gray-400 group-hover:text-blue-500" />
                      <span className="font-medium">Restore</span>
                    </button>
                    <div className="h-px bg-gray-100 mx-2"></div>
                    <button
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 flex items-center gap-3 group"
                      onClick={() => handleMenuAction(onPermanentDelete)}
                    >
                      <Trash size={16} className="text-gray-400 group-hover:text-red-500" />
                      <span className="font-medium">Delete Forever</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes menuSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes menuSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}

export default ProjectCard;