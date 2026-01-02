import { useEffect, useState } from 'react';

/**
 * Hook to detect when Zustand store has been hydrated from localStorage
 * Prevents hydration mismatches by ensuring components don't render
 * theme-dependent styles until the persisted theme has been loaded
 */
export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to allow Zustand persist middleware to complete hydration
    // This ensures the theme from localStorage is loaded before component renders theme-specific styles
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}
