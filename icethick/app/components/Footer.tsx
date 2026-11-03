'use client';

import Link from 'next/link';

export default function Footer() {
  // Extract to prevent SSR hydration mismatch
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      background: 'var(--primary-dark)',
      color: 'white',
      padding: '2rem 1rem',
      marginTop: '0'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Legal Disclaimer */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.07)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.125rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: '#d8e7f2'
          }}>
            Safety and data limitations
          </h3>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              Reports are community submitted, unverified, and may be outdated. Conditions can vary across a lake and change rapidly.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              Use these observations for context only. Check local guidance and current conditions; do not treat any report as a safety clearance.
            </p>
            <p>
              When in doubt, stay off the ice.
            </p>
          </div>
        </div>

        {/* App Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
               Ice Relay
            </h4>
            <p style={{ fontSize: '0.875rem', opacity: 0.85, lineHeight: '1.6' }}>
              An independent community project. Unverified ice thickness observations across the Upper Midwest.
              Minnesota, Wisconsin, Michigan, Iowa, North Dakota, and South Dakota.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Explore &amp; contribute
            </h4>
            <ul style={{ 
              fontSize: '0.875rem', 
              opacity: 0.85, 
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li><Link href="/?newReport=true" style={{ color: 'white' }}>Share a report</Link></li>
              <li><a href="/contribute/" style={{ color: 'white' }}>Community reporting guide</a></li>
              <li><Link href="/community-ice-reports/" style={{ color: 'white' }}>Self-reported ice conditions</Link></li>
              <li><Link href="/report-poor-ice-conditions/" style={{ color: 'white' }}>Reporting poor ice conditions</Link></li>
              <li><a href="/map/" style={{ color: 'white' }}>Lake report map</a></li>
              <li><a href="/near-me/" style={{ color: 'white' }}>Find your lake</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              About &amp; resources
            </h4>
            <ul style={{ 
              fontSize: '0.875rem', 
              opacity: 0.85,
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li><a href="/safety-guide" style={{ color: 'white', textDecoration: 'none' }}>Safety Guide</a></li>
              <li><a href="/near-me" style={{ color: 'white', textDecoration: 'none' }}>Explore Reports by State</a></li>
              <li><a href="/about" style={{ color: 'white', textDecoration: 'none' }}>About</a></li>
              <li><a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a></li>
              <li><Link href="/resources/" style={{ color: 'white' }}>Ice reporting resources</Link></li>
              <li>
                <a 
                  href="https://github.com/Austtiin/IceRelay/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                   Report an Issue
                </a>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '1.25rem' }}>(GitHub sign-in required)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Policies &amp; transparency</h4>
            <ul style={{ fontSize: '0.875rem', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
              <li><a href="/privacy-policy/" style={{ color: 'white' }}>Privacy policy</a></li>
              <li><a href="/cookie-policy/" style={{ color: 'white' }}>Cookie policy</a></li>
              <li><a href="/terms/" style={{ color: 'white' }}>Terms of use</a></li>
              <li><a href="/acceptable-use/" style={{ color: 'white' }}>Community standards</a></li>
              <li><a href="/disclaimer/" style={{ color: 'white' }}>Data &amp; safety disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Attribution */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '0.875rem',
          opacity: 0.85
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            &copy; {currentYear} Ice Relay. All rights reserved. All information subject to change.
          </p>
          <p>
            Created by AS
            {' | '}
            <a 
              href="https://github.com/Austtiin" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'white',
                fontWeight: 600,
                textDecoration: 'none',
                borderBottom: '1px solid white'
              }}
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
