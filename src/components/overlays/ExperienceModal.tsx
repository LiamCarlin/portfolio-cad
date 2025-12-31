'use client';

import React from 'react';
import { X, Briefcase } from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

// Reuse the ExperienceView content renderer from ContentViews
const { ExperienceView } = require('@/components/viewport/ContentViews');

interface ExperienceModalProps {
  onClose: () => void;
}

export default function ExperienceModal({ onClose }: ExperienceModalProps) {
  const { theme } = usePortfolioStore();
  const lightMode = theme === 'light';
  
  // Close on Escape key
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className={`relative w-full max-w-4xl ${lightMode ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-700'} rounded-2xl shadow-2xl border overflow-hidden`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${lightMode ? 'border-gray-200' : 'border-gray-700'}`}>
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-blue-500" />
            <span className={`${lightMode ? 'text-gray-900' : 'text-white'} font-semibold text-sm`}>Experience</span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${lightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 52px)' }}>
          <ExperienceView lightMode={lightMode} />
        </div>
      </div>
    </div>
  );
}
