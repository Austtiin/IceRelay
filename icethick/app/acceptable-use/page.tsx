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

export default function AcceptableUsePage() {
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
            Acceptable Use Policy
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
            This policy outlines permitted and prohibited uses of Ice Relay to ensure a safe, legal, and respectful community for all users.
          </p>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Purpose
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Ice Relay is a community-driven platform for sharing ice thickness information to promote ice safety. 
              This policy ensures the platform remains a trusted resource while complying with applicable laws and 
              advertising partner requirements (including Google AdSense policies).
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Permitted Uses
            </h2>
            <div style={{
              background: 'rgba(87, 115, 153, 0.08)',
              border: '1px solid var(--primary)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '0.75rem'
            }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                ✅ You MAY use Ice Relay to:
              </p>
              <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                <li>Submit honest, good-faith ice thickness reports</li>
                <li>View community-submitted ice condition data</li>
                <li>Share Ice Relay with others in the ice fishing and outdoor recreation community</li>
                <li>Access safety information and educational resources</li>
                <li>Report technical issues or suggest improvements</li>
                <li>Contribute to the open-source project on GitHub</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Prohibited Content & Activities
            </h2>
            <div style={{
              background: 'rgba(254, 95, 85, 0.08)',
              border: '2px solid var(--accent-danger)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '0.75rem'
            }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                ⛔ You may NOT use Ice Relay to submit, post, or promote:
              </p>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Illegal Content
            </h3>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <li>Content that violates any local, state, federal, or international law</li>
              <li>Illegal substances, activities, or services</li>
              <li>Content that infringes on intellectual property rights</li>
              <li>Fraudulent schemes or deceptive practices</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Harmful or Dangerous Content
            </h3>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <li><strong>False or misleading ice reports</strong> that could endanger others</li>
              <li>Instructions for dangerous or self-harm activities</li>
              <li>Content promoting violence, terrorism, or extremism</li>
              <li>Threats, harassment, or bullying</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Adult & Inappropriate Content
            </h3>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <li>Pornography or sexually explicit material</li>
              <li>Nudity or sexual content</li>
              <li>Adult services or dating content</li>
              <li>Profane or vulgar language</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Hateful or Discriminatory Content
            </h3>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <li>Hate speech targeting individuals or groups based on race, ethnicity, religion, disability, gender, age, veteran status, sexual orientation, or gender identity</li>
              <li>Content that promotes discrimination or segregation</li>
              <li>Harassment or bullying of any kind</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Spam & Misuse
            </h3>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <li>Spam, unsolicited advertising, or promotional content</li>
              <li>Malware, viruses, or malicious code</li>
              <li>Attempts to manipulate or abuse the platform</li>
              <li>Automated bots or scripts (except for legitimate open-source contributions)</li>
              <li>Excessive or duplicate report submissions</li>
              <li>Phishing or social engineering attempts</li>
            </ul>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Other Prohibited Content
            </h3>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <li>Tobacco, alcohol, or regulated substance promotion</li>
              <li>Gambling or betting content</li>
              <li>Weapons, explosives, or dangerous materials</li>
              <li>Counterfeit goods or unauthorized replicas</li>
              <li>Private or confidential information about others</li>
              <li>Content impersonating others or misrepresenting identity</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Content Moderation
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Ice Relay implements the following measures to maintain content quality:
            </p>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <li><strong>Automated Filtering:</strong> Profanity filters and spam detection algorithms screen all submissions</li>
              <li><strong>Rate Limiting:</strong> Prevents abuse through submission frequency limits</li>
              <li><strong>Community Reporting:</strong> Users can report inappropriate content (feature coming soon)</li>
              <li><strong>Manual Review:</strong> Team reviews flagged content and removes violations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Consequences of Violations
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Violations of this policy may result in:
            </p>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <li>Immediate removal of offending content</li>
              <li>Temporary or permanent IP address blocking</li>
              <li>Reporting to law enforcement (for illegal activities)</li>
              <li>Legal action for damages caused by violations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Reporting Violations
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              If you encounter content that violates this policy, please contact us at{' '}
              <a href="mailto:support@icerelay.com" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
                support@icerelay.com
              </a>{' '}
              or through our <a href="/contact" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>contact page</a>. 
              Include the specific report or content details to help us investigate.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Advertising Partners
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Ice Relay displays advertisements through Google AdSense to support free operation of the platform. 
              We are committed to maintaining a family-friendly, safe environment that complies with all Google 
              AdSense program policies. Advertisers do not influence our content moderation decisions.
            </p>
          </section>

          <section style={{ marginBottom: '2rem', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
              Changes to This Policy
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              We may update this Acceptable Use Policy from time to time to reflect changes in legal requirements, 
              platform features, or community standards. Continued use of Ice Relay constitutes acceptance of 
              the current policy.
            </p>
          </section>

          <section style={{
            background: '#f8f9fa',
            border: '1px solid #e0e4ea',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              <strong>Questions?</strong> If you have questions about this policy or need clarification on what 
              is permitted, please <a href="/contact" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>contact us</a>.
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
