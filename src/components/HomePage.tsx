'use client';

import React from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  ChevronRight,
  Cpu,
  Car,
  Code,
  FlaskConical,
  Package,
  Calendar,
} from 'lucide-react';
import { usePortfolioStore, Project } from '@/store/usePortfolioStore';

const categoryIcons = {
  robotics: Cpu,
  vehicles: Car,
  software: Code,
  research: FlaskConical,
  other: Package,
};

const categoryColors = {
  robotics: 'from-green-500/20 to-green-600/10 border-green-500/30',
  vehicles: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  software: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  research: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  other: 'from-gray-500/20 to-gray-600/10 border-gray-500/30',
};

const categoryAccent = {
  robotics: 'text-green-400',
  vehicles: 'text-blue-400',
  software: 'text-purple-400',
  research: 'text-yellow-400',
  other: 'text-gray-400',
};

// Profile configuration - edit these for your portfolio
const PROFILE = {
  name: 'Liam Carlin',
  title: 'Mechanical Engineering Student',
  school: 'Olin College of Engineering',
  bio: 'Passionate about robotics, mechanical design, and building things that move. I love tackling complex engineering challenges and turning ideas into reality through CAD, prototyping, and iteration.',
  avatar: '/avatar.jpg', // Add your photo to public folder
  links: {
    email: 'lcarlin@olin.edu',
    phone: '+1 (555) 123-4567',
    linkedin: 'https://linkedin.com/in/liamcarlin',
    github: 'https://github.com/liamcarlin',
    resume: '/resume.pdf', // Add your resume to public folder
  },
};

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const CategoryIcon = categoryIcons[project.category];
  const gradientClass = categoryColors[project.category];
  const accentClass = categoryAccent[project.category];
  
  // Get thumbnail - use project thumbnail, first image, or placeholder
  const thumbnail = project.thumbnailFile || project.thumbnail || 
    (project.images && project.images.length > 0 ? project.images[0].data : null);
  
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-xl overflow-hidden
        bg-gradient-to-br ${gradientClass} border
        hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10
        transition-all duration-300 ease-out
      `}
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full bg-gray-800 relative overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <CategoryIcon size={48} className={`${accentClass} opacity-50`} />
          </div>
        )}
        
        {/* Category badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm ${accentClass}`}>
          <CategoryIcon size={12} />
          <span className="text-xs font-medium capitalize">{project.category}</span>
        </div>
        
        {/* Year badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm text-gray-300">
          <Calendar size={10} />
          <span className="text-xs">{project.year}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {project.description}
        </p>
        
        {/* Tools */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tools.slice(0, 4).map((tool, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 text-xs rounded bg-gray-800/80 text-gray-400"
            >
              {tool}
            </span>
          ))}
          {project.tools.length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded bg-gray-800/80 text-gray-500">
              +{project.tools.length - 4}
            </span>
          )}
        </div>
        
        {/* View project link */}
        <div className="flex items-center gap-1 text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
          <span>View Project</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </button>
  );
}

interface HomePageProps {
  onSelectProject: (projectId: string) => void;
}

export default function HomePage({ onSelectProject }: HomePageProps) {
  const { projects, theme, setShowHome } = usePortfolioStore();
  const lightMode = theme === 'light';
  
  return (
    <div className={`min-h-screen ${lightMode ? 'bg-gray-100' : 'bg-gray-950'}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${lightMode ? 'bg-white' : 'bg-gray-900'}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className={`w-full h-full rounded-full ${lightMode ? 'bg-gray-100' : 'bg-gray-800'} flex items-center justify-center overflow-hidden`}>
                  {/* Replace with actual avatar */}
                  <span className={`text-5xl md:text-6xl font-bold ${lightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {PROFILE.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-900" title="Available for opportunities" />
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                {PROFILE.name}
              </h1>
              <p className="text-blue-400 font-medium mb-1">{PROFILE.title}</p>
              <p className={`text-sm mb-4 ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>{PROFILE.school}</p>
              <p className={`text-base max-w-xl mb-6 ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                {PROFILE.bio}
              </p>
              
              {/* Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href={`mailto:${PROFILE.links.email}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                >
                  <Mail size={16} />
                  <span>Contact Me</span>
                </a>
                
                <a
                  href={PROFILE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    lightMode 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
                
                <a
                  href={PROFILE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    lightMode 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
                
                <a
                  href={PROFILE.links.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    lightMode 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  <FileText size={16} />
                  <span>Resume</span>
                </a>
              </div>
              
              {/* Additional contact */}
              <div className={`mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <a href={`mailto:${PROFILE.links.email}`} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Mail size={14} />
                  <span>{PROFILE.links.email}</span>
                </a>
                <a href={`tel:${PROFILE.links.phone}`} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                  <Phone size={14} />
                  <span>{PROFILE.links.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About This Portfolio Section */}
      <div className={`border-y ${lightMode ? 'border-gray-200 bg-gray-50' : 'border-gray-800 bg-gray-900/50'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${lightMode ? 'bg-blue-100' : 'bg-blue-500/10'}`}>
                <Package size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-3 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                  About This Portfolio
                </h3>
                <p className={`text-base leading-relaxed mb-4 ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  I built this interactive portfolio to showcase my engineering work in a way that goes beyond traditional resumes and static images. 
                  Each project features fully interactive 3D CAD models that you can explore, rotate, and examine in detail—just like reviewing actual designs in a professional CAD environment.
                </p>
                <p className={`text-base leading-relaxed ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  This portfolio itself is a demonstration of my skills in software development, 3D visualization, and user experience design. 
                  It's built with React, Three.js, and modern web technologies to create a seamless experience for exploring mechanical designs and engineering documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projects Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl font-bold mb-1 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              Featured Projects
            </h2>
            <p className={`${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Click on any project to explore the interactive 3D view
            </p>
          </div>
          <div className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {projects.length} projects
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
        </div>
        
        {projects.length === 0 && (
          <div className={`text-center py-16 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No projects yet. Add some in the admin panel!</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={`border-t ${lightMode ? 'border-gray-200 bg-white' : 'border-gray-800 bg-gray-900'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              © {new Date().getFullYear()} {PROFILE.name}. Built with passion and precision.
            </p>
            <div className="flex items-center gap-4">
              <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" 
                className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}>
                <Github size={18} />
              </a>
              <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer"
                className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}>
                <Linkedin size={18} />
              </a>
              <a href={`mailto:${PROFILE.links.email}`}
                className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}>
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
