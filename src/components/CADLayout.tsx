'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/TopBar';
import Toolbar from '@/components/layout/Toolbar';
import AssemblyTree from '@/components/panels/AssemblyTree';
import Inspector from '@/components/panels/Inspector';
import Timeline from '@/components/panels/Timeline';
import CommandPalette from '@/components/layout/CommandPalette';
import TutorialOverlay from '@/components/overlays/TutorialOverlay';
import WelcomeModal, { useWelcomeModal } from '@/components/overlays/WelcomeModal';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useProjectsLoader } from '@/hooks/useProjectsLoader';
import { HelpCircle, Loader2 } from 'lucide-react';

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
        ${direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}
        ${theme === 'light' ? 'bg-gray-200 hover:bg-blue-400' : 'bg-gray-700 hover:bg-blue-500'}
        ${isDragging ? (theme === 'light' ? 'bg-blue-400' : 'bg-blue-500') : ''}
        transition-colors flex-shrink-0
      `}
      onMouseDown={handleMouseDown}
    />
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
    setTheme,
    setPanelWidth,
    setPanelHeight,
  } = usePortfolioStore();
  
  const { showWelcome, closeWelcome, openWelcome } = useWelcomeModal();
  const { isLoading } = useProjectsLoader();
  
  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfoliocad-theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);
  }, [setTheme]);

  // Resize handlers
  const handleLeftResize = useCallback((delta: number) => {
    setPanelWidth('left', leftPanelWidth + delta);
  }, [leftPanelWidth, setPanelWidth]);

  const handleRightResize = useCallback((delta: number) => {
    setPanelWidth('right', rightPanelWidth - delta);
  }, [rightPanelWidth, setPanelWidth]);

  const handleBottomResize = useCallback((delta: number) => {
    setPanelHeight('bottom', bottomPanelHeight - delta);
  }, [bottomPanelHeight, setPanelHeight]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950 dark:bg-gray-950 light:bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">Loading PortfolioCAD...</span>
        </div>
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
        
        {/* Center - Viewport and toolbar */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <Toolbar className="flex-shrink-0" />
          
          {/* Viewport + Bottom panel container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Viewport */}
            <Viewport className="flex-1 relative min-h-0" />
            
            {/* Bottom resize handle */}
            {!bottomPanelCollapsed && (
              <ResizeHandle direction="vertical" onResize={handleBottomResize} theme={theme} />
            )}
            
            {/* Bottom panel - Timeline */}
            <Timeline
              className="flex-shrink-0"
              style={{ height: bottomPanelCollapsed ? 'auto' : `${bottomPanelHeight}px` }}
            />
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
      <div className={`h-6 border-t flex items-center justify-between px-4 text-xs ${
        theme === 'light' 
          ? 'bg-white border-gray-200 text-gray-400' 
          : 'bg-gray-900 border-gray-700 text-gray-500'
      }`}>
        <div className="flex items-center gap-4">
          <span>PortfolioCAD v1.0</span>
          <span>•</span>
          <span>Liam Carlin</span>
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
          <span>•</span>
          <span>Press <kbd className={`px-1 py-0.5 rounded ${
            theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'
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
