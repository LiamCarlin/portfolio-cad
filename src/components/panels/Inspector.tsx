'use client';

import React, { useMemo, useState } from 'react';
import { resolvePublicUrl } from '@/lib/resolvePublicUrl';
import {
  ChevronLeft,
  ExternalLink,
  Github,
  Video,
  FileText,
  Box,
  User,
  Wrench,
  Target,
  Link as LinkIcon,
  Award,
  Scale,
  Clock,
  Layers,
  Image,
  Tag,
  Users,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { usePortfolioStore, Subsystem, TaggedPart } from '@/store/usePortfolioStore';

interface InspectorProps {
  className?: string;
  style?: React.CSSProperties;
}

// Helper to find subsystem by ID recursively
const findSubsystem = (subsystems: Subsystem[], id: string): Subsystem | null => {
  for (const sub of subsystems) {
    if (sub.id === id) return sub;
    if (sub.children) {
      const found = findSubsystem(sub.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to count all subsystems including nested
const countSubsystems = (subsystems: Subsystem[]): number => {
  return subsystems.reduce((acc, sub) => {
    return acc + 1 + (sub.children ? countSubsystems(sub.children) : 0);
  }, 0);
};

export default function Inspector({ className, style }: InspectorProps) {
  const {
    projects,
    selectedProjectId,
    selectedSubsystemIds,
    selectedTaggedPartId,
    hoveredTaggedPartId,
    rightPanelCollapsed,
    togglePanel,
    theme,
    showProjectOverview: showOverviewState,
  } = usePortfolioStore();
  
  const lightMode = theme === 'light';
  
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  
  const selectedSubsystems = useMemo(() => {
    if (!selectedProject) return [];
    return selectedSubsystemIds
      .map((id) => findSubsystem(selectedProject.subsystems, id))
      .filter(Boolean) as Subsystem[];
  }, [selectedProject, selectedSubsystemIds]);

  // Find selected or hovered tagged part
  const activeTaggedPart = useMemo(() => {
    if (!selectedProject?.cadModel) return null;
    const partId = selectedTaggedPartId || hoveredTaggedPartId;
    if (!partId) return null;
    return selectedProject.cadModel.taggedParts.find(p => p.id === partId) || null;
  }, [selectedProject, selectedTaggedPartId, hoveredTaggedPartId]);
  
  if (rightPanelCollapsed) {
    return (
      <div className={`${className} w-10 ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-l flex flex-col items-center py-4`} style={style}>
        <button
          onClick={() => togglePanel('right')}
          className={`p-2 rounded transition-colors ${lightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    );
  }
  
  // Show tagged part details
  const showTaggedPartDetails = activeTaggedPart !== null;
  // Show subsystem details when one is selected
  const showSubsystemDetails = selectedSubsystems.length === 1 && !activeTaggedPart;
  // Show aggregated stats when multiple are selected
  const showAggregatedStats = selectedSubsystems.length > 1 && !activeTaggedPart;
  // Show project overview in inspector when nothing else is selected (even in 3D Model tab)
  const showProjectOverview = selectedProject && selectedSubsystemIds.length === 0 && !activeTaggedPart;
  
  return (
    <div className={`${className} ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-l flex flex-col`} style={style}>
      {/* Header */}
      <div className={`p-3 border-b ${lightMode ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
        <h2 className={`text-sm font-semibold ${lightMode ? 'text-gray-900' : 'text-white'}`}>Inspector</h2>
        <button
          onClick={() => togglePanel('right')}
          className={`p-1 rounded transition-colors ${lightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          <ChevronLeft size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedProject ? (
          // No project selected
          <div className={`p-4 text-center ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Box size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a project from the tree to view details</p>
          </div>
        ) : showTaggedPartDetails ? (
          // Tagged part details
          <TaggedPartInfo part={activeTaggedPart!} lightMode={lightMode} />
        ) : showSubsystemDetails ? (
          // Single subsystem details
          <SubsystemDetails subsystem={selectedSubsystems[0]} lightMode={lightMode} />
        ) : showAggregatedStats ? (
          // Aggregated stats for multiple selection
          <AggregatedStats subsystems={selectedSubsystems} lightMode={lightMode} />
        ) : showProjectOverview ? (
          // Project overview (default when project selected but no subsystem)
          <ProjectOverview project={selectedProject} lightMode={lightMode} />
        ) : null}
      </div>
    </div>
  );
}

// Tagged Part Information
function TaggedPartInfo({ part, lightMode }: { part: TaggedPart; lightMode: boolean }) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Tagged Part</div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: part.color }}
          />
          <h3 className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>{part.name}</h3>
        </div>
      </div>

      {part.description && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText size={12} />
            Description
          </div>
          <p className={`text-sm leading-relaxed ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            {part.description}
          </p>
        </div>
      )}

      {part.role && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <User size={12} />
            My Role
          </div>
          <p className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{part.role}</p>
        </div>
      )}

      {part.tools.length > 0 && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Wrench size={12} />
            Tools Used
          </div>
          <div className="flex flex-wrap gap-1">
            {part.tools.map((tool) => (
              <span
                key={tool}
                className={`text-xs px-2 py-1 rounded ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300'}`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {part.outcomes.length > 0 && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Target size={12} />
            Key Outcomes
          </div>
          <ul className="space-y-1">
            {part.outcomes.map((outcome, index) => (
              <li key={index} className={`text-sm flex items-start gap-2 ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                <Award size={12} className="mt-1 text-green-400 flex-shrink-0" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Project Overview Component
function ProjectOverview({ project, lightMode }: { project: any; lightMode: boolean }) {
  const taggedPartsCount = project.cadModel?.taggedParts?.length || 0;
  const imagesCount = project.images?.length || 0;
  const contentBlocksCount = project.contentBlocks?.length || 0;

  return (
    <div className="p-4">
      {/* Project header */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Project</div>
        <h3 className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.name}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300'}`}>
            {project.year}
          </span>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded capitalize">
            {project.category}
          </span>
        </div>
      </div>
      
      {/* Thumbnail */}
      {(project.thumbnailFile || project.thumbnail) && (
        <div className="mb-4">
          <img 
            src={project.thumbnailFile || resolvePublicUrl(project.thumbnail)} 
            alt={project.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
      
      {/* Description */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText size={12} />
          Description
        </div>
        <p className={`text-sm leading-relaxed ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
          {project.description}
        </p>
      </div>
      
      {/* Role */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <User size={12} />
          Role
        </div>
        <p className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.role}</p>
      </div>

      {/* Team & Duration if available */}
      {(project.teamSize || project.duration) && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {project.teamSize && (
            <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
                <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Team Size</div>
              </div>
              <div className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.teamSize}</div>
            </div>
          )}
          {project.duration && (
            <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className={lightMode ? 'text-gray-400' : 'text-gray-500'} />
                <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration</div>
              </div>
              <div className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.duration}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Challenge/Solution/Impact */}
      <div className="mb-4 space-y-3">
        {project.challenge && (
          <div>
            <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Challenge</div>
            <p className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>{project.challenge}</p>
          </div>
        )}
        {project.solution && (
          <div>
            <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Solution</div>
            <p className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>{project.solution}</p>
          </div>
        )}
        {project.impact && (
          <div>
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Impact</div>
            <p className={`text-xs ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>{project.impact}</p>
          </div>
        )}
      </div>

      {/* Skills if available */}
      {project.skills && project.skills.length > 0 && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Lightbulb size={12} />
            Skills Developed
          </div>
          <div className="flex flex-wrap gap-1">
            {project.skills.map((skill: string) => (
              <span
                key={skill}
                className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Tools */}
      {project.tools.length > 0 && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Wrench size={12} />
            Tools & Technologies
          </div>
          <div className="flex flex-wrap gap-1">
            {project.tools.map((tool: string) => (
              <span
                key={tool}
                className={`text-xs px-2 py-1 rounded ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300'}`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
          <div className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            {countSubsystems(project.subsystems)}
          </div>
          <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Components</div>
        </div>
        <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
          <div className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            {project.milestones.length}
          </div>
          <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Milestones</div>
        </div>
        {taggedPartsCount > 0 && (
          <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
            <div className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              {taggedPartsCount}
            </div>
            <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Tagged Parts</div>
          </div>
        )}
        {imagesCount > 0 && (
          <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
            <div className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              {imagesCount}
            </div>
            <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Images</div>
          </div>
        )}
      </div>

      {/* CAD Model Info */}
      {project.cadModel && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Box size={12} />
            3D Model
          </div>
          <div className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            {project.cadModel.name}
          </div>
          <div className={`text-xs mt-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Click on tags in the 3D view to see details
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {project.images && project.images.length > 0 && (
        <div className="mb-4">
          <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Image size={12} />
            Gallery
          </div>
          <div className="grid grid-cols-3 gap-1">
            {project.images.slice(0, 6).map((img: any, i: number) => (
              <img
                key={img.id || i}
                src={img.data}
                alt={img.caption || `Image ${i + 1}`}
                className="w-full h-12 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Links */}
      <div>
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <LinkIcon size={12} />
          Links
        </div>
        <div className="space-y-2">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm transition-colors p-2 rounded-lg ${
                lightMode 
                  ? 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200' 
                  : 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Github size={16} />
              View on GitHub
              <ExternalLink size={12} className="ml-auto" />
            </a>
          )}
          {project.links.video && (
            <a
              href={project.links.video}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm transition-colors p-2 rounded-lg ${
                lightMode 
                  ? 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200' 
                  : 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Video size={16} />
              Watch Video
              <ExternalLink size={12} className="ml-auto" />
            </a>
          )}
          {project.links.onshape && (
            <a
              href={project.links.onshape}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm transition-colors p-2 rounded-lg ${
                lightMode 
                  ? 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200' 
                  : 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Box size={16} />
              View CAD in Onshape
              <ExternalLink size={12} className="ml-auto" />
            </a>
          )}
          {project.links.writeup && (
            <a
              href={project.links.writeup}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm transition-colors p-2 rounded-lg ${
                lightMode 
                  ? 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200' 
                  : 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <FileText size={16} />
              Documentation
              <ExternalLink size={12} className="ml-auto" />
            </a>
          )}
        </div>
      </div>

      {/* Content Blocks - Full project writeup */}
      {project.contentBlocks && project.contentBlocks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className={`text-xs uppercase tracking-wider mb-4 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText size={12} />
            Project Details
          </div>
          <div className="space-y-4">
            {project.contentBlocks.map((block: any) => (
              <ContentBlockRenderer key={block.id} block={block} lightMode={lightMode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Content Block Renderer Component
function ContentBlockRenderer({ block, lightMode }: { block: any; lightMode: boolean }) {
  switch (block.type) {
    case 'heading':
      const headingSize = block.level === 1 ? 'text-xl' : block.level === 3 ? 'text-base' : 'text-lg';
      const headingClass = `${headingSize} font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`;
      if (block.level === 1) return <h1 className={headingClass}>{block.content}</h1>;
      if (block.level === 3) return <h3 className={headingClass}>{block.content}</h3>;
      return <h2 className={headingClass}>{block.content}</h2>;
    
    case 'text':
      return (
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
          {block.content}
        </p>
      );
    
    case 'list':
      return (
        <ul className={`text-sm space-y-1 list-disc list-inside ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
          {(block.items || []).map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    
    case 'quote':
      return (
        <blockquote className={`border-l-4 pl-4 py-2 ${lightMode ? 'border-blue-400 bg-blue-50' : 'border-blue-500 bg-blue-500/10'}`}>
          <p className={`text-sm italic ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            "{block.content}"
          </p>
          {block.author && (
            <cite className={`text-xs mt-1 block ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              — {block.author}
            </cite>
          )}
        </blockquote>
      );
    
    case 'image':
      const imageSource = block.file || block.imageData || block.content;
      return imageSource ? (
        <div className="space-y-2">
          <img 
            src={imageSource} 
            alt={block.caption || 'Project image'} 
            className="w-full rounded-lg"
          />
          {block.caption && (
            <p className={`text-xs text-center ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {block.caption}
            </p>
          )}
        </div>
      ) : null;
    
    case 'gallery':
      return block.images && block.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {block.images.map((img: any, i: number) => (
            <img 
              key={i}
              src={img.data || img} 
              alt={img.caption || `Gallery image ${i + 1}`}
              className="w-full h-24 object-cover rounded"
            />
          ))}
        </div>
      ) : null;
    
    case 'link':
      return block.url ? (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block p-3 rounded-lg border transition-colors ${
            lightMode 
              ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
              : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
          }`}
        >
          <div className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            {block.title || block.url}
          </div>
          {block.content && (
            <div className={`text-xs mt-1 ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {block.content}
            </div>
          )}
        </a>
      ) : null;
    
    default:
      return null;
  }
}

// Subsystem Details Component  
function SubsystemDetails({ subsystem, lightMode }: { subsystem: Subsystem; lightMode: boolean }) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Component</div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: subsystem.color }}
          />
          <h3 className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>{subsystem.name}</h3>
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText size={12} />
          Description
        </div>
        <p className={`text-sm leading-relaxed ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
          {subsystem.description}
        </p>
      </div>
      
      {/* Role */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <User size={12} />
          My Role
        </div>
        <p className={`text-sm font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{subsystem.role}</p>
      </div>
      
      {/* Tools */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Wrench size={12} />
          Tools Used
        </div>
        <div className="flex flex-wrap gap-1">
          {subsystem.tools.map((tool) => (
            <span
              key={tool}
              className={`text-xs px-2 py-1 rounded ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300'}`}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
      
      {/* Outcomes */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Target size={12} />
          Key Outcomes
        </div>
        <ul className="space-y-1">
          {subsystem.outcomes.map((outcome, index) => (
            <li key={index} className={`text-sm flex items-start gap-2 ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              <Award size={12} className="mt-1 text-green-400 flex-shrink-0" />
              {outcome}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Children count */}
      {subsystem.children && subsystem.children.length > 0 && (
        <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
          <div className={`flex items-center gap-2 text-sm ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            <Layers size={14} />
            <span>{subsystem.children.length} child components</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Aggregated Stats Component
function AggregatedStats({ subsystems, lightMode }: { subsystems: Subsystem[]; lightMode: boolean }) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Selection</div>
        <h3 className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
          {subsystems.length} Components Selected
        </h3>
      </div>
      
      {/* Selected items list */}
      <div className="mb-4 space-y-1">
        {subsystems.map((sub) => (
          <div key={sub.id} className={`flex items-center gap-2 text-sm ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: sub.color }}
            />
            {sub.name}
          </div>
        ))}
      </div>
      
      {/* Aggregated stats */}
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Scale size={12} />
          Aggregated Metrics
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
            <div className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              {new Set(subsystems.flatMap((s) => s.tools)).size}
            </div>
            <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Unique Tools</div>
          </div>
          <div className={`rounded-lg p-3 ${lightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
            <div className={`text-2xl font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              {subsystems.reduce((acc, s) => acc + s.outcomes.length, 0)}
            </div>
            <div className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Outcomes</div>
          </div>
        </div>
      </div>
      
      {/* Combined tools */}
      <div>
        <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Wrench size={12} />
          All Tools
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(subsystems.flatMap((s) => s.tools))).map((tool) => (
            <span
              key={tool}
              className={`text-xs px-2 py-1 rounded ${lightMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300'}`}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

