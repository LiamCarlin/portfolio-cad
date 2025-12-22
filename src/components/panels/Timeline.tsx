'use client';

import React, { useMemo } from 'react';
import {
  ChevronUp,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { usePortfolioStore, Milestone } from '@/store/usePortfolioStore';

interface TimelineProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Timeline({ className, style }: TimelineProps) {
  const { projects, selectedProjectId, bottomPanelCollapsed, togglePanel } = usePortfolioStore();
  
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  
  if (bottomPanelCollapsed) {
    return (
      <div className={`${className} h-8 bg-gray-900 border-t border-gray-700 flex items-center px-4 justify-between`} style={style}>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock size={14} />
          <span>Timeline</span>
          {selectedProject && (
            <span className="text-xs text-gray-500">
              • {selectedProject.milestones.length} milestones
            </span>
          )}
        </div>
        <button
          onClick={() => togglePanel('bottom')}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }
  
  return (
    <div className={`${className} bg-gray-900 border-t border-gray-700 flex flex-col`} style={style}>
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-4 border-b border-gray-800">
        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
          <Clock size={14} />
          <span>Feature History / Timeline</span>
        </div>
        <button
          onClick={() => togglePanel('bottom')}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronUp size={14} className="rotate-180" />
        </button>
      </div>
      
      {/* Timeline content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {!selectedProject ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Select a project to view timeline
          </div>
        ) : (
          <div className="h-full p-4">
            {/* Timeline track */}
            <div className="relative flex items-center gap-2">
              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700 -translate-y-1/2" />
              
              {selectedProject.milestones.map((milestone, index) => (
                <MilestoneNode
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  total={selectedProject.milestones.length}
                  isLast={index === selectedProject.milestones.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MilestoneNodeProps {
  milestone: Milestone;
  index: number;
  total: number;
  isLast: boolean;
}

function MilestoneNode({ milestone, index, total, isLast }: MilestoneNodeProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const formattedDate = useMemo(() => {
    const date = new Date(milestone.date);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [milestone.date]);
  
  return (
    <div
      className="relative flex flex-col items-center group"
      style={{ minWidth: '140px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node */}
      <div className="relative z-10">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer
            ${milestone.completed
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400'
            }
            ${isHovered ? 'scale-110 ring-2 ring-blue-500' : ''}
          `}
        >
          {milestone.completed ? (
            <CheckCircle size={20} />
          ) : (
            <Circle size={20} />
          )}
        </div>
        
        {/* Step number */}
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-400 border border-gray-700">
          {index + 1}
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-white">{milestone.name}</div>
        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Calendar size={10} />
          {formattedDate}
        </div>
      </div>
      
      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-800 rounded-lg p-3 shadow-xl border border-gray-700 z-20">
          <div className="text-sm font-medium text-white mb-1">{milestone.name}</div>
          <div className="text-xs text-gray-400">{milestone.description}</div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {milestone.completed ? (
              <span className="text-green-400 flex items-center gap-1">
                <CheckCircle size={12} />
                Completed
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center gap-1">
                <Clock size={12} />
                In Progress
              </span>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800" />
        </div>
      )}
      
      {/* Arrow to next */}
      {!isLast && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 -translate-x-1/2 text-gray-600">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
}
