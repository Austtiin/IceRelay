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

export default function CookiePolicyPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: 'var(--primary-dark)',
              textAlign: 'center',
            }}
          >
            Cookie Policy
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
            This page explains how Ice Relay uses cookies and similar technologies.
          </p>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              What Are Cookies?
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Cookies are small text files stored on your device by your browser. They help websites remember
              information about your visit.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              How We Use Cookies
            </h2>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <li>To remember basic preferences and improve your experience.</li>
              <li>To measure anonymous traffic and usage patterns.</li>
              <li>To support security and prevent abuse.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Managing Cookies
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Most browsers let you control cookies through their settings, including blocking or deleting them.
              If you disable cookies, some parts of Ice Relay may not work as intended.
            </p>
          </section>

          <section style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e4ea' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Last updated: {lastUpdated}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
