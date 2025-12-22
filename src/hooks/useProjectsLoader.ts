'use client';

import { useEffect, useState } from 'react';
import { usePortfolioStore, Project } from '@/store/usePortfolioStore';
import { sampleProjects } from '@/data/sampleProjects';

/**
 * Hook to load projects from localStorage (admin-created) or fall back to sample data
 * Always loads sample projects, merges with any admin-created projects
 */
export function useProjectsLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const setProjects = usePortfolioStore((state) => state.setProjects);
  const selectProject = usePortfolioStore((state) => state.selectProject);
  const projects = usePortfolioStore((state) => state.projects);

  useEffect(() => {
    // Always start with sample projects
    let allProjects: Project[] = [...sampleProjects];
    
    // Check localStorage for admin-created projects
    const savedProjects = localStorage.getItem('portfoliocad-projects');
    
    if (savedProjects) {
      try {
        const parsed: Project[] = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge: use saved projects, but add any sample projects not in saved
          const savedIds = new Set(parsed.map(p => p.id));
          const newSampleProjects = sampleProjects.filter(sp => !savedIds.has(sp.id));
          allProjects = [...parsed, ...newSampleProjects];
        }
      } catch (e) {
        console.error('Failed to parse saved projects:', e);
      }
    }
    
    // Set all projects
    setProjects(allProjects);
    if (allProjects.length > 0) {
      selectProject(allProjects[0].id);
    }
    setIsLoading(false);
  }, [setProjects, selectProject]);

  return { isLoading, projects };
}
