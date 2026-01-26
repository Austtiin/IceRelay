'use client';

import Link from 'next/link';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onNewReport: () => void;
}

export default function Navigation({ isOpen, onClose, onNewReport }: NavigationProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Sidebar - Slides from RIGHT */}
      <nav style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '320px',
        maxWidth: '85vw',
        background: 'white',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e9ecef',
          background: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700,
              color: 'var(--primary-dark)'
            }}>
              Menu
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                lineHeight: 1
              }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
          <Link
            href="/"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>🏠</span>
            <span style={{ fontWeight: 500 }}>Overview</span>
          </Link>

          <Link
            href="/near-me"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>📍</span>
            <span style={{ fontWeight: 500 }}>View Ice Near Me</span>
          </Link>

          <Link
            href="/map"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>🗺️</span>
            <span style={{ fontWeight: 500 }}>Map View</span>
          </Link>

          <Link
            href="/safety-guide"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>❄️</span>
            <span style={{ fontWeight: 500 }}>Safety Guide</span>
          </Link>

          <Link
            href="/about"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
            <span style={{ fontWeight: 500 }}>About</span>
          </Link>

          <Link
            href="/contact"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--foreground)',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>📧</span>
            <span style={{ fontWeight: 500 }}>Contact</span>
          </Link>

          <button
            onClick={() => {
              onNewReport();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'white',
              background: 'var(--primary-dark)',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-medium)';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📝</span>
            <span>New Report</span>
          </button>

          <div style={{
            height: '1px',
            background: '#e9ecef',
            margin: '1rem 0'
          }} />

          <a
            href="https://github.com/Austtiin"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📦</span>
            <span>Created by @Austtiin</span>
          </a>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
