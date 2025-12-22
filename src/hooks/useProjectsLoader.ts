'use client';

import { useEffect, useState } from 'react';
import { usePortfolioStore, Project } from '@/store/usePortfolioStore';
import { sampleProjects } from '@/data/sampleProjects';

/**
 * Hook to load projects from localStorage (admin-created) or fall back to sample data
 * Priority: Admin projects > Sample projects
 */
export function useProjectsLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const setProjects = usePortfolioStore((state) => state.setProjects);
  const selectProject = usePortfolioStore((state) => state.selectProject);
  const projects = usePortfolioStore((state) => state.projects);

  useEffect(() => {
    // Check localStorage for admin-created projects
    const savedProjects = localStorage.getItem('portfoliocad-projects');
    
    if (savedProjects) {
      try {
        const parsed: Project[] = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Use admin projects
          setProjects(parsed);
          selectProject(parsed[0].id);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved projects:', e);
      }
    }
    
    // Fall back to sample projects
    setProjects(sampleProjects);
    if (sampleProjects.length > 0) {
      selectProject(sampleProjects[0].id);
    }
    setIsLoading(false);
  }, [setProjects, selectProject]);

  return { isLoading, projects };
}
