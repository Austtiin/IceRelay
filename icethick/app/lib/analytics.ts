// Google Analytics utility functions
// Tracking ID: G-WBV3R0RG7F

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-WBV3R0RG7F';

// Initialize Google Analytics
export const initializeAnalytics = () => {
  if (typeof window === 'undefined') return;

  // Check if already initialized by looking for the script
  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
  if (existingScript) {
    console.log('[Analytics] Google Analytics already initialized');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Load the gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  script.onload = () => {
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_path: window.location.pathname,
    });
    console.log('[Analytics] Google Analytics initialized successfully');
  };
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
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
  if (typeof window !== 'undefined' && window.gtag) {
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
