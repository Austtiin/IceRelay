'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
            These terms describe how you may use Ice Relay. By using the site, you agree to follow them.
          </p>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Your Responsibilities
            </h2>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <li>Use Ice Relay for lawful purposes only.</li>
              <li>Submit only honest, good-faith reports about ice conditions.</li>
              <li>Do not attempt to abuse, overload, or disrupt the service.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              No Safety Guarantee
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Ice Relay is a community tool and does not guarantee the safety or accuracy of any ice report. You are
              solely responsible for your own safety and decisions on or near the ice. Always verify conditions in
              person and use good judgment.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Changes and Availability
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              We may change, pause, or stop parts of Ice Relay at any time without notice. We may also update these
              terms from time to time. If you continue using the site after changes, you are agreeing to the updated
              terms.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Disclaimer & Liability
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              The full legal disclaimer and limitation of liability for Ice Relay is described on our Disclaimer page.
              By using the site, you acknowledge and accept those terms as well.
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
