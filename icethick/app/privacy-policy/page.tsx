'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => {}}
      />
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => {}}
      />

      <main style={{ flex: 1, padding: '3rem 0', background: '#fafbfc' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: 'var(--primary-dark)',
              textAlign: 'center',
            }}
          >
            Privacy Policy
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
            We take your privacy seriously and aim to collect only what we need to keep Ice Relay useful and safe for the community.
          </p>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Information We Collect
            </h2>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <li>Ice report details you submit (lake name, ice thickness, notes, etc.).</li>
              <li>Approximate GPS location with each report to verify it is actually on a lake.</li>
              <li>Basic technical data from your browser (such as IP address, device type, and logs) for security and analytics.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              How We Use Your Information
            </h2>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <li>To display community ice reports and keep the map and lists accurate.</li>
              <li>To help prevent spam or obviously fake reports using location and basic technical checks.</li>
              <li>To understand how people use Ice Relay and improve the product over time.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Data Sharing
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              We do not sell your personal information. We may use trusted third-party services (such as analytics
              and hosting providers) that help us run Ice Relay. These providers process data on our behalf and are
              expected to protect it.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Cookies & Tracking
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Ice Relay may use cookies or similar technologies for things like remembering your preferences, measuring
              traffic, and keeping the site secure. You can control cookies in your browser settings. For more detail,
              see our Cookie Policy.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Your Choices
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              You may choose not to submit reports or share your location; however, some features (like submitting a
              new ice report or viewing ice near you) may require location access to work properly.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Contact
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              If you have questions about this policy or how your data is used, please contact the Ice Relay team
              through the project repository or the contact information provided on the site.
            </p>
          </section>

          <section style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e4ea' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
