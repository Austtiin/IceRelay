'use client';

export default function Footer() {
  // Extract to prevent SSR hydration mismatch
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      background: 'var(--primary-dark)',
      color: 'white',
      padding: '2rem 1rem',
      marginTop: '4rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Legal Disclaimer */}
        <div style={{
          background: 'rgba(254, 95, 85, 0.15)',
          border: '2px solid var(--accent-danger)',
          borderRadius: '0.75rem',
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
            color: 'var(--accent-danger)'
          }}>
            ⚠️ IMPORTANT LEGAL DISCLAIMER
          </h3>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>All information is subject to change.</strong> Ice thickness data is crowd-sourced, 
              estimated, and may not be accurate or current. Ice conditions can vary significantly across 
              a lake and can change rapidly due to weather conditions.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Always verify ice safety personally before venturing out.</strong> This application 
              is provided for informational purposes only. The creators, contributors, and maintainers 
              assume NO liability for any injuries, damages, or losses resulting from the use of this 
              information.
            </p>
            <p>
              <strong>Use at your own risk.</strong> Ice safety is the sole responsibility of each individual. 
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
              📡 Ice Relay
            </h4>
            <p style={{ fontSize: '0.875rem', opacity: 0.85, lineHeight: '1.6' }}>
              Real-world ice thickness reports across the Midwest.
              Community-driven. No account required. Stay safe this winter.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Safety Guidelines
            </h4>
            <ul style={{ 
              fontSize: '0.875rem', 
              opacity: 0.85, 
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li>🔴 {"<"}4": Stay off - Unsafe</li>
              <li>🟡 4-6": Extreme caution</li>
              <li>🟢 6+": Generally safe</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Quick Links
            </h4>
            <ul style={{ 
              fontSize: '0.875rem', 
              opacity: 0.85,
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li><a href="/safety-guide" style={{ color: 'white', textDecoration: 'none' }}>Safety Guide</a></li>
              <li><a href="/about" style={{ color: 'white', textDecoration: 'none' }}>About</a></li>
              <li><a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a></li>
              <li><a href="/acceptable-use" style={{ color: 'white', textDecoration: 'none' }}>Acceptable Use</a></li>
              <li><a href="/disclaimer" style={{ color: 'white', textDecoration: 'none' }}>Full Disclaimer</a></li>
              <li>
                <a 
                  href="https://github.com/Austtiin/IceRelay/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  🐛 Report an Issue
                </a>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '1.25rem' }}>(GitHub sign-in required)</span>
              </li>
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
            © {currentYear} Ice Relay. All rights reserved. All information subject to change.
          </p>
          <p>
            Created by{' '}
            <a 
              href="https://AustinStephens.me" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'white',
                fontWeight: 600,
                textDecoration: 'none',
                borderBottom: '1px solid white'
              }}
            >
              Austin Stephens
            </a>
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
