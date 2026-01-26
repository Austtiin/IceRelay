'use client';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useState } from 'react';

const pageStyles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
  main: { flex: 1, padding: '3rem 0' },
  contentContainer: { maxWidth: '800px' }
};

export default function AboutPage() {
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
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--primary-dark)'
          }}>
            About Ice Relay
          </h1>

          <div style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Our Mission
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Ice Relay is a community-driven platform designed to help ice enthusiasts across the Midwest 
                stay safe by sharing real-time ice thickness data. We believe that collective knowledge and 
                transparency about ice conditions can save lives and make winter activities safer for everyone.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                How It Works
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Ice Relay aggregates ice thickness reports from community members like you. When you submit a 
                report, you&apos;re helping fellow ice fishers, skaters, and outdoor enthusiasts make informed 
                decisions about ice safety.
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><strong>No Account Required:</strong> Submit reports without creating an account</li>
                <li><strong>Real-Time Data:</strong> See the latest ice conditions across the region</li>
                <li><strong>Community Driven:</strong> Built by ice enthusiasts, for ice enthusiasts</li>
                <li><strong>Free Forever:</strong> This service will always remain free to use</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Why We Built This
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Ice thickness information is often scattered across forums, social media posts, and word-of-mouth. 
                We wanted to create a centralized, easy-to-use platform where everyone can access and contribute 
                ice condition data. Our goal is to reduce ice-related accidents by providing better information 
                to our community.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Important Safety Disclaimer
              </h2>
              <div style={{
                background: 'rgba(254, 95, 85, 0.1)',
                border: '2px solid var(--accent-danger)',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.05rem', color: 'var(--accent-danger)' }}>
                  ⚠️ All Reports Are User-Submitted and Unverified
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                  <li><strong>Community-Sourced:</strong> All ice thickness data is submitted by individuals like you and cannot be independently verified</li>
                  <li><strong>May Be Inaccurate:</strong> Reports may contain unintentional errors or be outdated due to rapidly changing conditions</li>
                  <li><strong>Location-Specific:</strong> Ice thickness varies drastically across a single lake—a report from one spot does not represent the entire body of water</li>
                  <li><strong>Your Responsibility:</strong> Ice Relay provides community signals, <strong>NOT permission</strong> to go on the ice</li>
                </ul>
                <p style={{ fontWeight: 600, marginTop: '1rem', padding: '0.75rem', background: 'white', borderRadius: '0.5rem', border: '1px solid var(--accent-danger)' }}>
                  Always drill and measure ice thickness yourself at multiple locations before venturing out. 
                  When in doubt, stay off the ice. <strong>No ice is 100% safe.</strong> Your safety is your sole responsibility.
                </p>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Get Involved
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Ice Relay is an open-source project created by{' '}
                <a 
                  href="https://AustinStephens.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-dark)', fontWeight: 600 }}
                >
                  Austin Stephens
                </a>. If you&apos;d like to contribute, report issues, or request features, please visit our{' '}
                <a 
                  href="https://github.com/Austtiin/IceRelay"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-dark)', fontWeight: 600 }}
                >
                  GitHub repository
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
