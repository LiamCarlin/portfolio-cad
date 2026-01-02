'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  MousePointer2,
  Move3D,
  Maximize,
  Search,
  Play,
  Command,
  ChevronRight,
  ChevronLeft,
  Box,
  Layers,
  Info,
  Sparkles,
  FileText,
} from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

const slides = [
  {
    title: "Welcome to PortfolioCAD",
    subtitle: "A different kind of portfolio",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 leading-relaxed">
          This portfolio is designed to look and feel like professional CAD software 
          (think SolidWorks or Onshape). Instead of scrolling through pages, you'll 
          <span className="text-blue-400 font-medium"> explore projects as 3D assemblies</span>.
        </p>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">
            💡 <strong className="text-white">Why?</strong> Because engineering projects 
            are best understood as systems with interconnected parts — just like in CAD.
          </p>
        </div>
        <Link 
          href="/simple"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-200 hover:text-white transition-all mt-3"
        >
          <FileText size={16} />
          <span>Prefer a simpler view? Click here for the traditional portfolio</span>
        </Link>
      </div>
    ),
  },
  {
    title: "The Interface",
    subtitle: "CAD-style layout",
    icon: Layers,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-blue-400 font-medium mb-1">📂 Left Panel</div>
            <p className="text-gray-400">Assembly Tree — browse projects and their subsystems hierarchically</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-green-400 font-medium mb-1">🎮 Center</div>
            <p className="text-gray-400">3D Viewport — interactive view of the selected project</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-purple-400 font-medium mb-1">📋 Right Panel</div>
            <p className="text-gray-400">Inspector — details, tools, outcomes, and links</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-yellow-400 font-medium mb-1">📅 Bottom</div>
            <p className="text-gray-400">Timeline — project milestones and history</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Navigation",
    subtitle: "How to explore",
    icon: Move3D,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <MousePointer2 size={16} />
            </div>
            <div>
              <div className="text-white font-medium">Click to Select</div>
              <p className="text-sm text-gray-400">Click any part in the 3D view or tree to see its details</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Move3D size={16} />
            </div>
            <div>
              <div className="text-white font-medium">Orbit & Zoom</div>
              <p className="text-sm text-gray-400">Drag to orbit, scroll to zoom, right-click to pan</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
              <Maximize size={16} />
            </div>
            <div>
              <div className="text-white font-medium">Explode View</div>
              <p className="text-sm text-gray-400">Use the slider to separate parts and see the assembly structure</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Pro Tips",
    subtitle: "Get the most out of it",
    icon: Command,
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-white font-medium mb-3">⌨️ Keyboard Shortcuts</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">Ctrl+P</kbd>
              <span className="text-gray-400">Command palette</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">E</kbd>
              <span className="text-gray-400">Explode toggle</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">F</kbd>
              <span className="text-gray-400">Focus selection</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-300">1-5</kbd>
              <span className="text-gray-400">Switch tabs</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-900/30 rounded-lg p-3 border border-blue-800">
          <Play size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-blue-300 font-medium">Try Tutorial Mode</div>
            <p className="text-sm text-blue-400/80">Click the play button in the toolbar for a guided tour of my best work</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('portfoliocad-welcome-dismissed', 'true');
    }
    onClose();
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden">
        {/* Header gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="relative p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <SlideIcon size={32} className="text-white" />
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{slide.title}</h2>
            <p className="text-gray-400">{slide.subtitle}</p>
          </div>

          {/* Slide content */}
          <div className="min-h-[200px]">
            {slide.content}
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-6 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-6 bg-blue-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              Don't show again
            </label>

            <div className="flex items-center gap-2">
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button
                onClick={nextSlide}
                className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full transition-all font-medium shadow-lg shadow-blue-500/20"
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Next
                    <ChevronRight size={16} />
                  </>
                ) : (
                  <>
                    Start Exploring
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage welcome modal state
export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the welcome modal before
    const dismissed = localStorage.getItem('portfoliocad-welcome-dismissed');
    if (!dismissed) {
      // Small delay to let the app render first
      const timer = setTimeout(() => setShowWelcome(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showWelcome,
    closeWelcome: () => setShowWelcome(false),
    openWelcome: () => setShowWelcome(true),
  };
}
