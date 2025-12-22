'use client';

import React from 'react';
import {
  File,
  Edit,
  Eye,
  Wrench,
  HelpCircle,
  ChevronDown,
  User,
  Github,
  Linkedin,
  Mail,
  Sun,
  Moon,
} from 'lucide-react';
import { usePortfolioStore, ViewMode } from '@/store/usePortfolioStore';
import { UserMenu, EditModeBanner } from '@/components/admin/UserMenu';

const menuItems = [
  {
    label: 'File',
    icon: File,
    items: [
      { label: 'Open Project...', shortcut: 'Ctrl+O' },
      { label: 'Export View', shortcut: 'Ctrl+E' },
      { label: 'Print Drawing', shortcut: 'Ctrl+P' },
      { type: 'separator' },
      { label: 'Contact Me', action: 'contact' },
    ],
  },
  {
    label: 'Edit',
    icon: Edit,
    items: [
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { label: 'Clear Selection', shortcut: 'Esc' },
      { type: 'separator' },
      { label: 'Copy Link', shortcut: 'Ctrl+Shift+C' },
    ],
  },
  {
    label: 'View',
    icon: Eye,
    items: [
      { label: 'Reset Camera', shortcut: 'Home' },
      { label: 'Focus Selection', shortcut: 'F' },
      { label: 'Toggle Labels', shortcut: 'L' },
      { type: 'separator' },
      { label: 'Show Grid', checked: true },
      { label: 'Show Axes', checked: true },
    ],
  },
  {
    label: 'Tools',
    icon: Wrench,
    items: [
      { label: 'Select', shortcut: 'S' },
      { label: 'Measure', shortcut: 'M' },
      { label: 'Explode View', shortcut: 'E' },
      { type: 'separator' },
      { label: 'Start Tutorial', shortcut: 'T' },
    ],
  },
  {
    label: 'Help',
    icon: HelpCircle,
    items: [
      { label: 'Keyboard Shortcuts', shortcut: '?' },
      { label: 'About PortfolioCAD' },
      { type: 'separator' },
      { label: 'View Source (GitHub)', action: 'github' },
    ],
  },
];

const viewTabs: { id: ViewMode; label: string; shortcut: string }[] = [
  { id: 'assembly', label: 'Assembly', shortcut: '1' },
  { id: 'drawing', label: 'Drawing', shortcut: '2' },
  { id: 'timeline', label: 'Timeline', shortcut: '3' },
  { id: 'results', label: 'Results', shortcut: '4' },
  { id: 'media', label: 'Media', shortcut: '5' },
];

interface TopBarProps {
  className?: string;
}

export default function TopBar({ className }: TopBarProps) {
  const { viewMode, setViewMode, selectedProjectId, projects, theme, toggleTheme } = usePortfolioStore();
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  
  return (
    <div className={`${className} bg-gray-900 dark:bg-gray-900 light:bg-white border-b border-gray-700 dark:border-gray-700 light:border-gray-200 flex flex-col`}>
      {/* Title bar */}
      <div className="h-8 flex items-center justify-between px-4 bg-gray-950 dark:bg-gray-950 light:bg-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 font-medium">
          PortfolioCAD — {selectedProject ? selectedProject.name : 'No Project Selected'}
        </div>
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-lg text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-200 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="h-4 w-px bg-gray-700 dark:bg-gray-700 light:bg-gray-300" />
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Github size={16} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Linkedin size={16} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <Mail size={16} />
          </a>
        </div>
      </div>
      
      {/* Menu bar */}
      <div className="h-8 flex items-center px-2 gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mr-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">P</span>
          </div>
        </div>
        
        {/* Menus */}
        {menuItems.map((menu) => (
          <div
            key={menu.label}
            className="relative group"
            onMouseEnter={() => setActiveMenu(menu.label)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className={`
                px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors
                ${activeMenu === menu.label ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
              `}
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
            >
              {menu.label}
              <ChevronDown size={12} />
            </button>
            
            {/* Dropdown */}
            {activeMenu === menu.label && (
              <div 
                className="absolute top-full left-0 pt-1 z-50"
                onMouseEnter={() => setActiveMenu(menu.label)}
              >
                <div className="w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1">
                  {menu.items.map((item, index) => {
                    if (item.type === 'separator') {
                      return <div key={index} className="h-px bg-gray-700 my-1" />;
                    }
                    return (
                      <button
                        key={item.label}
                        className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          {'checked' in item && item.checked && (
                            <span className="text-blue-400">✓</span>
                          )}
                          {item.label}
                        </span>
                        {'shortcut' in item && (
                          <span className="text-gray-500 text-xs">{item.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Quick actions */}
        <UserMenu />
      </div>
      
      {/* Edit Mode Banner */}
      <EditModeBanner />
      
      {/* Tab bar */}
      <div className="h-10 flex items-end px-2 gap-1 bg-gray-850">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`
              px-4 py-2 text-sm rounded-t-lg transition-all flex items-center gap-2
              ${viewMode === tab.id
                ? 'bg-gray-800 text-white border-t-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }
            `}
          >
            {tab.label}
            <span className="text-xs text-gray-500 hidden sm:inline">{tab.shortcut}</span>
          </button>
        ))}
        
        {/* Configuration selector */}
        {selectedProject && (
          <div className="ml-auto flex items-center gap-2 px-2 pb-2">
            <span className="text-xs text-gray-500">Config:</span>
            <select
              className="bg-gray-800 text-sm text-gray-300 rounded px-2 py-1 border border-gray-700"
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
