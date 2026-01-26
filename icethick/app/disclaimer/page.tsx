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

export default function DisclaimerPage() {
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
          <div style={{
            background: 'rgba(254, 95, 85, 0.15)',
            border: '3px solid var(--accent-danger)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Legal Disclaimer & Terms of Use
            </h1>
          </div>

          <div style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Use at Your Own Risk
              </h2>
              <p style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>
                <strong>ICE RELAY IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND.</strong> All information 
                provided through this application is for informational purposes only. The creators, contributors, 
                maintainers, and operators of Ice Relay assume <strong>NO LIABILITY</strong> for any injuries, 
                damages, property loss, death, or any other consequences resulting from the use of this information.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                User-Submitted Reports & Verification
              </h2>
              <div style={{
                background: 'rgba(254, 95, 85, 0.08)',
                border: '2px solid var(--accent-danger)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ marginBottom: '1rem', fontWeight: 600 }}>
                  All ice thickness reports on Ice Relay are submitted by community members and are <strong>NOT</strong> verified, 
                  validated, or endorsed by Ice Relay.
                </p>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                All ice thickness data on Ice Relay is <strong>crowd-sourced from community members</strong> and may be:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><strong>Inaccurate:</strong> Reports may contain errors, whether intentional or unintentional</li>
                <li><strong>Outdated:</strong> Ice conditions change rapidly; recent reports may no longer reflect current conditions</li>
                <li><strong>Incomplete:</strong> Reports represent specific locations and may not reflect conditions across an entire body of water</li>
                <li><strong>Estimated:</strong> &quot;Observed&quot; reports are visual estimates and not precise measurements</li>
                <li><strong>Unverified:</strong> We cannot independently verify the accuracy of community-submitted data</li>
                <li><strong>Malicious:</strong> Despite our spam prevention efforts, false reports may still be submitted</li>
              </ul>
              <p style={{ marginTop: '1rem', fontWeight: 600, color: 'var(--accent-danger)' }}>
                ⚠️ Do not trust reports blindly. Always perform your own ice thickness measurements at multiple locations 
                before venturing onto any ice surface. What is reported safe at one location can be dangerously thin just feet away.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Ice Safety Responsibility
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                <strong>YOU ARE SOLELY RESPONSIBLE FOR YOUR OWN SAFETY.</strong> Before venturing onto any ice:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Always verify ice thickness yourself through multiple drill tests</li>
                <li>Check ice conditions at multiple locations across the body of water</li>
                <li>Never rely solely on community reports or third-party information</li>
                <li>Understand that ice thickness varies significantly across a single lake</li>
                <li>Be aware that weather, currents, springs, and other factors affect ice integrity</li>
                <li>Review official ice safety guidelines and take proper safety training</li>
                <li>When in doubt, <strong>STAY OFF THE ICE</strong></li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                No Professional Advice
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Ice Relay does <strong>NOT</strong> provide professional ice safety assessments, recommendations, or 
                certifications. This platform is <strong>NOT</strong> a substitute for:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Professional ice safety training</li>
                <li>Official government or park service ice condition reports</li>
                <li>Expert guidance from certified professionals</li>
                <li>Personal judgment and experience with local ice conditions</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Limitation of Liability
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, the creators, contributors, maintainers, and operators 
                of Ice Relay shall NOT be liable for any:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Direct, indirect, incidental, special, or consequential damages</li>
                <li>Personal injury, death, or property damage</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages arising from use or inability to use this service</li>
                <li>Damages resulting from reliance on information provided through this platform</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                User-Generated Content
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                By submitting ice reports, you acknowledge that:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Your reports will be publicly visible to all users</li>
                <li>You are responsible for the accuracy of your submissions</li>
                <li>False or malicious reports may harm others and could have legal consequences</li>
                <li>Ice Relay reserves the right to remove any content without notice</li>
                <li>You must comply with our <a href="/acceptable-use" style={{ color: 'var(--primary-dark)', fontWeight: 600, textDecoration: 'underline' }}>Acceptable Use Policy</a>, which prohibits illegal, harmful, adult, hateful, or spam content</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Service Availability
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Ice Relay is provided free of charge with <strong>NO GUARANTEE</strong> of:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Uptime or availability</li>
                <li>Data preservation or backup</li>
                <li>Continued operation or support</li>
                <li>Freedom from errors, bugs, or security vulnerabilities</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Changes to Terms
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                These terms may be updated at any time without notice. Continued use of Ice Relay constitutes 
                acceptance of any changes to these terms.
              </p>
            </section>

            <section>
              <div style={{
                background: 'var(--primary-light)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                borderLeft: '4px solid var(--primary-dark)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                  Final Warning
                </h2>
                <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                  No ice is 100% safe. Ice conditions are unpredictable and can be deadly. If you choose to go 
                  on the ice, you do so entirely at your own risk. Ice Relay is a community tool, not a safety 
                  guarantee. <strong>WHEN IN DOUBT, STAY OFF THE ICE.</strong>
                </p>
              </div>
            </section>

            <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e9ecef' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
