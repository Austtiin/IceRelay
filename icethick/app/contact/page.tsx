'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const pageStyles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
  main: { flex: 1, padding: '3rem 0', background: '#fafbfc' },
  contentContainer: { maxWidth: '800px' }
};

export default function ContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={pageStyles.container}>
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => {}}
      />
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => {}}
      />

      <main style={pageStyles.main}>
        <div className="container" style={pageStyles.contentContainer}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--primary-dark)',
              textAlign: 'center',
            }}
          >
            Get in Touch
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: 'center' }}>
            Have questions, feedback, or want to get involved? Here&apos;s how to reach us.
          </p>

          <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
            {/* Issues & Feature Requests */}
            <div style={{
              background: 'white',
              border: '1px solid #e0e4ea',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🐛
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-dark)', margin: 0 }}>
                  Report Issues & Request Features
                </h2>
              </div>
              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                Found a bug? Have an idea for a new feature? Submit an issue on our GitHub repository and help make Ice Relay better for everyone!
              </p>
              <a
                href="https://github.com/Austtiin/IceRelay/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="report-issue-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                Report an Issue →
              </a>
              <style jsx>{`
                .report-issue-button:hover {
                  background: var(--primary-dark) !important;
                }
              `}</style>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                (You&apos;ll be asked to sign in with GitHub)
              </p>
            </div>

            {/* Creator Website */}
            <div style={{
              background: 'white',
              border: '1px solid #e0e4ea',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #577399 0%, #495867 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  👨‍💻
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-dark)', margin: 0 }}>
                  About the Creator
                </h2>
              </div>
              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                Ice Relay is created and maintained by Austin Stephens. Visit my website to learn more about my other projects and connect with me.
              </p>
              <a
                href="https://AustinStephens.me"
                target="_blank"
                rel="noopener noreferrer"
                className="creator-website-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#577399',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                Visit AustinStephens.me →
              </a>
              <style jsx>{`
                .creator-website-button:hover {
                  background: #495867 !important;
                }
              `}</style>
            </div>

            {/* Community Section */}
            <div style={{
              background: 'white',
              border: '1px solid #e0e4ea',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F7A93D 0%, #FF8C42 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🤝
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-dark)', margin: 0 }}>
                  Contribute on GitHub
                </h2>
              </div>
              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                Ice Relay is an open-source project. We welcome contributions from developers, designers, and anyone passionate about ice safety.
              </p>
              <ul style={{ marginLeft: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                <li>⭐ Star the repository</li>
                <li>🐛 Report bugs and issues</li>
                <li>💡 Suggest new features</li>
                <li>🔧 Contribute code improvements</li>
                <li>📖 Help improve documentation</li>
              </ul>
              <a
                href="https://github.com/Austtiin/IceRelay"
                target="_blank"
                rel="noopener noreferrer"
                className="github-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#F7A93D',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                View on GitHub →
              </a>
              <style jsx>{`
                .github-button:hover {
                  background: #FF8C42 !important;
                }
              `}</style>
            </div>
          </div>

          {/* Important Notice */}
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e0e4ea',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              <strong>⚠️ Safety First:</strong> For urgent safety concerns or emergencies, please contact local authorities or emergency services immediately (911).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
