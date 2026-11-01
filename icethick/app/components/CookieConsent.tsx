'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { initializeAnalytics } from '../lib/analytics';
import Link from 'next/link';

const CONSENT_STORAGE_KEY = 'ice-relay-analytics-consent';
const CONSENT_CHANGE_EVENT = 'ice-relay-analytics-consent-change';

type AnalyticsConsent = 'unanswered' | 'accepted' | 'declined';

const getConsentSnapshot = (): AnalyticsConsent => {
  const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
  return consent === 'accepted' || consent === 'declined' ? consent : 'unanswered';
};

const getServerConsentSnapshot = (): AnalyticsConsent => 'unanswered';

const subscribeToConsent = (onStoreChange: () => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === null || event.key === CONSENT_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  };
};

export default function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );

  useEffect(() => {
    if (consent === 'accepted') {
      initializeAnalytics();
    }
  }, [consent]);

  const saveConsent = (value: Exclude<AnalyticsConsent, 'unanswered'>) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  };

  const handleAccept = () => {
    saveConsent('accepted');
  };

  const handleDecline = () => {
    saveConsent('declined');
  };

  if (consent !== 'unanswered') return null;

  return (
    <div
      role="region"
      aria-label="Privacy and analytics choices"
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
        Essential storage remembers your privacy choice. Choose &quot;Accept all&quot;
        to also allow Google Analytics and Microsoft Clarity, if configured, or
        &quot;Essential only&quot; to keep optional analytics off.
        {' '}By using Ice Relay, you agree to our{' '}
        <Link href="/terms/" style={{ textDecoration: 'underline' }}>Terms of Use</Link>.
        {' '}Read our{' '}
        <Link href="/privacy-policy/" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>
        {' '}and{' '}
        <Link href="/cookie-policy/" style={{ textDecoration: 'underline' }}>Cookie Policy</Link>
        {' '}for details.
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
          Accept all
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
          Essential only
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
