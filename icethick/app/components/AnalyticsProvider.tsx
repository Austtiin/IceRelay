'use client';

import { useEffect } from 'react';
import { initializeIfConsented, trackPageView } from '../lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics if user previously consented
    initializeIfConsented();
    
    // Track initial page view
    trackPageView(window.location.pathname);
  }, []);

  return <>{children}</>;
}
