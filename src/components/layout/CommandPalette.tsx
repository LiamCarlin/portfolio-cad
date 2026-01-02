'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Command,
  Search,
  Box,
  FileText,
  Settings,
  Keyboard,
  X,
} from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    projects,
    selectProject,
    setToolMode,
    toggleLabels,
    startTutorial,
    focusOnSelection,
  } = usePortfolioStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];
    
    // Project commands
    projects.forEach((project) => {
      items.push({
        id: `project-${project.id}`,
        label: `Open: ${project.name}`,
        category: 'Projects',
        action: () => {
          selectProject(project.id);
          toggleCommandPalette();
        },
      });
    });
    
    // Tool commands
    items.push({
      id: 'tool-select',
      label: 'Tool: Select',
      category: 'Tools',
      shortcut: 'S',
      action: () => {
        setToolMode('select');
        toggleCommandPalette();
      },
    });
    
    items.push({
      id: 'tool-measure',
      label: 'Tool: Measure',
      category: 'Tools',
      shortcut: 'M',
      action: () => {
        setToolMode('measure');
        toggleCommandPalette();
      },
    });
    
    items.push({
      id: 'tool-explode',
      label: 'Tool: Explode',
      category: 'Tools',
      shortcut: 'E',
      action: () => {
        setToolMode('explode');
        toggleCommandPalette();
      },
    });
    
    // Action commands
    items.push({
      id: 'action-tutorial',
      label: 'Start Tutorial',
      category: 'Actions',
      shortcut: 'T',
      action: () => {
        startTutorial();
        toggleCommandPalette();
      },
    });
    
    items.push({
      id: 'action-focus',
      label: 'Focus on Selection',
      category: 'Actions',
      shortcut: 'F',
      action: () => {
        focusOnSelection();
        toggleCommandPalette();
      },
    });
    
    items.push({
      id: 'action-labels',
      label: 'Toggle Labels',
      category: 'Actions',
      shortcut: 'L',
      action: () => {
        toggleLabels();
        toggleCommandPalette();
      },
    });
    
    return items;
  }, [projects, selectProject, setToolMode, startTutorial, focusOnSelection, toggleLabels, toggleCommandPalette]);
  
  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);
  
  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);
  
  // Focus input when opening
  useEffect(() => {
    if (commandPaletteOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex]);
  
  if (!commandPaletteOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleCommandPalette}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-xl bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Command size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
          />
          <button
            onClick={toggleCommandPalette}
            className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Commands list */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/5">
                {category}
              </div>
              {items.map((cmd, index) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left transition-all
                      ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/5'}
                    `}
                  >
                    {cmd.category === 'Projects' && <Box size={16} className="text-gray-500" />}
                    {cmd.category === 'Views' && <FileText size={16} className="text-gray-500" />}
                    {cmd.category === 'Tools' && <Settings size={16} className="text-gray-500" />}
                    {cmd.category === 'Actions' && <Keyboard size={16} className="text-gray-500" />}
                    
                    <span className="flex-1">{cmd.label}</span>
                    
                    {cmd.shortcut && (
                      <kbd className={`
                        px-2 py-0.5 text-xs rounded
                        ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}
                      `}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          )}
        </div>
        
        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md border border-white/10">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md border border-white/10 ml-1">↓</kbd>
              <span className="ml-1.5">to navigate</span>
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md border border-white/10">Enter</kbd>
              <span className="ml-1.5">to select</span>
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded-md border border-white/10">Esc</kbd>
            <span className="ml-1.5">to close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
