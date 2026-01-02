'use client';

import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  MousePointer2,
  Ruler,
  Maximize,
  Play,
  Tag,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Home,
} from 'lucide-react';
import { usePortfolioStore, ToolMode } from '@/store/usePortfolioStore';

const tools: { id: ToolMode; icon: React.ElementType; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'S' },
  { id: 'measure', icon: Ruler, label: 'Measure', shortcut: 'M' },
  { id: 'explode', icon: Maximize, label: 'Explode', shortcut: 'E' },
  { id: 'tutorial', icon: Play, label: 'Tutorial', shortcut: 'T' },
];

interface ToolbarProps {
  className?: string;
}

export default function Toolbar({ className }: ToolbarProps) {
  const {
    toolMode,
    setToolMode,
    explodeAmount,
    setExplodeAmount,
    showLabels,
    toggleLabels,
    startTutorial,
    tutorialActive,
    setCameraState,
  } = usePortfolioStore();
  
  const handleToolClick = (tool: ToolMode) => {
    if (tool === 'tutorial') {
      startTutorial();
    } else {
      setToolMode(tool);
    }
  };
  
  const resetCamera = () => {
    setCameraState({
      position: [5, 5, 5],
      target: [0, 0, 0],
    });
  };
  
  return (
    <div className={`${className} bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 flex items-center gap-1 px-3 h-11`}>
      {/* Tool buttons */}
      <div className="flex items-center gap-1 pr-3 border-r border-gray-800">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = toolMode === tool.id || (tool.id === 'tutorial' && tutorialActive);
          
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`
                p-2 rounded-full transition-all flex items-center gap-1 group relative
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
                }
              `}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <Icon size={16} />
              {/* Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                <div className="bg-gray-800/95 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/10">
                  {tool.label}
                  <span className="text-gray-400 ml-1">({tool.shortcut})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Explode slider */}
      <div className="flex items-center gap-2 px-3 border-r border-gray-800">
        <SlidersHorizontal size={14} className="text-gray-500" />
        <span className="text-xs text-gray-400 w-14">Explode</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explodeAmount}
          onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
          className="w-24 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-gray-400 w-10 text-right">
          {Math.round(explodeAmount * 100)}%
        </span>
      </div>
      
      {/* Labels toggle */}
      <button
        onClick={toggleLabels}
        className={`
          p-2 rounded-full transition-all flex items-center gap-1
          ${showLabels
            ? 'bg-white/10 text-white border border-white/10'
            : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
          }
        `}
        title="Toggle Labels (L)"
      >
        <Tag size={16} />
      </button>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Camera controls */}
      <div className="flex items-center gap-1 pl-3 border-l border-gray-800">
        <button
          onClick={resetCamera}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          title="Reset Camera (Home)"
        >
          <Home size={16} />
        </button>
        <button
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          title="Reset Rotation"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
