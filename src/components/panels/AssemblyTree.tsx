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
  Tag,
} from 'lucide-react';
import { usePortfolioStore, Project, Subsystem } from '@/store/usePortfolioStore';
import { PROJECT_ICON_MAP } from '@/lib/projectIcons';

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
}

function ProjectNode({ project }: ProjectNodeProps) {
  const {
    selectedProjectId,
    selectProject,
    theme,
  } = usePortfolioStore();
  
  const isSelected = selectedProjectId === project.id;
  const hasActiveProject = selectedProjectId !== null;
  const CategoryIcon = categoryIcons[project.category];
  const ProjectIcon = project.iconKey ? PROJECT_ICON_MAP[project.iconKey] : null;
  const lightMode = theme === 'light';
  
  const handleProjectSelect = () => {
    selectProject(project.id);
  };
  
  return (
    <div className={`mb-2 pb-2 ${lightMode ? 'border-b border-gray-200' : 'border-b border-gray-800'}`}>
      <div
        className={`
          flex items-center gap-2 py-2 px-2 cursor-pointer rounded-lg transition-all border-l-4
          ${isSelected 
            ? lightMode ? 'bg-gray-200 border-blue-500 text-gray-900' : 'bg-gray-700 border-blue-500 text-white' 
            : lightMode ? 'hover:bg-gray-200 border-transparent text-gray-800' : 'hover:bg-gray-800 border-transparent text-gray-200'
          }
          ${!isSelected && hasActiveProject ? 'opacity-70 hover:opacity-100' : ''}
        `}
        onClick={handleProjectSelect}
      >
        {ProjectIcon ? (
          <ProjectIcon size={16} className={categoryColors[project.category]} />
        ) : (
          <CategoryIcon size={16} className={categoryColors[project.category]} />
        )}
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.name}</div>
          <div className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>{project.year}</div>
        </div>

        {isSelected && (
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${lightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/40 text-blue-200'}`}>
            Active
          </span>
        )}
      </div>
    </div>
  );
}

interface AssemblyTreeProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function AssemblyTree({ className, style }: AssemblyTreeProps) {
  const { 
    projects, 
    searchQuery, 
    setSearchQuery, 
    categoryFilter, 
    setCategoryFilter, 
    leftPanelCollapsed, 
    togglePanel, 
    theme, 
    selectedProjectId,
    showProjectOverview,
    setShowProjectOverview,
    selectedTaggedPartId,
    hoveredTaggedPartId,
    selectTaggedPart,
    setHoveredTaggedPart,
    selectProject,
  } = usePortfolioStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubsystemExpanded, setActiveSubsystemExpanded] = useState<Set<string>>(new Set());
  const lightMode = theme === 'light';
  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;
  
  const toggleActiveSubsystem = (id: string) => {
    setActiveSubsystemExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  React.useEffect(() => {
    setActiveSubsystemExpanded(new Set());
  }, [activeProject?.id]);
  
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

        {activeProject && (
          <div className={`mt-3 rounded-lg px-3 py-2 border ${lightMode ? 'border-blue-200 bg-blue-50' : 'border-blue-900/40 bg-blue-900/20'}`}>
            <div className={`text-[10px] uppercase tracking-wide ${lightMode ? 'text-blue-700' : 'text-blue-300'}`}>Active Project</div>
            <div className="flex items-center gap-2 mt-1">
              {activeProject.iconKey && PROJECT_ICON_MAP[activeProject.iconKey]
                ? React.createElement(PROJECT_ICON_MAP[activeProject.iconKey], { size: 14, className: categoryColors[activeProject.category] })
                : React.createElement(categoryIcons[activeProject.category], { size: 14, className: categoryColors[activeProject.category] })}
              <div className={`text-sm font-medium truncate ${lightMode ? 'text-gray-900' : 'text-white'}`}>{activeProject.name}</div>
              <span className={`text-xs ml-auto ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>{activeProject.year}</span>
            </div>

            <div
              className={`mt-3 rounded-lg border ${lightMode ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900/40'} flex flex-col`}
              style={{ height: '250px' }}
            >
              <div className="p-2 space-y-1">
                <div
                  className={`
                    flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors
                    ${!showProjectOverview 
                      ? 'bg-blue-600 text-white' 
                      : lightMode ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'}
                  `}
                  onClick={() => {
                    selectProject(activeProject.id);
                    setShowProjectOverview(false);
                  }}
                >
                  <Box size={14} className={!showProjectOverview ? 'text-white' : 'text-green-500'} />
                  <span className="text-sm font-medium">3D Model</span>
                </div>

                <div
                  className={`
                    flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors
                    ${showProjectOverview 
                      ? 'bg-blue-600 text-white' 
                      : lightMode ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-800'}
                  `}
                  onClick={() => {
                    selectProject(activeProject.id);
                    setShowProjectOverview(true);
                  }}
                >
                  <FileText size={14} className={showProjectOverview ? 'text-white' : 'text-blue-500'} />
                  <span className="text-sm font-medium">Project Overview</span>
                </div>
              </div>

              {activeProject.cadModel?.taggedParts?.length ? (
                <div className={`border-t px-2 pb-2 flex-shrink-0 ${lightMode ? 'border-gray-200' : 'border-gray-700'}`}>
                  <div className={`flex items-center gap-2 px-2 py-1 text-xs ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <Tag size={12} className="text-blue-400" />
                    <span>Tagged Parts</span>
                    <span className="ml-auto">{activeProject.cadModel.taggedParts.length}</span>
                  </div>
                  <div className="space-y-1 pr-1">
                    {activeProject.cadModel.taggedParts.map((part) => {
                      const isSelectedPart = selectedTaggedPartId === part.id;
                      const isHoveredPart = hoveredTaggedPartId === part.id;
                      return (
                        <div
                          key={part.id}
                          className={`flex items-center gap-2 py-1 px-2 rounded border cursor-pointer transition-colors ${
                            isSelectedPart
                              ? lightMode
                                ? 'bg-blue-100 border-blue-400 text-blue-900'
                                : 'bg-blue-900/40 border-blue-500 text-white'
                              : isHoveredPart
                                ? lightMode
                                  ? 'bg-gray-100 border-gray-200 text-gray-900'
                                  : 'bg-gray-800 border-gray-700 text-white'
                                : lightMode
                                  ? 'border-gray-200 hover:bg-gray-100 text-gray-700'
                                  : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                          }`}
                          onClick={() => {
                            selectProject(activeProject.id);
                            setShowProjectOverview(false);
                            selectTaggedPart(part.id);
                          }}
                          onMouseEnter={() => setHoveredTaggedPart(part.id)}
                          onMouseLeave={() => setHoveredTaggedPart(null)}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ backgroundColor: part.color }}
                          />
                          <span className="text-sm truncate flex-1">{part.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className={`border-t px-2 py-2 ${lightMode ? 'border-gray-200' : 'border-gray-700'} flex-1 min-h-0 overflow-hidden flex flex-col`}>
                <div className={`text-[11px] uppercase tracking-wide mb-2 ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>Subsystems</div>
                <div className="space-y-1 pr-1 overflow-y-auto min-h-0 flex-1">
                  {activeProject.subsystems.map((subsystem) => (
                    <TreeNode
                      key={subsystem.id}
                      subsystem={subsystem}
                      projectId={activeProject.id}
                      expanded={activeSubsystemExpanded}
                      toggleExpanded={toggleActiveSubsystem}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 relative">
        {filteredProjects.length > 0 && (
          <div className={`sticky top-0 z-10 px-2 py-2 ${lightMode ? 'bg-white' : 'bg-gray-900'}`}>
            <div className={`text-[10px] uppercase tracking-wide ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              All Projects
            </div>
          </div>
        )}
        {filteredProjects.length === 0 ? (
          <div className={`text-center text-sm py-8 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectNode
              key={project.id}
              project={project}
            />
          ))
        )}
        {filteredProjects.length > 0 && (
          <div className={`pointer-events-none sticky bottom-0 h-8 bg-gradient-to-t ${lightMode ? 'from-white' : 'from-gray-900'} to-transparent`} />
        )}
      </div>
      
      {/* Footer stats */}
      <div className={`p-3 border-t text-xs ${lightMode ? 'border-gray-200 text-gray-400' : 'border-gray-700 text-gray-500'}`}>
        {filteredProjects.length} projects • {filteredProjects.reduce((acc, p) => acc + p.subsystems.length, 0)} assemblies
      </div>
    </div>
  );
}
