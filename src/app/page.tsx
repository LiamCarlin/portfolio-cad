'use client';

import CADLayout from '@/components/CADLayout';
import { MobileRedirect } from '@/hooks/useMobileDetection';

export default function Home() {
  return (
    <MobileRedirect>
      <CADLayout />
    </MobileRedirect>
  );
}
