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
  Sun,
  Moon,
} from 'lucide-react';
import { usePortfolioStore, Project } from '@/store/usePortfolioStore';
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

// Modern Scroll Progress Indicator Component
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
  const { projects, welcomePageData, theme, toggleTheme, hasHydrated, setHasHydrated } = usePortfolioStore();
  const { isLoading } = useProjectsLoader();
  const [bannerImageData, setBannerImageData] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const lightMode = theme === 'light';
  const bannerDarkness = (welcomePageData.bannerDarkness ?? 60) / 100;

  // Fallback: if persist didn't mark hydration (e.g., empty storage), mark after brief delay
  useEffect(() => {
    if (hasHydrated) return;
    const timer = setTimeout(() => setHasHydrated(true), 150);
    return () => clearTimeout(timer);
  }, [hasHydrated, setHasHydrated]);
  
  // Scroll tracking for section indicator
  useEffect(() => {
    const sections = ['hero', 'about', 'projects'];
    const container = containerRef.current;
    
    if (!container || !hasHydrated) return;
    
    const handleScroll = () => {
      const scrollPosition = container.scrollTop + container.clientHeight / 3;
      
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
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check with a slight delay
    const timer = setTimeout(handleScroll, 100);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [hasHydrated]); // Re-run when hasHydrated changes and on mount/unmount
  
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
  
  return (
    <>
    <div ref={containerRef} className={`min-h-screen h-screen overflow-y-auto scroll-smooth ${lightMode ? 'bg-gray-50' : 'bg-gray-950'}`} suppressHydrationWarning>
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
        {bannerImageData && !isLoadingBanner && (
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
        
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20">
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
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    lightMode
                      ? 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
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
      
      {/* About This Portfolio Section */}
      <section id="about" className={`border-y scroll-mt-8 ${
        lightMode
          ? 'border-gray-200 bg-gray-100/50'
          : 'border-gray-800 bg-gray-900/50'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border ${
                lightMode
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/20'
              }`}>
                <Package size={24} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-3 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
                  {welcomePageData.aboutTitle}
                </h3>
                <p className={`text-base leading-relaxed ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
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
            <h2 className={`text-2xl font-bold mb-1 ${lightMode ? 'text-gray-900' : 'text-white'}`}>
              Featured Projects
            </h2>
            <p className={lightMode ? 'text-gray-600' : 'text-gray-400'}>
              Click on any project to explore the interactive 3D view
            </p>
          </div>
          <div className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
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
          <div className={`text-center py-16 ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No projects yet. Add some in the admin panel!</p>
          </div>
        )}
      </section>
      
      {/* Footer */}
      <footer className={`border-t ${
        lightMode
          ? 'border-gray-200 bg-gray-100/50'
          : 'border-gray-800 bg-gray-900/50'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${lightMode ? 'text-gray-600' : 'text-gray-500'}`}>
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
                    className={`transition-colors ${lightMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-500 hover:text-gray-300'}`}
                    title={link.label || link.platform}
                  >
                    {link.icon ? (
                      <img 
                        src={link.icon}
                        alt={link.label || link.platform}
                        className="w-5 h-5 object-contain"
                        style={{ filter: lightMode ? 'grayscale(1) brightness(0.4)' : 'invert(1) brightness(0.6)' }}
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
