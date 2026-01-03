'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Cpu,
  Car,
  Code,
  FlaskConical,
  Package,
  Calendar,
  Wrench,
  Target,
  Lightbulb,
  CheckCircle,
  Link as LinkIcon,
  Box,
  ArrowLeft,
  MapPin,
  Briefcase,
  FileText,
  LucideIcon,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { usePortfolioStore, Project, Subsystem, ContentBlock } from '@/store/usePortfolioStore';
import { useProjectsLoader } from '@/hooks/useProjectsLoader';
import { getImageDataUrl } from '@/lib/imageStorage';
import { resolvePublicUrl } from '@/lib/resolvePublicUrl';
import { PROJECT_ICON_MAP } from '@/lib/projectIcons';

const categoryIcons: Record<string, LucideIcon> = {
  robotics: Cpu,
  vehicles: Car,
  software: Code,
  research: FlaskConical,
  other: Package,
};

const categoryGradients: Record<string, string> = {
  robotics: 'from-green-500 to-emerald-600',
  vehicles: 'from-blue-500 to-cyan-600',
  software: 'from-purple-500 to-violet-600',
  research: 'from-yellow-500 to-orange-600',
  other: 'from-gray-500 to-slate-600',
};

// Render content blocks
function ContentBlockRenderer({ block, lightMode }: { block: ContentBlock; lightMode: boolean }) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level || 2}` as 'h1' | 'h2' | 'h3';
      const headingClasses = {
        1: 'text-2xl font-bold mb-4',
        2: 'text-xl font-semibold mb-3',
        3: 'text-lg font-medium mb-2',
      };
      return (
        <HeadingTag className={`${headingClasses[block.level || 2]} ${lightMode ? 'text-gray-900' : 'text-white'}`}>
          {block.content}
        </HeadingTag>
      );
    case 'text':
      return (
        <p className={`mb-4 leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
          {block.content}
        </p>
      );
    case 'image':
      const imgSrc = block.file || resolvePublicUrl(block.content);
      return (
        <figure className="mb-4">
          <img 
            src={imgSrc || ''} 
            alt={block.caption || ''} 
            className="w-full rounded-xl"
          />
          {block.caption && (
            <figcaption className="text-sm mt-2 text-center text-gray-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'list':
      return (
        <ul className="list-disc list-inside mb-4 space-y-1 text-gray-300">
          {block.items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-blue-400 pl-4 py-2 mb-4 italic text-gray-400 bg-gray-800/50 rounded-r">
          <p>{block.content}</p>
          {block.author && (
            <footer className="mt-2 text-sm text-gray-500">
              — {block.author}
            </footer>
          )}
        </blockquote>
      );
    case 'link':
      return (
        <a
          href={block.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mb-4 text-blue-400 hover:text-blue-300"
        >
          <LinkIcon size={14} />
          {block.title || block.url}
        </a>
      );
    case 'gallery':
      const images = block.imageFiles || block.images || [];
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {images.map((img: string, i: number) => (
            <img key={i} src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      );
    default:
      return null;
  }
}

// Subsystem card component
function SubsystemCard({ subsystem, lightMode }: { subsystem: Subsystem; lightMode: boolean }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={`rounded-xl border overflow-hidden ${
      lightMode
        ? 'bg-gray-100 border-gray-300'
        : 'bg-gray-800/50 border-gray-700'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
          lightMode ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: subsystem.color || '#3b82f6' }}
          />
          <div>
            <h4 className={`font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{subsystem.name}</h4>
            <p className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>{subsystem.role}</p>
          </div>
        </div>
        <ChevronDown 
          size={18} 
          className={`transition-transform ${expanded ? 'rotate-180' : ''} ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}
        />
      </button>
      
      {expanded && (
        <div className={`px-4 pb-4 border-t ${lightMode ? 'border-gray-300' : 'border-gray-700'}`}>
          <div className="pt-4 space-y-4">
            <p className={`text-sm ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              {subsystem.description}
            </p>
            
            {subsystem.tools && subsystem.tools.length > 0 && (
              <div>
                <h5 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Tools Used
                </h5>
                <div className="flex flex-wrap gap-1">
                  {subsystem.tools.map((tool, i) => (
                    <span key={i} className={`px-2 py-0.5 text-xs rounded ${
                      lightMode
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {subsystem.outcomes && subsystem.outcomes.length > 0 && (
              <div>
                <h5 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Key Outcomes
                </h5>
                <ul className="space-y-1">
                  {subsystem.outcomes.map((outcome, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {subsystem.children && subsystem.children.length > 0 && (
              <div className="space-y-2 pt-2">
                {subsystem.children.map((child) => (
                  <SubsystemCard key={child.id} subsystem={child} lightMode={lightMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Project detail component
function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const { theme } = usePortfolioStore();
  const lightMode = theme === 'light';
  const CategoryIcon = categoryIcons[project.category] || Package;
  
  const baseResolvedThumb = resolvePublicUrl(project.thumbnail);
  const thumbnail = project.thumbnailFile || baseResolvedThumb || 
    (project.images && project.images.length > 0 ? project.images[0].data : null);
  
  return (
    <div className={`min-h-screen ${lightMode ? 'bg-gray-50' : 'bg-gray-950'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b backdrop-blur-sm ${
        lightMode
          ? 'bg-white/95 border-gray-200'
          : 'bg-gray-900/95 border-gray-800'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${
              lightMode
                ? 'hover:bg-gray-100 text-gray-600'
                : 'hover:bg-gray-800 text-gray-400'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className={`font-bold truncate ${lightMode ? 'text-gray-900' : 'text-white'}`}>{project.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className={`flex items-center gap-1 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <CategoryIcon size={12} />
                <span className="capitalize">{project.category}</span>
              </span>
              <span className={lightMode ? 'text-gray-400' : 'text-gray-600'}>•</span>
              <span className={lightMode ? 'text-gray-600' : 'text-gray-400'}>{project.year}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero image */}
      {thumbnail && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={thumbnail} alt={project.name} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${
            lightMode
              ? 'from-gray-50 via-gray-50/50'
              : 'from-gray-950 via-gray-950/50'
          }`} />
        </div>
      )}
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Role and tools */}
        <div className={`mb-8 p-5 rounded-2xl border ${
          lightMode
            ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
            : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700'
        }`}>
          <div className="flex flex-wrap gap-6">
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-1 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Role
              </h3>
              <p className={lightMode ? 'text-gray-900' : 'text-white'}>{project.role || 'Not specified'}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full border ${
                    lightMode
                      ? 'bg-white border-gray-300 text-gray-700'
                      : 'bg-gray-700/50 text-gray-200 border-gray-600'
                  }`}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Overview */}
        <section className="mb-8">
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
            <Target size={20} className={lightMode ? 'text-blue-600' : 'text-blue-400'} />
            Overview
          </h2>
          <p className={`leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
            {project.description}
          </p>
        </section>
        
        {/* Challenge */}
        {project.challenge && (
          <section className="mb-8">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              <Lightbulb size={20} className="text-yellow-500" />
              Challenge
            </h2>
            <p className={`leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              {project.challenge}
            </p>
          </section>
        )}
        
        {/* Solution */}
        {project.solution && (
          <section className="mb-8">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              <Wrench size={20} className={lightMode ? 'text-green-600' : 'text-green-400'} />
              Solution
            </h2>
            <p className={`leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              {project.solution}
            </p>
          </section>
        )}
        
        {/* Impact */}
        {project.impact && (
          <section className="mb-8">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              <CheckCircle size={20} className={lightMode ? 'text-purple-600' : 'text-purple-400'} />
              Impact
            </h2>
            <p className={`leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              {project.impact}
            </p>
          </section>
        )}
        
        {/* Subsystems */}
        {project.subsystems && project.subsystems.length > 0 && (
          <section className="mb-8">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              <Box size={20} className={lightMode ? 'text-blue-600' : 'text-blue-400'} />
              System Components
            </h2>
            <div className="space-y-2">
              {project.subsystems.map((subsystem) => (
                <SubsystemCard key={subsystem.id} subsystem={subsystem} lightMode={lightMode} />
              ))}
            </div>
          </section>
        )}
        
        {/* Content blocks */}
        {project.contentBlocks && project.contentBlocks.length > 0 && (
          <section className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              Project Details
            </h2>
            <div>
              {project.contentBlocks.map((block) => (
                <ContentBlockRenderer key={block.id} block={block} lightMode={lightMode} />
              ))}
            </div>
          </section>
        )}
        
        {/* Links */}
        {project.links && Object.keys(project.links).length > 0 && (
          <section className="mb-8">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              <LinkIcon size={20} className={lightMode ? 'text-blue-600' : 'text-blue-400'} />
              Project Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(project.links).map(([key, url]) => {
                if (!url) return null;
                const Icon = key === 'github' ? Github : ExternalLink;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                      lightMode
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-gray-300'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="capitalize">{key}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
        
        {/* Timeline */}
        {project.milestones && project.milestones.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Calendar size={20} className="text-blue-400" />
              Timeline
            </h2>
            <div className="relative pl-6 border-l-2 border-gray-700">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="mb-6 last:mb-0">
                  <div className={`absolute -left-2 w-4 h-4 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-600'}`} style={{ marginTop: '4px' }} />
                  <div className="text-xs font-medium mb-1 text-gray-400">
                    {milestone.date}
                  </div>
                  <h3 className="font-medium text-white">{milestone.name}</h3>
                  <p className="text-sm text-gray-400">{milestone.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Project card - grid style like davidbarsoum.com
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const CategoryIcon = categoryIcons[project.category] || Package;
  
  const baseResolvedThumb = resolvePublicUrl(project.thumbnail);
  const thumbnail = project.thumbnailFile || baseResolvedThumb || 
    (project.images && project.images.length > 0 ? project.images[0].data : null);
  
  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800 text-left"
    >
      {/* Background image */}
      {thumbnail ? (
        <img 
          src={thumbnail} 
          alt={project.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[project.category]} opacity-50`} />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-300" />
      
      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        {/* Title and subtitle always visible */}
        <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
            {project.name}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2 opacity-90">
            {project.description}
          </p>
        </div>
        
        {/* Tools - appear on hover */}
        <div className="mt-3 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          {project.tools.slice(0, 4).map((tool, i) => (
            <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white backdrop-blur-sm">
              {tool}
            </span>
          ))}
          {project.tools.length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white backdrop-blur-sm">
              +{project.tools.length - 4}
            </span>
          )}
        </div>
      </div>
      
      {/* Category + Year badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryGradients[project.category]} text-white shadow-lg`}>
          {project.category}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
          {project.year}
        </span>
      </div>
      
      {/* Hover arrow */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ChevronRight size={18} className="text-white" />
      </div>
    </button>
  );
}

// Experience section
function ExperienceSection() {
  const { experienceEntries, theme } = usePortfolioStore();
  const [expanded, setExpanded] = useState(false);
  const lightMode = theme === 'light';
  
  if (!experienceEntries || experienceEntries.length === 0) return null;
  
  return (
    <section className="mb-12">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between text-left p-5 rounded-2xl transition-all duration-300 ${
          lightMode
            ? 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 hover:border-gray-400 hover:shadow-lg'
            : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-gray-600 hover:shadow-lg hover:shadow-blue-500/5'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              Experience
            </h2>
            <p className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {experienceEntries.length} {experienceEntries.length === 1 ? 'position' : 'positions'}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
          <span className="text-sm">{expanded ? 'Hide' : 'Show'}</span>
          <ChevronDown 
            size={20} 
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-3">
          {experienceEntries.map((exp) => (
            <div 
              key={exp.id}
              className={`p-4 rounded-xl transition-colors ${
                lightMode
                  ? 'bg-gray-100 border border-gray-300 hover:border-gray-400'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                {exp.logoUrl ? (
                  <img 
                    src={resolvePublicUrl(exp.logoUrl) || exp.logoUrl}
                    alt={exp.organization}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1.5"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    lightMode
                      ? 'bg-gradient-to-br from-gray-200 to-gray-300'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800'
                  }`}>
                    <Briefcase size={20} className={lightMode ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                    {exp.role}
                  </h3>
                  <p className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {exp.organization}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  <p className={`text-xs mt-0.5 ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                  {exp.description && (
                    <p className={`text-sm mt-2 ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Modern Scroll Progress Indicator Component
function ScrollDotIndicator({ activeSection }: { activeSection: string }) {
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
  ];
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const activeIndex = sections.findIndex(s => s.id === activeSection);
  const progress = activeIndex >= 0 ? (activeIndex / (sections.length - 1)) * 100 : 0;
  
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-4">
      {/* Modern vertical progress track */}
      <div className="relative flex flex-col items-center">
        {/* Background track */}
        <div className="w-[3px] h-32 bg-gradient-to-b from-gray-700/40 via-gray-600/30 to-gray-700/40 rounded-full overflow-hidden">
          {/* Active progress bar with gradient */}
          <div 
            className="w-full bg-gradient-to-b from-blue-500 via-blue-400 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/50 mt-[8px]"
            style={{ height: `calc(${progress}% - 16px)` }}
          />
        </div>
        
        {/* Interactive section markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-0">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isPast = index < activeIndex;
            
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="group relative flex items-center justify-center"
                aria-label={`Go to ${section.label}`}
              >
                {/* Label tooltip with smooth slide-in */}
                <div className="absolute left-7 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300 pointer-events-none bg-gradient-to-r from-gray-900 to-gray-800 text-white border border-gray-700 shadow-2xl shadow-black/50">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
                  {section.label}
                </div>
                
                {/* Modern dot with glow effect */}
                <div className="relative">
                  <div className={`
                    rounded-full transition-all duration-500 ease-out relative z-10
                    ${isActive 
                      ? 'w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/60' 
                      : isPast 
                        ? 'w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-400 shadow-md shadow-blue-400/40' 
                        : 'w-2.5 h-2.5 bg-gray-500 group-hover:bg-gray-400 group-hover:w-3 group-hover:h-3 group-hover:shadow-md group-hover:shadow-gray-400/40'
                    }
                  `} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Filter tabs
function FilterTabs({ 
  categories, 
  activeFilter, 
  onFilterChange,
  lightMode
}: { 
  categories: string[]; 
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  lightMode: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          activeFilter === 'all'
            ? lightMode
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-900'
            : lightMode
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        all
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeFilter === cat
              ? lightMode
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-900'
              : lightMode
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// Main component
export default function SimplePortfolio() {
  const { projects, welcomePageData, theme, toggleTheme, hasHydrated, setHasHydrated } = usePortfolioStore();
  const { isLoading } = useProjectsLoader();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bannerImageData, setBannerImageData] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('hero');
  
  const lightMode = theme === 'light';
  const bannerDarkness = (welcomePageData.bannerDarkness ?? 60) / 100;
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map(p => p.category)));
    return cats.sort();
  }, [projects]);
  
  // Filter projects
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter(p => p.category === activeFilter);
  }, [projects, activeFilter]);
  
  // Hydration flag provided by store persist
  // Fallback: if persist didn't mark hydration (e.g., empty storage), mark after brief delay
  useEffect(() => {
    if (hasHydrated) return;
    const timer = setTimeout(() => setHasHydrated(true), 150);
    return () => clearTimeout(timer);
  }, [hasHydrated, setHasHydrated]);
  
  // Scroll tracking for section indicator (reliable scroll listener)
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'experience', 'projects'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Load banner image
  useEffect(() => {
    const load = async () => {
      if (welcomePageData.bannerImageUrl) {
        setBannerImageData(resolvePublicUrl(welcomePageData.bannerImageUrl) || null);
        return;
      }
      if (welcomePageData.bannerImageId) {
        try {
          const dataUrl = await getImageDataUrl(welcomePageData.bannerImageId);
          setBannerImageData(dataUrl);
        } catch {
          setBannerImageData(null);
        }
      }
    };
    load();
  }, [welcomePageData.bannerImageId, welcomePageData.bannerImageUrl]);
  
  // Enable scrolling
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Hydration/data guard - wait for persisted state and project data to load
  if (!hasHydrated || isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${lightMode ? 'bg-white' : 'bg-gray-950'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={lightMode ? 'text-gray-600' : 'text-gray-400'}>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${lightMode ? 'bg-white' : 'bg-gray-950'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={lightMode ? 'text-gray-600' : 'text-gray-400'}>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Project detail view
  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
      />
    );
  }
  
  // Handle click to full version
  const handleGoToFullVersion = () => {
    localStorage.setItem('portfoliocad-prefer-full-site', 'true');
  };
  
  // Handle project selection
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  
  return (
    <div className={`min-h-screen scroll-smooth ${lightMode ? 'bg-gray-50' : 'bg-gray-950'}`} suppressHydrationWarning>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-200 shadow-lg ${
          lightMode
            ? 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 border border-white/10 backdrop-blur-sm'
        }`}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      {/* Scroll Dot Indicator */}
      <ScrollDotIndicator activeSection={activeSection} />
      
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 ${
          lightMode
            ? 'bg-gradient-to-br from-gray-100 via-white to-blue-50'
            : 'bg-gradient-to-br from-gray-900 via-gray-950 to-black'
        }`} />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Banner image overlay if exists */}
        {bannerImageData && (
          <div className="absolute inset-0">
            <img src={bannerImageData} alt="Banner" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to bottom, ${lightMode ? 'rgba(255,255,255,' : 'rgba(3,7,18,'} ${bannerDarkness}), ${lightMode ? 'rgba(255,255,255,' : 'rgba(3,7,18,'} ${Math.min(bannerDarkness + 0.1, 1)}), ${lightMode ? 'rgba(255,255,255,' : 'rgba(3,7,18,'} ${bannerDarkness}))`,
              }}
            />
          </div>
        )}
        
        <div className="relative max-w-5xl mx-auto px-6 pt-8 pb-16">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-16">
            <Link
              href="/"
              onClick={handleGoToFullVersion}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                lightMode
                  ? 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Box size={16} />
              <span className="text-sm">3D Interactive Version</span>
            </Link>
            
            {/* Resume link if available */}
            {welcomePageData.socialLinks.some(l => l.label?.toLowerCase().includes('resume')) && (
              <a
                href={welcomePageData.socialLinks.find(l => l.label?.toLowerCase().includes('resume'))?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors"
              >
                <FileText size={16} />
                <span className="text-sm font-medium">Resume</span>
              </a>
            )}
          </div>
          
          {/* Profile section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ${lightMode ? 'ring-gray-200' : 'ring-white/10'}`}>
                {welcomePageData.profileImageUrl ? (
                  <img 
                    src={resolvePublicUrl(welcomePageData.profileImageUrl) || welcomePageData.profileImageUrl}
                    alt={welcomePageData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                    {welcomePageData.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              {/* Status dot */}
              <div className={`absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 ${lightMode ? 'border-white' : 'border-gray-950'}`} title="Available" />
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                {welcomePageData.name}
              </h1>
              <p className="text-xl text-blue-500 font-medium mb-2">{welcomePageData.title}</p>
              
              {/* Location & School */}
              <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {welcomePageData.school && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {welcomePageData.school}
                  </span>
                )}
              </div>
              
              <p className={`max-w-xl mb-6 leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                {welcomePageData.bio}
              </p>
              
              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {welcomePageData.socialLinks.filter(l => !l.label?.toLowerCase().includes('resume')).map((link) => {
                  const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;
                  return (
                    <a
                      key={link.id}
                      href={href}
                      target={link.platform === 'email' ? undefined : '_blank'}
                      rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        lightMode
                          ? 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                      }`}
                      title={link.label || link.platform}
                    >
                      {link.icon ? (
                        <img 
                          src={link.icon}
                          alt={link.label || link.platform}
                          className="w-5 h-5 object-contain"
                          style={{ filter: lightMode ? 'grayscale(1) brightness(0.4)' : 'invert(1) brightness(0.8)' }}
                        />
                      ) : (
                        <>
                          {link.platform === 'email' && <Mail size={18} />}
                          {link.platform === 'linkedin' && <Linkedin size={18} />}
                          {link.platform === 'github' && <Github size={18} />}
                          {link.platform === 'phone' && <Phone size={18} />}
                          {!['email', 'linkedin', 'github', 'phone'].includes(link.platform) && <ExternalLink size={18} />}
                        </>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Experience */}
        <section id="experience" className="scroll-mt-8">
          <ExperienceSection />
        </section>
        
        {/* Projects section */}
        <section id="projects" className="scroll-mt-8">
          <h2 className={`text-2xl font-bold mb-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>Projects</h2>
          <p className={`mb-6 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>A selection of my engineering work</p>
          
          {/* Filter tabs */}
          <FilterTabs 
            categories={categories} 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            lightMode={lightMode}
          />
          
          {/* Projects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleSelectProject(project)}
              />
            ))}
          </div>
          
          {filteredProjects.length === 0 && (
            <div className={`text-center py-12 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
              No projects in this category yet.
            </div>
          )}
        </section>
      </div>
      
      {/* Footer */}
      <footer className={`border-t ${
        lightMode
          ? 'border-gray-200 bg-gray-100/50'
          : 'border-gray-800 bg-gray-900/50'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} {welcomePageData.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
