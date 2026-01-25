'use client';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => {}}
      />

      <main style={{ flex: 1, padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
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
                Important Reminder
              </h2>
              <div style={{
                background: 'rgba(254, 95, 85, 0.1)',
                border: '2px solid var(--accent-danger)',
                borderRadius: '0.75rem',
                padding: '1.25rem'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  Ice Relay provides community signals, not permission to go on the ice.
                </p>
                <p>
                  Always verify ice conditions yourself before venturing out. Ice thickness can vary significantly 
                  across a single body of water, and conditions can change rapidly. Your safety is your responsibility.
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
                  href="https://github.com/Austtiin"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-dark)', fontWeight: 600 }}
                >
                  @Austtiin
                </a>. If you&apos;d like to contribute or report issues, please visit our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
