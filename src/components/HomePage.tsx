'use client';

import React, { useState, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
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
import { getImageDataUrl } from '@/lib/imageStorage';
import { resolvePublicUrl } from '@/lib/resolvePublicUrl';
import { PROJECT_ICON_MAP } from '@/lib/projectIcons';

const categoryIcons = {
  robotics: Cpu,
  vehicles: Car,
  software: Code,
  research: FlaskConical,
  other: Package,
};

const categoryAccent = {
  robotics: 'text-green-400',
  vehicles: 'text-blue-400',
  software: 'text-purple-400',
  research: 'text-yellow-400',
  other: 'text-gray-400',
};

// Profile configuration is now in the store - edit via admin panel
// See WelcomePageEditor component for editing

function ProjectCard({ project, onClick, lightMode }: { project: Project; onClick: () => void; lightMode: boolean }) {
  const CategoryIcon = categoryIcons[project.category];
  const accentClass = categoryAccent[project.category];
  const ProjectIcon = project.iconKey ? PROJECT_ICON_MAP[project.iconKey] : null;
  
  // Get thumbnail - use project thumbnail, first image, or placeholder
  const baseResolvedThumb = resolvePublicUrl(project.thumbnail);
  const thumbnail = project.thumbnailFile || baseResolvedThumb || 
    (project.images && project.images.length > 0 ? project.images[0].data : null);
  
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-xl overflow-hidden h-full flex flex-col
        ${lightMode 
          ? 'bg-white border border-gray-300 hover:shadow-lg hover:border-gray-400' 
          : 'bg-gray-900 border border-gray-700 hover:shadow-xl hover:border-gray-600'
        }
        hover:scale-[1.02]
        transition-all duration-300 ease-out
      `}
    >
      {/* Thumbnail */}
      <div className={`relative aspect-video min-h-[180px] w-full overflow-hidden ${lightMode ? 'bg-gray-200' : 'bg-gray-800'}`}>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${lightMode ? 'bg-gradient-to-br from-gray-200 to-gray-300' : 'bg-gradient-to-br from-gray-800 to-gray-900'}`}>
            <CategoryIcon size={48} className={`${accentClass} opacity-50`} />
          </div>
        )}
        
        {/* Category badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm ${lightMode ? 'bg-white/90 text-gray-900' : `bg-gray-900/80 ${accentClass}`}`}>
          {ProjectIcon ? <ProjectIcon size={12} /> : <CategoryIcon size={12} />}
          <span className="text-xs font-medium capitalize">{project.category}</span>
        </div>
        
        {/* Year badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm ${lightMode ? 'bg-white/90 text-gray-900' : 'bg-gray-900/80 text-gray-300'}`}>
          <Calendar size={10} />
          <span className="text-xs">{project.year}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`text-lg font-semibold mb-2 transition-colors ${lightMode ? 'text-gray-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'}`}>
          {project.name}
        </h3>
        <p
          className={`text-sm mb-3 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>
        
        {/* Tools */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tools.slice(0, 4).map((tool, i) => (
            <span 
              key={i}
              className={`px-2 py-0.5 text-xs rounded ${lightMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-800/80 text-gray-400'}`}
            >
              {tool}
            </span>
          ))}
          {project.tools.length > 4 && (
            <span className={`px-2 py-0.5 text-xs rounded ${lightMode ? 'bg-gray-200 text-gray-600' : 'bg-gray-800/80 text-gray-500'}`}>
              +{project.tools.length - 4}
            </span>
          )}
        </div>
        
        {/* View project link */}
        <div className={`mt-auto flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all ${lightMode ? 'text-blue-600' : 'text-blue-400'}`}>
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
  const { projects, theme, welcomePageData } = usePortfolioStore();
  const [bannerImageData, setBannerImageData] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  
  // Wait for hydration to complete before rendering theme-dependent styles
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Always use dark mode until hydration completes to prevent flash
  const lightMode = isHydrated ? theme === 'light' : false;
  const heroIconFilter = (!lightMode || bannerImageData) ? 'invert(1) brightness(1.8)' : 'none';
  
  // Load banner image: prefer exported URL, fall back to IndexedDB
  useEffect(() => {
    const load = async () => {
      if (welcomePageData.bannerImageUrl) {
        const url = resolvePublicUrl(welcomePageData.bannerImageUrl) || null;
        setBannerImageData(url);
        setIsLoadingBanner(false);
        return;
      }
      if (welcomePageData.bannerImageId) {
        setIsLoadingBanner(true);
        try {
          const dataUrl = await getImageDataUrl(welcomePageData.bannerImageId);
          setBannerImageData(dataUrl);
        } catch (err) {
          console.error('Failed to load banner image:', err);
          setBannerImageData(null);
        } finally {
          setIsLoadingBanner(false);
        }
      } else {
        setBannerImageData(null);
      }
    };
    load();
  }, [welcomePageData.bannerImageId, welcomePageData.bannerImageUrl]);
  
  return (
    <>
    <div className={`min-h-screen ${lightMode ? 'bg-gray-100' : 'bg-gray-950'}`}>
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${lightMode ? 'bg-white' : 'bg-gray-900'}`}>
        {/* Banner Image */}
        {bannerImageData && !isLoadingBanner && (
          <div className="absolute inset-0">
            <img 
              src={bannerImageData} 
              alt="Banner"
              className="w-full h-full object-cover"
            />
            {/* Darkness overlay */}
            <div 
              className="absolute inset-0 bg-black transition-opacity"
              style={{ opacity: (welcomePageData.bannerDarkness ?? 30) / 100 }}
            />
          </div>
        )}
        
        {/* Background pattern (if no banner) */}
        {!bannerImageData && !isLoadingBanner && (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        )}
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full ${lightMode ? 'bg-gray-200' : 'bg-gray-800'} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                {welcomePageData.profileImageUrl ? (
                  <img 
                    src={resolvePublicUrl(welcomePageData.profileImageUrl) || welcomePageData.profileImageUrl}
                    alt={welcomePageData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className={`text-5xl md:text-6xl font-bold ${lightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {welcomePageData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              {/* Status indicator */}
              <div className={`absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 ${lightMode ? 'border-gray-100' : 'border-gray-900'}`} title="Available for opportunities" />
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                {welcomePageData.name}
              </h1>
              <p className="text-blue-200 font-medium mb-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{welcomePageData.title}</p>
              <p className="text-gray-100 text-sm mb-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{welcomePageData.school}</p>
              <p className="text-gray-50 text-base max-w-xl mb-6" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                {welcomePageData.bio}
              </p>

              {/* Experience CTA */}
              <div className="mt-2 mb-6">
                <button
                  onClick={() => setShowExperience(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-md transition-colors"
                >
                  <span>View Experience</span>
                  <ChevronRight size={14} />
                </button>
              </div>
              
              {/* Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {welcomePageData.socialLinks.map((link) => {
                  if (link.platform === 'email') {
                    return (
                      <a
                        key={link.id}
                        href={`mailto:${link.url}`}
                        className="flex flex-col items-center gap-2 group"
                        title={link.label || link.platform}
                      >
                        {link.icon ? (
                          <img 
                            src={link.icon} 
                            alt={link.label || link.platform}
                            className="w-12 h-12 rounded-lg object-cover hover:shadow-lg transition-all"
                            style={{ filter: heroIconFilter }}
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                            lightMode 
                              ? 'bg-gray-200 text-gray-700' 
                              : 'bg-gray-700 text-gray-200'
                          }`}>
                            ✉️
                          </div>
                        )}
                        <span className="sr-only">
                          {link.label || 'Email'}
                        </span>
                      </a>
                    );
                  }
                  
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                      title={link.label || link.platform}
                    >
                      {link.icon ? (
                        <img 
                          src={link.icon} 
                          alt={link.label || link.platform}
                          className="w-12 h-12 rounded-lg object-cover hover:shadow-lg transition-all"
                          style={{ filter: heroIconFilter }}
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                          lightMode 
                            ? 'bg-gray-200 text-gray-700 group-hover:bg-gray-300' 
                            : 'bg-gray-700 text-gray-200 group-hover:bg-gray-600'
                        }`}>
                          {link.platform === 'linkedin' && <Linkedin size={18} />}
                          {link.platform === 'github' && <Github size={18} />}
                          {link.platform === 'twitter' && '𝕏'}
                          {link.platform === 'discord' && '💬'}
                          {link.platform === 'instagram' && '📷'}
                          {link.platform === 'youtube' && '▶️'}
                          {link.platform === 'website' && <ExternalLink size={18} />}
                          {link.platform === 'phone' && <Phone size={18} />}
                        </div>
                      )}
                      <span className="sr-only">
                        {link.label || link.platform}
                      </span>
                    </a>
                  );
                })}
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
                  {welcomePageData.aboutTitle}
                </h3>
                <p className={`text-base leading-relaxed ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  {welcomePageData.aboutContent}
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
              lightMode={lightMode}
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
              © {new Date().getFullYear()} {welcomePageData.name}. Built with passion and precision.
            </p>
            <div className="flex items-center gap-4">
              {welcomePageData.socialLinks.map((link) => {
                // Build link href
                let href = link.url;
                if (link.platform === 'email') {
                  href = `mailto:${link.url}`;
                }

                // If no icon, only show standard platforms
                if (!link.icon) {
                  if (link.platform === 'email') {
                    return (
                      <a key={link.id} href={href}
                        className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                        title={link.label || 'Email'}>
                        <Mail size={18} />
                      </a>
                    );
                  }
                  if (link.platform === 'github') {
                    return (
                      <a key={link.id} href={href} target="_blank" rel="noopener noreferrer"
                        className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                        title={link.label || 'GitHub'}>
                        <Github size={18} />
                      </a>
                    );
                  }
                  if (link.platform === 'linkedin') {
                    return (
                      <a key={link.id} href={href} target="_blank" rel="noopener noreferrer"
                        className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                        title={link.label || 'LinkedIn'}>
                        <Linkedin size={18} />
                      </a>
                    );
                  }
                  return null;
                }

                // Display links with icons
                return (
                  <a key={link.id} href={href} target={link.platform === 'email' ? undefined : '_blank'} rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                    className={`${lightMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                    title={link.label || link.platform}>
                    <img 
                      src={link.icon} 
                      alt={link.label || link.platform}
                      className="w-6 h-6 rounded object-cover"
                      style={{ filter: lightMode ? 'none' : 'invert(1) brightness(1.8)' }}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Experience Modal */}
    {showExperience && (
      (() => {
        const ExperienceModal = require('@/components/overlays/ExperienceModal').default;
        return <ExperienceModal onClose={() => setShowExperience(false)} />;
      })()
    )}
  </>
  );
}
