'use client';

import { useEffect, useState } from 'react';
import { usePortfolioStore, Project, WelcomePageData, ExperienceEntry } from '@/store/usePortfolioStore';
import { sampleProjects } from '@/data/sampleProjects';

/**
 * Hook to load projects from localStorage (admin-created) or fall back to sample data
 * Always loads sample projects, merges with any admin-created projects
 */
export function useProjectsLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const setProjects = usePortfolioStore((state) => state.setProjects);
  const updateWelcomePageData = usePortfolioStore((state) => state.updateWelcomePageData);
  const setExperienceEntries = usePortfolioStore((state) => state.setExperienceEntries);
  const selectProject = usePortfolioStore((state) => state.selectProject);
  const projects = usePortfolioStore((state) => state.projects);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let allProjects: Project[] = [...sampleProjects];

      // Try to load from generated data file first (created via admin save)
      // Use basePath if set (for GitHub Pages deployment)
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      try {
        const res = await fetch(`${basePath}/data/siteData.json`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.projects)) {
            const savedIds = new Set(json.projects.map((p: Project) => p.id));
            const newSampleProjects = sampleProjects.filter(sp => !savedIds.has(sp.id));
            allProjects = [...json.projects, ...newSampleProjects];
          }
          if (json.welcomePageData) {
            updateWelcomePageData(json.welcomePageData as WelcomePageData);
          }
          if (Array.isArray(json.experienceEntries)) {
            setExperienceEntries(json.experienceEntries as ExperienceEntry[]);
          }
        }
      } catch (e) {
        console.warn('Falling back to localStorage/sample projects:', e);
        // If file read fails, attempt localStorage merge
        const savedProjects = localStorage.getItem('portfoliocad-projects');
        if (savedProjects) {
          try {
            const parsed: Project[] = JSON.parse(savedProjects);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const savedIds = new Set(parsed.map(p => p.id));
              const newSampleProjects = sampleProjects.filter(sp => !savedIds.has(sp.id));
              allProjects = [...parsed, ...newSampleProjects];
            }
          } catch (err) {
            console.error('Failed to parse saved projects:', err);
          }
        }
      }

      if (cancelled) return;
      setProjects(allProjects);
      if (allProjects.length > 0) {
        selectProject(allProjects[0].id);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [setProjects, selectProject, updateWelcomePageData]);

  return { isLoading, projects };
}
