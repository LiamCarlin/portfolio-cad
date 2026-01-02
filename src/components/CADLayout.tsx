'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/TopBar';
import AssemblyTree from '@/components/panels/AssemblyTree';
import Inspector from '@/components/panels/Inspector';
import Timeline from '@/components/panels/Timeline';
import CommandPalette from '@/components/layout/CommandPalette';
import TutorialOverlay from '@/components/overlays/TutorialOverlay';
import WelcomeModal, { useWelcomeModal } from '@/components/overlays/WelcomeModal';
import HomePage from '@/components/HomePage';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useProjectsLoader } from '@/hooks/useProjectsLoader';
import { HelpCircle, Loader2, Home } from 'lucide-react';

// Dynamic import for Viewport to avoid SSR issues with Three.js
const Viewport = dynamic(() => import('@/components/viewport/Viewport'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div className="text-gray-500">Loading 3D Viewport...</div>
    </div>
  ),
});

// Resizable panel handle component
function ResizeHandle({ 
  direction, 
  onResize,
  theme,
}: { 
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  theme: 'light' | 'dark';
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    
    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
      onResize(delta);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, onResize]);

  return (
    <div
      className={`
        ${direction === 'horizontal' ? 'w-1 cursor-col-resize hover:w-1.5' : 'h-1 cursor-row-resize hover:h-1.5'}
        ${theme === 'light' ? 'bg-gray-200 hover:bg-blue-500' : 'bg-gray-800 hover:bg-blue-500'}
        ${isDragging ? 'bg-blue-500' : ''}
        transition-all flex-shrink-0 relative
      `}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator when hovering */}
      <div className={`
        absolute inset-0 
        ${direction === 'horizontal' ? 'w-4 -mx-1.5' : 'h-4 -my-1.5'}
      `} />
    </div>
  );
}

export default function CADLayout() {
  const {
    leftPanelCollapsed,
    rightPanelCollapsed,
    bottomPanelCollapsed,
    leftPanelWidth,
    rightPanelWidth,
    bottomPanelHeight,
    theme,
    showHome,
    setTheme,
    setPanelWidth,
    setPanelHeight,
    setShowHome,
    selectProject,
  } = usePortfolioStore();
  
  const { showWelcome, closeWelcome, openWelcome } = useWelcomeModal();
  const { isLoading } = useProjectsLoader();
  
  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfoliocad-theme') as 'dark' | 'light' | null;
    
    let initialTheme = savedTheme;
    
     // If no saved theme, default to light mode
    if (!initialTheme) {
       initialTheme = 'light';
    }
    
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);
    document.documentElement.classList.remove(initialTheme === 'dark' ? 'light' : 'dark');
  }, [setTheme]);


  // Resize handlers - use refs to avoid stale closure issues
  const leftPanelWidthRef = useRef(leftPanelWidth);
  const rightPanelWidthRef = useRef(rightPanelWidth);
  const bottomPanelHeightRef = useRef(bottomPanelHeight);
  
  useEffect(() => {
    leftPanelWidthRef.current = leftPanelWidth;
  }, [leftPanelWidth]);
  
  useEffect(() => {
    rightPanelWidthRef.current = rightPanelWidth;
  }, [rightPanelWidth]);
  
  useEffect(() => {
    bottomPanelHeightRef.current = bottomPanelHeight;
  }, [bottomPanelHeight]);

  // Resize handlers
  const handleLeftResize = useCallback((delta: number) => {
    setPanelWidth('left', leftPanelWidthRef.current + delta);
  }, [setPanelWidth]);

  const handleRightResize = useCallback((delta: number) => {
    setPanelWidth('right', rightPanelWidthRef.current - delta);
  }, [setPanelWidth]);

  const handleBottomResize = useCallback((delta: number) => {
    setPanelHeight('bottom', bottomPanelHeightRef.current - delta);
  }, [setPanelHeight]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950 dark:bg-gray-950 light:bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">Loading Portfolio...</span>
        </div>
      </div>
    );
  }
  
  // Handler for selecting a project from home page
  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    setShowHome(false);
  };
  
  // Show home page
  if (showHome) {
    return (
      <div className={`h-screen w-screen overflow-auto transition-colors duration-200 ${
        theme === 'light' 
          ? 'bg-gray-100 text-gray-900' 
          : 'bg-gray-950 text-white'
      }`}>
        <HomePage onSelectProject={handleSelectProject} />
      </div>
    );
  }
  
  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-200 ${
      theme === 'light' 
        ? 'bg-gray-100 text-gray-900' 
        : 'bg-gray-950 text-white'
    }`}>
      {/* Top bar with menus and tabs */}
      <TopBar className="flex-shrink-0" />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Assembly Tree */}
        <AssemblyTree
          className="flex-shrink-0"
          style={{ width: leftPanelCollapsed ? 'auto' : `${leftPanelWidth}px` }}
        />
        
        {/* Left resize handle */}
        {!leftPanelCollapsed && (
          <ResizeHandle direction="horizontal" onResize={handleLeftResize} theme={theme} />
        )}
        
        {/* Center - Viewport */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Viewport + Bottom panel container */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Viewport */}
            <Viewport className="flex-1 relative min-h-0" />
            
            {/* Bottom panel - Timeline (fixed height, no resize) */}
            <Timeline className="relative z-10" />
          </div>
        </div>
        
        {/* Right resize handle */}
        {!rightPanelCollapsed && (
          <ResizeHandle direction="horizontal" onResize={handleRightResize} theme={theme} />
        )}
        
        {/* Right panel - Inspector */}
        <Inspector
          className="flex-shrink-0"
          style={{ width: rightPanelCollapsed ? 'auto' : `${rightPanelWidth}px` }}
        />
      </div>
      
      {/* Status bar */}
      <div className={`h-7 border-t flex items-center justify-between px-4 text-xs ${
        theme === 'light' 
          ? 'bg-white/95 border-gray-200 text-gray-400 backdrop-blur-sm' 
          : 'bg-gray-900/95 border-gray-800 text-gray-500 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-4">
          <span>Liam Carlin's Portfolio</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={openWelcome}
            className={`flex items-center gap-1 transition-colors ${
              theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white'
            }`}
          >
            <HelpCircle size={12} />
            How to use
          </button>
          <span className="text-gray-600">•</span>
          <span>Press <kbd className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
            theme === 'light' ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>Ctrl+P</kbd> for command palette</span>
        </div>
      </div>
      
      {/* Overlays */}
      <CommandPalette />
      <TutorialOverlay />
      {showWelcome && <WelcomeModal onClose={closeWelcome} />}
    </div>
  );
}
