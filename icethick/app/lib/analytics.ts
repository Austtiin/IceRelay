// Google Analytics utility functions
type AnalyticsValue = string | number | Date | Record<string, unknown>;
type ClarityFunction = ((...args: AnalyticsValue[]) => void) & { q?: AnalyticsValue[][] };

declare global {
  interface Window {
    dataLayer: AnalyticsValue[][];
    gtag: (...args: AnalyticsValue[]) => void;
    clarity?: ClarityFunction;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

const initializeGoogleAnalytics = () => {
  if (!GA_TRACKING_ID) return;
  if (typeof window === 'undefined') return;

  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
  if (existingScript) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  script.onload = () => {
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_path: window.location.pathname,
    });
  };
};

const initializeClarity = () => {
  if (!CLARITY_PROJECT_ID || typeof window === 'undefined') return;

  const existingScript = document.querySelector('script[data-clarity-project]');
  if (existingScript) return;

  if (!window.clarity) {
    const clarity: ClarityFunction = (...args) => {
      clarity.q?.push(args);
    };
    clarity.q = [];
    window.clarity = clarity;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_PROJECT_ID)}`;
  script.dataset.clarityProject = CLARITY_PROJECT_ID;
  document.head.appendChild(script);
};

// Analytics scripts are initialized only after the visitor grants consent.
export const initializeAnalytics = () => {
  initializeGoogleAnalytics();
  initializeClarity();
};

// Track page views
export const trackPageView = (url: string) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
    console.log('[Analytics] Page view tracked:', url);
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('[Analytics] Event tracked:', { action, category, label, value });
  }
};

// Track report submission
export const trackReportSubmission = (lakeName: string, thickness: number) => {
  trackEvent('submit_report', 'Reports', lakeName, thickness);
};

// Track lake search
export const trackLakeSearch = (searchTerm: string) => {
  trackEvent('search_lake', 'Search', searchTerm);
};

// Track location usage
export const trackLocationUsage = () => {
  trackEvent('use_location', 'Location', 'GPS');
};

// Check if user has consented to analytics
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ice-relay-analytics-consent') === 'accepted';
};

// Initialize analytics if consent was previously given
export const initializeIfConsented = () => {
  if (hasAnalyticsConsent()) {
    initializeAnalytics();
  }
};
