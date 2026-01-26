'use client';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function SafetyGuidePage() {
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

      <main style={{ flex: 1, padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ❄️ Ice Safety Guide
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Essential information for safe ice activities in the Midwest
          </p>

          <div style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
            {/* Ice Thickness Guidelines */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Ice Thickness Safety Guidelines
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ background: '#FE5F55', color: 'white', padding: '1.5rem', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>0-3 inches</h3>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔴 STAY OFF</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.95 }}>Extremely dangerous. No activity is safe.</p>
                </div>
                <div style={{ background: '#FF8C42', color: 'white', padding: '1.5rem', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>4-6 inches</h3>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟠 FOOT ONLY</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.95 }}>Walking only. Test carefully as you go.</p>
                </div>
                <div style={{ background: '#F7A93D', color: 'white', padding: '1.5rem', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>7-9 inches</h3>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟡 SNOWMOBILE</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.95 }}>Light vehicles and snowmobiles.</p>
                </div>
                <div style={{ background: '#577399', color: 'white', padding: '1.5rem', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>10-12 inches</h3>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟢 ATV SAFE</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.95 }}>ATVs and small groups.</p>
                </div>
                <div style={{ background: '#4A90E2', color: 'white', padding: '1.5rem', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>12+ inches</h3>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔵 TRUCK</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.95 }}>Light trucks (proceed with caution).</p>
                </div>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>
                ⚠️ These are general guidelines for CLEAR, SOLID ICE only. White ice, snow-covered ice, 
                slush, or ice with cracks requires significantly greater thickness.
              </p>
            </section>

            {/* Ice Types */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                Understanding Ice Types
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.75rem', borderLeft: '4px solid #4A90E2' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>🧊 Clear Blue/Black Ice (Strongest)</h3>
                  <p>Forms when water freezes quickly with minimal air bubbles. This is the strongest and safest ice. 
                  The thickness guidelines above apply to this type of ice.</p>
                </div>
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.75rem', borderLeft: '4px solid #F7A93D' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>❄️ White/Snow Ice (Weaker)</h3>
                  <p>Contains air bubbles and has a milky appearance. Only about 50% as strong as clear ice. 
                  <strong> Requires double the thickness</strong> for the same weight capacity.</p>
                </div>
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.75rem', borderLeft: '4px solid #FE5F55' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>💧 Slush Ice (Dangerous)</h3>
                  <p>Partially melted or water-saturated ice. <strong>Avoid entirely.</strong> Slush ice has minimal 
                  structural integrity and can collapse under weight.</p>
                </div>
              </div>
            </section>

            {/* Warning Signs */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                ⚠️ Warning Signs - Stay Away From:
              </h2>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><strong>Dark spots or areas:</strong> May indicate thin ice, open water, or springs</li>
                <li><strong>Cracks or pressure ridges:</strong> Signs of unstable or shifting ice</li>
                <li><strong>Areas with current:</strong> River inlets/outlets, channels, and moving water</li>
                <li><strong>Snow-covered ice:</strong> Snow insulates ice and can hide thin spots or cracks</li>
                <li><strong>Shore ice gaps:</strong> Ice pulling away from shore indicates instability</li>
                <li><strong>Boiling or bubbling areas:</strong> May indicate springs or warm water influx</li>
              </ul>
            </section>

            {/* Best Practices */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                ✅ Ice Safety Best Practices
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Before You Go</h3>
                  <ul style={{ marginLeft: '1.25rem', fontSize: '0.95rem' }}>
                    <li>Check recent ice reports AND verify conditions yourself</li>
                    <li>Tell someone where you&apos;re going and when you&apos;ll return</li>
                    <li>Check weather forecasts - avoid ice after warm spells</li>
                    <li>Bring a fully charged cell phone in a waterproof case</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Essential Safety Equipment</h3>
                  <ul style={{ marginLeft: '1.25rem', fontSize: '0.95rem' }}>
                    <li><strong>Ice picks/awls:</strong> Wear around neck to pull yourself out</li>
                    <li><strong>Ice chisel or spud bar:</strong> Test ice thickness as you walk</li>
                    <li><strong>Rope (50+ feet):</strong> For rescues</li>
                    <li><strong>Flotation device:</strong> Life jacket or float coat</li>
                    <li><strong>Whistle:</strong> To signal for help</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>While On The Ice</h3>
                  <ul style={{ marginLeft: '1.25rem', fontSize: '0.95rem' }}>
                    <li>Test ice thickness every 150 feet as you move</li>
                    <li>Drill multiple test holes in different locations</li>
                    <li>Travel in groups, but spread out (never group together)</li>
                    <li>Avoid areas with visible cracks, dark spots, or flowing water</li>
                    <li>Stay away from shore ice that&apos;s pulling away from land</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Self-Rescue */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                🆘 If You Fall Through
              </h2>
              <div style={{
                background: 'rgba(254, 95, 85, 0.1)',
                border: '2px solid var(--accent-danger)',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}>
                <ol style={{ marginLeft: '1.25rem' }}>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>DON&apos;T PANIC:</strong> Control your breathing. Cold shock can cause hyperventilation.
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>TURN TOWARD DIRECTION YOU CAME FROM:</strong> The ice held you there moments ago.
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>USE ICE PICKS:</strong> Dig picks into ice and pull yourself up and forward.
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>KICK YOUR LEGS:</strong> Get horizontal and &quot;swim&quot; onto the ice.
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>ROLL AWAY:</strong> Don&apos;t stand up. Roll or crawl away from the hole.
                  </li>
                  <li>
                    <strong>GET WARM IMMEDIATELY:</strong> Hypothermia sets in fast. Get to shelter and warmth.
                  </li>
                </ol>
                <p style={{ marginTop: '1rem', fontWeight: 600 }}>
                  You have approximately 10 minutes of meaningful movement in 32°F water. Act quickly but deliberately.
                </p>
              </div>
            </section>

            {/* Weather Factors */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                🌡️ Weather Factors That Affect Ice
              </h2>
              <ul style={{ marginLeft: '1.5rem' }}>
                <li><strong>Temperature swings:</strong> Freeze/thaw cycles weaken ice structure</li>
                <li><strong>Rain or snow:</strong> Insulates ice, preventing freezing or causing melting from below</li>
                <li><strong>Wind:</strong> Can break up ice or create pressure cracks</li>
                <li><strong>Sunshine:</strong> Dark ice absorbs heat and can weaken quickly</li>
                <li><strong>Early/late season:</strong> Ice is more unpredictable at season edges</li>
              </ul>
            </section>

            {/* Final Reminder */}
            <section>
              <div style={{
                background: 'var(--primary-dark)',
                color: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                textAlign: 'center'
              }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Remember: No Ice is 100% Safe
                </h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Ice thickness is only one factor. Ice conditions vary across a single body of water and can 
                  change rapidly. Always use caution, trust your instincts, and <strong>when in doubt, stay off the ice</strong>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
