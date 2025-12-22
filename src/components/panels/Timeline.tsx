'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  const { projects, selectedProjectId, bottomPanelCollapsed, togglePanel, theme } = usePortfolioStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  
  const lightMode = theme === 'light';

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePanel('bottom');
  };
  
  const expandedHeight = 140;
  const collapsedHeight = 32;
  
  return (
    <div 
      ref={containerRef}
      className={`${className} ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-t flex flex-col overflow-hidden`}
      style={{ 
        height: `${bottomPanelCollapsed ? collapsedHeight : expandedHeight}px`,
        minHeight: `${bottomPanelCollapsed ? collapsedHeight : expandedHeight}px`,
        flexBasis: `${bottomPanelCollapsed ? collapsedHeight : expandedHeight}px`,
        flexShrink: 0,
        flexGrow: 0,
      }}
    >
      {/* Header - always visible */}
      <div className={`h-8 min-h-[32px] flex items-center justify-between px-4 ${lightMode ? 'border-gray-200' : 'border-gray-800'} ${!bottomPanelCollapsed ? 'border-b' : ''} flex-shrink-0`}>
        <div className={`flex items-center gap-2 text-sm ${bottomPanelCollapsed ? '' : 'font-medium'} ${lightMode ? (bottomPanelCollapsed ? 'text-gray-600' : 'text-gray-700') : (bottomPanelCollapsed ? 'text-gray-400' : 'text-gray-300')}`}>
          <Clock size={14} />
          <span>{bottomPanelCollapsed ? 'Timeline' : 'Feature History / Timeline'}</span>
          {bottomPanelCollapsed && selectedProject && (
            <span className={`text-xs ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              • {selectedProject.milestones.length} milestones
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`p-2 rounded transition-colors cursor-pointer z-10 ${lightMode ? 'text-gray-400 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          type="button"
        >
          <ChevronUp size={14} className={bottomPanelCollapsed ? '' : 'rotate-180'} />
        </button>
      </div>
      
      {/* Timeline content - only show when not collapsed */}
      {!bottomPanelCollapsed && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative">
          {!selectedProject ? (
            <div className={`h-full flex items-center justify-center text-sm ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Select a project to view timeline
            </div>
          ) : (
            <div className="px-4 h-full flex items-center">
              {/* Timeline track */}
              <div className="relative flex items-center gap-2 w-full">
                {/* Connection line */}
                <div className={`absolute top-1/2 left-0 right-0 h-0.5 ${lightMode ? 'bg-gray-300' : 'bg-gray-700'} -translate-y-1/2`} />
                
                {selectedProject.milestones.map((milestone, index) => (
                  <MilestoneNode
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                    total={selectedProject.milestones.length}
                    isLast={index === selectedProject.milestones.length - 1}
                    containerRef={containerRef}
                    lightMode={lightMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MilestoneNodeProps {
  milestone: Milestone;
  index: number;
  total: number;
  isLast: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  lightMode: boolean;
}

interface TooltipStyle {
  left: number;
  bottom: number;
  width: number;
}

function MilestoneNode({ milestone, index, total, isLast, containerRef, lightMode }: MilestoneNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle | null>(null);
  const [tooltipWidth, setTooltipWidth] = useState(224); // Start with default w-56
  
  const formattedDate = useMemo(() => {
    const date = new Date(milestone.date);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [milestone.date]);
  
  // Calculate tooltip position and size when hovering
  useEffect(() => {
    if (isHovered && nodeRef.current && containerRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Available space above the node (from container top to node top)
      const availableHeight = nodeRect.top - containerRect.top - 20; // 20px margin
      
      // Calculate ideal tooltip width based on content length
      const textLength = milestone.name.length + milestone.description.length;
      let idealWidth = 224; // Default w-56
      
      // If content is long and we're height-constrained, expand width
      if (textLength > 100 && availableHeight < 120) {
        idealWidth = Math.min(400, 224 + (textLength - 100) * 1.5);
      } else if (textLength > 200) {
        idealWidth = Math.min(350, 224 + (textLength - 200));
      }
      
      // Calculate horizontal position
      const nodeCenter = nodeRect.left + nodeRect.width / 2;
      let tooltipLeft = nodeCenter - idealWidth / 2;
      
      // Ensure tooltip stays within container bounds
      const minLeft = containerRect.left + 8;
      const maxRight = containerRect.right - 8;
      
      if (tooltipLeft < minLeft) {
        tooltipLeft = minLeft;
      } else if (tooltipLeft + idealWidth > maxRight) {
        tooltipLeft = maxRight - idealWidth;
        // If still too wide, shrink to fit
        if (tooltipLeft < minLeft) {
          tooltipLeft = minLeft;
          idealWidth = maxRight - minLeft;
        }
      }
      
      setTooltipWidth(idealWidth);
      setTooltipStyle({
        left: tooltipLeft,
        bottom: window.innerHeight - nodeRect.top + 12, // Position above node
        width: idealWidth,
      });
    } else {
      setTooltipStyle(null);
    }
  }, [isHovered, containerRef, milestone.name.length, milestone.description.length]);
  
  return (
    <div
      ref={nodeRef}
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
              : lightMode ? 'bg-gray-300 text-gray-600' : 'bg-gray-700 text-gray-400'
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
        <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs border ${lightMode ? 'bg-white text-gray-600 border-gray-300' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
          {index + 1}
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-2 text-center">
        <div className={`text-xs font-medium ${lightMode ? 'text-gray-900' : 'text-white'}`}>{milestone.name}</div>
        <div className={`text-xs flex items-center justify-center gap-1 ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <Calendar size={10} />
          {formattedDate}
        </div>
      </div>
      
      {/* Tooltip on hover - using fixed positioning to escape container */}
      {isHovered && tooltipStyle && (
        <div 
          className={`fixed ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} rounded-lg p-4 shadow-2xl border z-[100] pointer-events-none`}
          style={{
            left: `${tooltipStyle.left}px`,
            bottom: `${tooltipStyle.bottom}px`,
            width: `${tooltipStyle.width}px`,
          }}
        >
          <div className={`text-sm font-semibold mb-2 ${lightMode ? 'text-gray-900' : 'text-white'}`}>{milestone.name}</div>
          <div className={`text-xs leading-relaxed ${lightMode ? 'text-gray-600' : 'text-gray-300'}`}>{milestone.description}</div>
          <div className="mt-3 flex items-center gap-1 text-xs">
            {milestone.completed ? (
              <span className="text-green-500 flex items-center gap-1 font-medium">
                <CheckCircle size={12} />
                Completed
              </span>
            ) : (
              <span className="text-yellow-500 flex items-center gap-1 font-medium">
                <Clock size={12} />
                In Progress
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Arrow to next */}
      {!isLast && (
        <div className={`absolute left-full top-1/2 -translate-y-1/2 -translate-x-1/2 ${lightMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
}
