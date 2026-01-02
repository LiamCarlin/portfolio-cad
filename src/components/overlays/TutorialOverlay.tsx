'use client';

import React, { useEffect, useMemo } from 'react';
import {
  ChevronRight,
  CheckCircle,
  Circle,
  X,
  Play,
  SkipForward,
} from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

export default function TutorialOverlay() {
  const {
    tutorialActive,
    tutorialSteps,
    currentTutorialStep,
    nextTutorialStep,
    endTutorial,
    completeTutorialStep,
    selectedSubsystemIds,
    explodeAmount,
  } = usePortfolioStore();
  
  const currentStep = tutorialSteps[currentTutorialStep];
  
  // Check if current step condition is met
  useEffect(() => {
    if (!tutorialActive || !currentStep) return;
    
    let conditionMet = false;
    
    switch (currentStep.condition.type) {
      case 'select':
        if (currentStep.condition.value === '') {
          // Auto-advance for intro steps
          setTimeout(() => {
            completeTutorialStep(currentStep.id);
            nextTutorialStep();
          }, 2000);
          return;
        }
        conditionMet = selectedSubsystemIds.includes(currentStep.condition.value);
        break;
      case 'explode':
        conditionMet = explodeAmount >= parseFloat(currentStep.condition.value);
        break;
    }
    
    if (conditionMet && !currentStep.completed) {
      completeTutorialStep(currentStep.id);
      setTimeout(() => nextTutorialStep(), 500);
    }
  }, [
    tutorialActive,
    currentStep,
    selectedSubsystemIds,
    explodeAmount,
    completeTutorialStep,
    nextTutorialStep,
  ]);
  
  if (!tutorialActive || !currentStep) return null;
  
  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1">
          {tutorialSteps.map((step, index) => (
            <div
              key={step.id}
              className={`
                w-8 h-1 rounded-full transition-colors
                ${index < currentTutorialStep
                  ? 'bg-green-500'
                  : index === currentTutorialStep
                  ? 'bg-blue-500'
                  : 'bg-gray-700'
                }
              `}
            />
          ))}
        </div>
      </div>
      
      {/* Tutorial panel */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-4 w-96">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Play size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-white">
                Tutorial Mode
              </span>
              <span className="text-xs text-gray-500">
                Step {currentTutorialStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={endTutorial}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Instruction */}
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-1">
              {currentStep.completed ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <Circle size={20} className="text-blue-500 animate-pulse" />
              )}
            </div>
            <p className="text-gray-200 leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={endTutorial}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Exit Tutorial
            </button>
            <button
              onClick={nextTutorialStep}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              Skip Step
              <SkipForward size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Highlight effect on viewport */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-lg animate-pulse" />
      </div>
    </>
  );
}
