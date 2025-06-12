import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const EXPANDED_WIDTH = 280;
  const COLLAPSED_WIDTH = 72;
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const collapseSidebar = () => {
    setIsCollapsed(true);
  };
  
  const expandSidebar = () => {
    setIsCollapsed(false);
  };
  
  const sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  
  const value = {
    isCollapsed,
    sidebarWidth,
    EXPANDED_WIDTH,
    COLLAPSED_WIDTH,
    toggleSidebar,
    collapseSidebar,
    expandSidebar
  };
  
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext; 