'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
  onNewReport: () => void;
}

export default function Header({ onMenuToggle, onNewReport }: HeaderProps) {
  const [locationEnabled, setLocationEnabled] = useState(false);

  return (
    <header style={{ 
      background: 'white',
      borderBottom: '1px solid #e9ecef',
      padding: '0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      height: '110px'
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 1rem',
        height: '100%'
      }}>
        {/* Logo & Brand */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            height: '100%'
          }}>
            <Image
              src="/IceRelay.png"
              alt="Ice Relay"
              width={140}
              height={39}
              style={{ height: 'auto', width: 'auto', maxHeight: '95px', maxWidth: '350px', objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'none',
          gap: '0.5rem',
          alignItems: 'center'
        }}
        className="desktop-nav">
          <Link href="/" style={{
            padding: '0.25rem 0.75rem',
            color: 'var(--foreground)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9375rem',
            borderRadius: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            Overview
          </Link>
          <Link href="/near-me" style={{
            padding: '0.25rem 0.75rem',
            color: 'var(--foreground)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9375rem',
            borderRadius: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            📍 View Ice Near Me
          </Link>
          <button
            onClick={onNewReport}
            style={{
              background: 'white',
              color: 'var(--primary-dark)',
              border: '2px solid var(--primary-dark)',
              borderRadius: '0.5rem',
              padding: '0.25rem 0.875rem',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              marginLeft: '0.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-dark)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}>
            📝 New Report
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          style={{
            background: 'transparent',
            border: '2px solid #e9ecef',
            color: 'var(--foreground)',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          ☰ Menu
        </button>
      </div>
    </header>
  );
}
