import React, { createContext, useState, useContext } from 'react';

// 1. Create the Context
const SidebarContext = createContext();

// 2. Create the Provider Component
export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const value = {
    isCollapsed,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

// 3. Create a custom hook for easy access to the context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};