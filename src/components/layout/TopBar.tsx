'use client';

import React from 'react';
import {
  Home,
  Github,
  Linkedin,
  Mail,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { usePortfolioStore, ViewMode } from '@/store/usePortfolioStore';
import { UserMenu, EditModeBanner } from '@/components/admin/UserMenu';

const viewTabs: { id: ViewMode; label: string; shortcut: string }[] = [
  { id: 'assembly', label: 'Assembly', shortcut: '1' },
  { id: 'timeline', label: 'Timeline', shortcut: '2' },
  { id: 'results', label: 'Results', shortcut: '3' },
  { id: 'media', label: 'Media', shortcut: '4' },
];

// Profile links - edit these for your portfolio
const PROFILE_LINKS = {
  github: 'https://github.com/liamcarlin',
  linkedin: 'https://linkedin.com/in/liamcarlin',
  email: 'lcarlin@olin.edu',
};

interface TopBarProps {
  className?: string;
}

export default function TopBar({ className }: TopBarProps) {
  const { 
    viewMode, 
    setViewMode, 
    selectedProjectId, 
    projects, 
    theme, 
    toggleTheme,
    setShowHome,
    selectProject,
  } = usePortfolioStore();
  
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  
  const handleGoHome = () => {
    selectProject(null);
    setShowHome(true);
  };
  
  return (
    <div className={`${className} ${
      theme === 'light'
        ? 'bg-white border-gray-200'
        : 'bg-gray-900 border-gray-700'
    } border-b flex flex-col`}>
      {/* Title bar */}
      <div className={`h-10 flex items-center justify-between px-4 ${
        theme === 'light' ? 'bg-gray-100' : 'bg-gray-950'
      }`}>
        <div className="flex items-center gap-3">
          {/* Home button */}
          <button
            onClick={handleGoHome}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              theme === 'light'
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Back to Home"
          >
            <ArrowLeft size={16} />
            <Home size={16} />
            <span className="text-sm font-medium">Home</span>
          </button>
          
          {/* Divider */}
          <div className={`h-5 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
          
          {/* Project title */}
          <div className={`text-sm font-medium ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            {selectedProject ? selectedProject.name : 'No Project Selected'}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'light'
                ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className={`h-4 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
          
          {/* Social links */}
          <a 
            href={PROFILE_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${
              theme === 'light'
                ? 'text-gray-500 hover:text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
            title="GitHub"
          >
            <Github size={16} />
          </a>
          <a 
            href={PROFILE_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${
              theme === 'light'
                ? 'text-gray-500 hover:text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
            title="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
          <a 
            href={`mailto:${PROFILE_LINKS.email}`}
            className={`transition-colors ${
              theme === 'light'
                ? 'text-gray-500 hover:text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Email"
          >
            <Mail size={16} />
          </a>
          
          <div className={`h-4 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
          
          {/* User menu (admin) */}
          <UserMenu />
        </div>
      </div>
      
      {/* Edit Mode Banner */}
      <EditModeBanner />
      
      {/* Tab bar */}
      <div className={`h-10 flex items-end px-2 gap-1 ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-850'
      }`}>
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`
              px-4 py-2 text-sm rounded-t-lg transition-all flex items-center gap-2
              ${viewMode === tab.id
                ? theme === 'light'
                  ? 'bg-white text-gray-900 border-t-2 border-blue-500'
                  : 'bg-gray-800 text-white border-t-2 border-blue-500'
                : theme === 'light'
                  ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }
            `}
          >
            {tab.label}
            <span className={`text-xs hidden sm:inline ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-500'
            }`}>{tab.shortcut}</span>
          </button>
        ))}
        
        {/* Configuration selector */}
        {selectedProject && (
          <div className="ml-auto flex items-center gap-2 px-2 pb-2">
            <span className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Config:</span>
            <select
              className={`text-sm rounded px-2 py-1 border ${
                theme === 'light'
                  ? 'bg-white text-gray-700 border-gray-300'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}
              value={selectedProject.currentConfiguration}
            >
              {selectedProject.configurations.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
