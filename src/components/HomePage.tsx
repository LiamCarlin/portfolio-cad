'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  FileText,
  MapPin,
  LucideIcon,
} from 'lucide-react';
import { usePortfolioStore, Project } from '@/store/usePortfolioStore';
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

// Scroll Dot Indicator Component
function ScrollDotIndicator({ activeSection }: { activeSection: string }) {
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
  ];
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const activeIndex = sections.findIndex(s => s.id === activeSection);
  
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center">
      {/* Glass background pill */}
      <div className="absolute inset-y-[-12px] -inset-x-2.5 bg-gray-900/60 backdrop-blur-md rounded-full border border-white/10" />
      
      <div className="relative flex flex-col items-center gap-6 py-3">
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;
          const isPast = index < activeIndex;
          
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="group relative flex items-center"
              aria-label={`Go to ${section.label}`}
            >
              {/* Label tooltip - appears on hover */}
              <div className="absolute left-8 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none bg-gray-900/95 backdrop-blur-sm text-white border border-white/10 shadow-xl">
                {section.label}
              </div>
              
              {/* Dot */}
              <div className={`
                w-2.5 h-2.5 rounded-full transition-all duration-500 ease-out
                ${isActive 
                  ? 'bg-white scale-125 shadow-lg shadow-white/40' 
                  : isPast 
                    ? 'bg-white/60 scale-100' 
                    : 'bg-gray-600 scale-100 group-hover:bg-gray-400'
                }
              `} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Project card - grid style matching SimplePortfolio
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

interface HomePageProps {
  onSelectProject: (projectId: string) => void;
}

export default function HomePage({ onSelectProject }: HomePageProps) {
  const { projects, welcomePageData } = usePortfolioStore();
  const [bannerImageData, setBannerImageData] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // Wait for hydration to complete before rendering theme-dependent styles
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Scroll tracking for section indicator
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'projects'];
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
  
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
    <div className="min-h-screen bg-gray-950 scroll-smooth">
      {/* Scroll Dot Indicator */}
      <ScrollDotIndicator activeSection={activeSection} />
      
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Banner image overlay if exists */}
        {bannerImageData && !isLoadingBanner && (
          <div className="absolute inset-0">
            <img src={bannerImageData} alt="Banner" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950" />
          </div>
        )}
        
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
          {/* Profile section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/10">
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
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-950" title="Available" />
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {welcomePageData.name}
              </h1>
              <p className="text-xl text-blue-400 font-medium mb-2">{welcomePageData.title}</p>
              
              {/* Location & School */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 mb-4">
                {welcomePageData.school && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {welcomePageData.school}
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 max-w-xl mb-6 leading-relaxed">
                {welcomePageData.bio}
              </p>
              
              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <button
                  onClick={() => setShowExperience(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium transition-colors"
                >
                  <span>View Experience</span>
                  <ChevronRight size={16} />
                </button>
                <Link
                  href="/simple"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
                >
                  <FileText size={16} />
                  <span>Simple View</span>
                </Link>
              </div>
              
              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {welcomePageData.socialLinks.map((link) => {
                  const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;
                  return (
                    <a
                      key={link.id}
                      href={href}
                      target={link.platform === 'email' ? undefined : '_blank'}
                      rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                      title={link.label || link.platform}
                    >
                      {link.icon ? (
                        <img 
                          src={link.icon}
                          alt={link.label || link.platform}
                          className="w-5 h-5 object-contain"
                          style={{ filter: 'invert(1) brightness(0.8)' }}
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
      
      {/* About This Portfolio Section */}
      <section id="about" className="border-y border-gray-800 bg-gray-900/50 scroll-mt-8">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                <Package size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 text-white">
                  {welcomePageData.aboutTitle}
                </h3>
                <p className="text-base leading-relaxed text-gray-300">
                  {welcomePageData.aboutContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-12 scroll-mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-white">
              Featured Projects
            </h2>
            <p className="text-gray-400">
              Click on any project to explore the interactive 3D view
            </p>
          </div>
          <div className="text-sm text-gray-400">
            {projects.length} projects
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
        </div>
        
        {projects.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No projects yet. Add some in the admin panel!</p>
          </div>
        )}
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {welcomePageData.name}. Built with passion and precision.
            </p>
            <div className="flex items-center gap-3">
              {welcomePageData.socialLinks.map((link) => {
                const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;
                return (
                  <a
                    key={link.id}
                    href={href}
                    target={link.platform === 'email' ? undefined : '_blank'}
                    rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    title={link.label || link.platform}
                  >
                    {link.icon ? (
                      <img 
                        src={link.icon}
                        alt={link.label || link.platform}
                        className="w-5 h-5 object-contain"
                        style={{ filter: 'invert(1) brightness(0.6)' }}
                      />
                    ) : (
                      <>
                        {link.platform === 'email' && <Mail size={18} />}
                        {link.platform === 'linkedin' && <Linkedin size={18} />}
                        {link.platform === 'github' && <Github size={18} />}
                        {link.platform === 'phone' && <Phone size={18} />}
                      </>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
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
