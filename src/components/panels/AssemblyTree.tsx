'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Box,
  Cpu,
  Car,
  Code,
  FlaskConical,
  Package,
  Filter,
  FileText,
} from 'lucide-react';
import { usePortfolioStore, Project, Subsystem } from '@/store/usePortfolioStore';

const categoryIcons = {
  robotics: Cpu,
  vehicles: Car,
  software: Code,
  research: FlaskConical,
  other: Package,
};

const categoryColors = {
  robotics: 'text-green-400',
  vehicles: 'text-blue-400',
  software: 'text-purple-400',
  research: 'text-yellow-400',
  other: 'text-gray-400',
};

interface TreeNodeProps {
  subsystem: Subsystem;
  projectId: string;
  depth?: number;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
}

function TreeNode({ subsystem, projectId, depth = 0, expanded, toggleExpanded }: TreeNodeProps) {
  const { selectedSubsystemIds, selectSubsystem, hoveredSubsystemId, setHoveredSubsystem, theme } = usePortfolioStore();
  
  const isSelected = selectedSubsystemIds.includes(subsystem.id);
  const isHovered = hoveredSubsystemId === subsystem.id;
  const isExpanded = expanded.has(subsystem.id);
  const hasChildren = subsystem.children && subsystem.children.length > 0;
  
  const lightMode = theme === 'light';
  
  return (
    <div>
      <div
        className={`
          flex items-center gap-1 py-1 px-2 cursor-pointer rounded transition-colors
          ${isSelected 
            ? 'bg-blue-600 text-white' 
            : isHovered 
              ? lightMode ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white'
              : lightMode ? 'text-gray-700 hover:bg-gray-200/50' : 'text-gray-300 hover:bg-gray-700/50'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={(e) => selectSubsystem(subsystem.id, e.shiftKey)}
        onMouseEnter={() => setHoveredSubsystem(subsystem.id)}
        onMouseLeave={() => setHoveredSubsystem(null)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(subsystem.id);
            }}
            className={`p-0.5 rounded ${lightMode ? 'hover:bg-gray-300' : 'hover:bg-gray-600'}`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        
        <Box size={14} style={{ color: subsystem.color }} />
        <span className="text-sm truncate flex-1">{subsystem.name}</span>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {subsystem.children!.map((child) => (
            <TreeNode
              key={child.id}
              subsystem={child}
              projectId={projectId}
              depth={depth + 1}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectNodeProps {
  project: Project;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
}

function ProjectNode({ project, expanded, toggleExpanded }: ProjectNodeProps) {
  const { selectedProjectId, selectProject, showProjectOverview, setShowProjectOverview, theme } = usePortfolioStore();
  
  const isSelected = selectedProjectId === project.id;
  const isExpanded = expanded.has(project.id);
  
  // Auto-expand when this project is selected
  React.useEffect(() => {
    if (isSelected && !isExpanded) {
      toggleExpanded(project.id);
    }
  }, [isSelected, isExpanded, project.id, toggleExpanded]);
  const CategoryIcon = categoryIcons[project.category];
  const lightMode = theme === 'light';
  const hasContentBlocks = project.contentBlocks && project.contentBlocks.length > 0;
  
  return (
    <div className="mb-1">
      <div
        className={`
          flex items-center gap-2 py-2 px-2 cursor-pointer rounded-lg transition-all
          ${isSelected 
            ? lightMode ? 'bg-gray-200 border border-blue-500' : 'bg-gray-700 border border-blue-500' 
            : lightMode ? 'hover:bg-gray-200 border border-transparent' : 'hover:bg-gray-800 border border-transparent'
          }
        `}
        onClick={() => {
          selectProject(project.id);
          if (!isExpanded) toggleExpanded(project.id);
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(project.id);
          }}
          className={`p-0.5 rounded ${lightMode ? 'hover:bg-gray-300 text-gray-500' : 'hover:bg-gray-600 text-gray-400'}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <CategoryIcon size={16} className={categoryColors[project.category]} />
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.name}</div>
          <div className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>{project.year}</div>
        </div>
      </div>
      
      {/* Expanded content: CAD Model, Overview + Subsystems */}
      {isExpanded && (
        <div className={`ml-2 border-l pl-2 mt-1 ${lightMode ? 'border-gray-300' : 'border-gray-700'}`}>
          {/* 3D Model - First item (default) */}
          <div
            className={`
              flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded transition-colors mb-1
              ${isSelected && !showProjectOverview 
                ? 'bg-blue-600 text-white' 
                : lightMode ? 'text-gray-700 hover:bg-gray-200/50' : 'text-gray-300 hover:bg-gray-700/50'}
            `}
            onClick={() => {
              selectProject(project.id);
              setShowProjectOverview(false);
            }}
          >
            <Box size={14} className={isSelected && !showProjectOverview ? 'text-white' : 'text-green-400'} />
            <span className="text-sm font-medium">3D Model</span>
            {project.cadModel && (
              <span className={`text-xs ml-auto ${isSelected && !showProjectOverview ? 'text-blue-200' : lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {project.cadModel.name}
              </span>
            )}
          </div>

          {/* Project Overview - Second item */}
          <div
            className={`
              flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded transition-colors mb-1
              ${isSelected && showProjectOverview 
                ? 'bg-blue-600 text-white' 
                : lightMode ? 'text-gray-700 hover:bg-gray-200/50' : 'text-gray-300 hover:bg-gray-700/50'}
            `}
            onClick={() => {
              selectProject(project.id);
              setShowProjectOverview(true);
            }}
          >
            <FileText size={14} className={isSelected && showProjectOverview ? 'text-white' : 'text-blue-400'} />
            <span className="text-sm font-medium">Project Overview</span>
            {hasContentBlocks && (
              <span className={`text-xs ml-auto ${isSelected && showProjectOverview ? 'text-blue-200' : lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {project.contentBlocks!.length} blocks
              </span>
            )}
          </div>
          
          {/* Subsystems */}
          {project.subsystems.map((subsystem) => (
            <TreeNode
              key={subsystem.id}
              subsystem={subsystem}
              projectId={project.id}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AssemblyTreeProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function AssemblyTree({ className, style }: AssemblyTreeProps) {
  const { projects, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, leftPanelCollapsed, togglePanel, theme } = usePortfolioStore();
  
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const lightMode = theme === 'light';
  
  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  // Filter projects based on search and category
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === null || project.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, categoryFilter]);
  
  const categories = ['robotics', 'vehicles', 'software', 'research', 'other'] as const;
  
  if (leftPanelCollapsed) {
    return (
      <div className={`${className} w-10 ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-r flex flex-col items-center py-4 gap-2`} style={style}>
        <button
          onClick={() => togglePanel('left')}
          className={`p-2 ${lightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'} rounded transition-colors`}
        >
          <ChevronRight size={16} />
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(categoryFilter === cat ? null : cat);
                togglePanel('left');
              }}
              className={`p-2 rounded transition-colors ${categoryFilter === cat ? (lightMode ? 'bg-gray-200' : 'bg-gray-700') : (lightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800')}`}
            >
              <Icon size={16} className={categoryColors[cat]} />
            </button>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className={`${className} ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-r flex flex-col`} style={style}>
      {/* Header */}
      <div className={`p-3 border-b ${lightMode ? 'border-gray-200' : 'border-gray-700'}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-sm font-semibold ${lightMode ? 'text-gray-900' : 'text-white'}`}>Projects</h2>
          <button
            onClick={() => togglePanel('left')}
            className={`p-1 rounded transition-colors ${lightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <ChevronRight size={14} className="rotate-180" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-2">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-sm rounded-lg pl-9 pr-3 py-2 border focus:border-blue-500 focus:outline-none ${
              lightMode 
                ? 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200' 
                : 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
            }`}
          />
        </div>
        
        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 text-xs w-full px-2 py-1.5 rounded transition-colors
            ${showFilters 
              ? (lightMode ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white') 
              : (lightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800')}
          `}
        >
          <Filter size={12} />
          Filters
          {categoryFilter && (
            <span className="ml-auto bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs">
              1
            </span>
          )}
        </button>
        
        {/* Category filters */}
        {showFilters && (
          <div className="mt-2 flex flex-wrap gap-1">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat];
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(isActive ? null : cat)}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded text-xs capitalize transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : lightMode ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon size={12} className={isActive ? 'text-white' : categoryColors[cat]} />
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredProjects.length === 0 ? (
          <div className={`text-center text-sm py-8 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectNode
              key={project.id}
              project={project}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
            />
          ))
        )}
      </div>
      
      {/* Footer stats */}
      <div className={`p-3 border-t text-xs ${lightMode ? 'border-gray-200 text-gray-400' : 'border-gray-700 text-gray-500'}`}>
        {filteredProjects.length} projects • {filteredProjects.reduce((acc, p) => acc + p.subsystems.length, 0)} assemblies
      </div>
    </div>
  );
}
