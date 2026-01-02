'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  Phone,
  MessageCircle,
  ExternalLink,
  Sun,
  Moon,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

interface TopBarProps {
  className?: string;
}

export default function TopBar({ className }: TopBarProps) {
  const { 
    selectedProjectId, 
    projects, 
    theme, 
    toggleTheme,
    setShowHome,
    selectProject,
    showHome,
    welcomePageData,
  } = usePortfolioStore();
  
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const socialLinks = welcomePageData?.socialLinks || [];
  const socialIconFilter = theme === 'light'
    ? 'grayscale(1) brightness(0.45)'
    : 'grayscale(1) invert(1) brightness(1.1)';

  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github size={16} />;
      case 'linkedin':
        return <Linkedin size={16} />;
      case 'email':
        return <Mail size={16} />;
      case 'twitter':
        return <Twitter size={16} />;
      case 'instagram':
        return <Instagram size={16} />;
      case 'youtube':
        return <Youtube size={16} />;
      case 'website':
        return <Globe size={16} />;
      case 'phone':
        return <Phone size={16} />;
      case 'discord':
        return <MessageCircle size={16} />;
      default:
        return <ExternalLink size={16} />;
    }
  };
  
  const handleGoHome = () => {
    selectProject(null);
    setShowHome(true);
  };
  
  return (
    <div className={`${className} ${
      theme === 'light'
        ? 'bg-white/95 border-gray-200 backdrop-blur-sm'
        : 'bg-gray-900/95 border-gray-800 backdrop-blur-sm'
    } border-b flex flex-col`}>
      {/* Title bar */}
      <div className={`h-12 flex items-center justify-between px-4 ${
        theme === 'light' ? 'bg-gray-50/80' : 'bg-gray-950/80'
      }`}>
        <div className="flex items-center gap-3">
          {/* Home button */}
          <button
            onClick={handleGoHome}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 ${
              theme === 'light'
                ? 'text-gray-600 hover:text-gray-900 bg-gray-200/50 hover:bg-gray-200'
                : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
            title="Back to Home"
          >
            <ArrowLeft size={16} />
            <Home size={16} />
            <span className="text-sm font-medium">Home</span>
          </button>
          
          {/* Divider */}
          <div className={`h-5 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
          
          {/* Project title */}
          <div className={`text-sm font-medium ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-200'
          }`}>
            {showHome ? 'Welcome' : selectedProject ? selectedProject.name : 'No Project Selected'}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Simple Portfolio Link */}
          <Link
            href="/simple"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              theme === 'light'
                ? 'text-gray-500 hover:text-gray-900 bg-gray-200/50 hover:bg-gray-200'
                : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
            title="View simple portfolio"
          >
            <FileText size={14} />
            <span>Simple View</span>
          </Link>
          
          <div className={`h-4 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-200 ${
              theme === 'light'
                ? 'text-gray-500 hover:text-gray-900 bg-gray-200/50 hover:bg-gray-200'
                : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className={`h-4 w-px ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
          
          {/* Social links */}
          {socialLinks.map((link) => {
            const isEmail = link.platform === 'email';
            const href = isEmail ? `mailto:${link.url}` : link.url;
            return (
              <a
                key={link.id}
                href={href}
                target={isEmail ? undefined : '_blank'}
                rel={isEmail ? undefined : 'noopener noreferrer'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  theme === 'light'
                    ? 'text-gray-500 hover:text-gray-900 bg-gray-200/50 hover:bg-gray-200'
                    : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
                title={link.label || link.platform}
              >
                {link.icon ? (
                  <img
                    src={link.icon}
                    alt={link.label || link.platform}
                    className="w-4 h-4 object-contain"
                    style={{ filter: socialIconFilter }}
                  />
                ) : (
                  renderSocialIcon(link.platform)
                )}
              </a>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}
