'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook to detect if the user is on a mobile device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for mobile user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera || '';
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
      
      // Also check screen width for tablets in portrait mode
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(mobileRegex.test(userAgent) || isSmallScreen);
      setIsChecked(true);
    };

    checkMobile();
    
    // Recheck on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isChecked };
}

/**
 * Component that redirects mobile users to the simple portfolio
 * Only redirects from the main page, not from admin or simple pages
 */
export function MobileRedirect({ children }: { children: React.ReactNode }) {
  const { isMobile, isChecked } = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Only redirect from the main page (not admin, not simple)
    if (isChecked && isMobile && pathname === '/') {
      // Check if user explicitly chose to stay on main site
      const preferFull = localStorage.getItem('portfoliocad-prefer-full-site');
      if (!preferFull) {
        router.replace('/simple');
        setShouldRender(false);
      }
    }
  }, [isMobile, isChecked, pathname, router]);

  // Show nothing briefly while checking/redirecting on mobile from main page
  if (!isChecked && pathname === '/') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Redirecting to mobile view...</div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Button component for switching between full and simple versions
 */
export function ViewModeToggle({ variant = 'simple' }: { variant?: 'simple' | 'full' }) {
  const router = useRouter();

  const handleSwitch = () => {
    if (variant === 'simple') {
      // User wants to see full site - remember this choice
      localStorage.setItem('portfoliocad-prefer-full-site', 'true');
      router.push('/');
    } else {
      // Going to simple, remove preference
      localStorage.removeItem('portfoliocad-prefer-full-site');
      router.push('/simple');
    }
  };

  if (variant === 'simple') {
    return (
      <button
        onClick={handleSwitch}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Switch to full site
      </button>
    );
  }

  return (
    <button
      onClick={handleSwitch}
      className="text-sm text-gray-400 hover:text-white transition-colors"
    >
      Switch to simple view
    </button>
  );
}
