'use client';

import { useState, useEffect } from 'react';
import { initializeAnalytics, hasAnalyticsConsent } from '../lib/analytics';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    if (typeof window !== 'undefined') {
      const hasConsented = localStorage.getItem('ice-relay-analytics-consent');
      if (!hasConsented) {
        setIsVisible(true);
      } else if (hasConsented === 'accepted') {
        // Initialize analytics if previously accepted
        initializeAnalytics();
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ice-relay-analytics-consent', 'accepted');
    setIsVisible(false);
    initializeAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('ice-relay-analytics-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        maxWidth: '600px',
        width: 'calc(100% - 2rem)',
        background: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        animation: 'slideUp 0.3s ease'
      }}
    >
      <div style={{
        fontSize: '0.875rem',
        color: '#495867',
        lineHeight: '1.5'
      }}>
        🍪 We use cookies to improve your experience and analyze site usage. 
        By clicking "Accept", you agree to our use of analytics.
      </div>
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleAccept}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'var(--primary-medium)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-medium)'}
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #dee2e6',
            background: 'white',
            color: '#6c757d',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f8f9fa';
            e.currentTarget.style.borderColor = '#adb5bd';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#dee2e6';
          }}
        >
          Decline
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
