'use client';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useState } from 'react';

const pageStyles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
  main: { flex: 1, padding: '3rem 0' },
  contentContainer: { maxWidth: '900px' }
};

export default function SafetyGuidePage() {
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
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-medium) 0%, var(--primary-dark) 100%)',
            color: 'white',
            padding: '3rem 2rem',
            borderRadius: '1rem',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              ❄️ Ice Safety Guide
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: 0, opacity: 0.95 }}>
              Essential information to keep you safe on Minnesota ice
            </p>
          </div>

          <div style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
            {/* Critical Warning Banner */}
            <div style={{
              background: 'rgba(254, 95, 85, 0.1)',
              border: '2px solid var(--accent-danger)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-danger)', margin: 0 }}>
                ⚠️ NO ICE IS 100% SAFE ⚠️
              </p>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                Always verify conditions yourself. Ice thickness varies drastically across a single body of water.
              </p>
            </div>

            {/* Ice Thickness Guidelines */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                borderBottom: '3px solid var(--primary-medium)',
                paddingBottom: '0.5rem'
              }}>
                Ice Thickness Guidelines
              </h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                These guidelines apply to <strong>clear, solid ice only</strong>. White ice, snow-covered ice, or slush requires significantly greater thickness.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #FE5F55 0%, #d14842 100%)',
                  color: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(254, 95, 85, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>0-3"</h3>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔴 STAY OFF</p>
                  <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>Extremely dangerous. No activity is safe.</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #FF8C42 0%, #d97537 100%)',
                  color: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>4-6"</h3>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🟠 WALKING</p>
                  <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>Walking only. Test carefully as you go.</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #F7A93D 0%, #d18f33 100%)',
                  color: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(247, 169, 61, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>7-9"</h3>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🟡 SLED</p>
                  <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>Snowmobiles and light vehicles.</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #577399 0%, #495867 100%)',
                  color: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(87, 115, 153, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>10-12"</h3>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🟢 ATV</p>
                  <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>ATVs and small groups.</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #4A90E2 0%, #3a73b8 100%)',
                  color: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>12-15"</h3>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔵 TRUCK</p>
                  <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>Light trucks (proceed with caution).</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #2E5266 0%, #1f3845 100%)',
                  color: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 12px rgba(46, 82, 102, 0.3)'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>15+"</h3>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚫ HEAVY</p>
                  <p style={{ fontSize: '1rem', opacity: 0.95, margin: 0 }}>Medium trucks. Still exercise caution.</p>
                </div>
              </div>
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.95rem'
              }}>
                <strong>⚠️ Important:</strong> These measurements are for <strong>clear, solid blue/black ice</strong>. 
                White ice requires <strong>2x thickness</strong>. Slush ice should be avoided entirely.
              </div>
            </section>

            {/* Ice Types */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                borderBottom: '3px solid var(--primary-medium)',
                paddingBottom: '0.5rem'
              }}>
                Understanding Ice Types
              </h2>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  borderLeft: '6px solid #4A90E2',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.75rem', color: '#4A90E2' }}>
                    🧊 Clear Blue/Black Ice
                  </h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
                    <strong>Strongest and safest ice.</strong> Forms when water freezes quickly with minimal air bubbles. 
                    This is the type of ice the thickness guidelines above refer to. Look for clear, glassy ice with a blue or black tint.
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  borderLeft: '6px solid #F7A93D',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.75rem', color: '#F7A93D' }}>
                    ❄️ White/Snow Ice
                  </h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
                    <strong>Only 50% as strong</strong> as clear ice. Contains air bubbles and has a milky white appearance. 
                    <strong> Requires DOUBLE the thickness</strong> for the same weight capacity. Treat 8" of white ice like 4" of clear ice.
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  borderLeft: '6px solid #FE5F55',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.75rem', color: '#FE5F55' }}>
                    💧 Slush Ice
                  </h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
                    <strong>Extremely dangerous - AVOID ENTIRELY.</strong> Partially melted or water-saturated ice. 
                    Slush has minimal structural integrity and can collapse under weight without warning. Often hidden under snow.
                  </p>
                </div>
              </div>
            </section>

            {/* Warning Signs */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                borderBottom: '3px solid var(--primary-medium)',
                paddingBottom: '0.5rem'
              }}>
                ⚠️ Danger Signs - Stay Away
              </h2>
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { icon: '🌑', title: 'Dark Spots or Areas', desc: 'May indicate thin ice, open water, springs, or weak spots' },
                    { icon: '💥', title: 'Cracks or Pressure Ridges', desc: 'Signs of unstable or shifting ice. Ice can move and create weak zones' },
                    { icon: '🌊', title: 'Areas with Current', desc: 'River inlets/outlets, channels, narrows, and moving water weaken ice' },
                    { icon: '❄️', title: 'Snow-Covered Ice', desc: 'Snow insulates ice (prevents freezing) and hides thin spots, cracks, or holes' },
                    { icon: '🏖️', title: 'Shore Ice Gaps', desc: 'Ice pulling away from shore is a clear sign of instability or warming' },
                    { icon: '💨', title: 'Boiling or Bubbling Areas', desc: 'May indicate springs, warm water influx, or underwater currents' },
                    { icon: '☀️', title: 'Sunny, Dark Ice', desc: 'Dark ice absorbs solar heat and can weaken rapidly on sunny days' },
                    { icon: '🎣', title: 'Old Fishing Holes', desc: 'Areas with many holes weaken surrounding ice structure' }
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'start',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--primary-dark)' }}>{item.title}:</strong>
                        <span style={{ marginLeft: '0.5rem' }}>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                borderBottom: '3px solid var(--primary-medium)',
                paddingBottom: '0.5rem'
              }}>
                ✅ Safety Best Practices
              </h2>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>📋</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, color: 'var(--primary-dark)' }}>
                      Before You Go
                    </h3>
                  </div>
                  <ul style={{ marginLeft: '1.25rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
                    <li>Check recent ice reports <strong>AND</strong> verify conditions yourself</li>
                    <li>Tell someone where you&apos;re going and when you&apos;ll return</li>
                    <li>Check weather forecasts - avoid ice after warm spells or rain</li>
                    <li>Bring a fully charged cell phone in a waterproof case</li>
                    <li>Never go alone - travel with a buddy</li>
                  </ul>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🎒</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, color: 'var(--primary-dark)' }}>
                      Essential Safety Equipment
                    </h3>
                  </div>
                  <ul style={{ marginLeft: '1.25rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
                    <li><strong>Ice picks/awls:</strong> Wear around neck to pull yourself out if you fall through</li>
                    <li><strong>Ice chisel or spud bar:</strong> Test ice thickness as you walk</li>
                    <li><strong>Rope (50+ feet):</strong> For performing rescues safely</li>
                    <li><strong>Flotation device:</strong> Life jacket or float coat (always wear one)</li>
                    <li><strong>Whistle:</strong> To signal for help - voice carries poorly on ice</li>
                    <li><strong>Ice cleats:</strong> Prevent slipping on clear ice</li>
                  </ul>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🚶</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, color: 'var(--primary-dark)' }}>
                      While On The Ice
                    </h3>
                  </div>
                  <ul style={{ marginLeft: '1.25rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
                    <li>Test ice thickness every 150 feet as you move across the ice</li>
                    <li>Drill multiple test holes in different locations</li>
                    <li>Travel in groups, but <strong>spread out</strong> (never cluster together)</li>
                    <li>Avoid areas with visible cracks, dark spots, or flowing water</li>
                    <li>Stay away from shore ice that&apos;s pulling away from land</li>
                    <li>If ice begins cracking, lie flat and crawl back the way you came</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Self-Rescue */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                borderBottom: '3px solid var(--primary-medium)',
                paddingBottom: '0.5rem'
              }}>
                🆘 If You Fall Through Ice
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(254, 95, 85, 0.15) 0%, rgba(254, 95, 85, 0.05) 100%)',
                border: '3px solid var(--accent-danger)',
                borderRadius: '1rem',
                padding: '2rem'
              }}>
                <div style={{
                  background: 'var(--accent-danger)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  ⏱️ You have approximately 10 minutes of meaningful movement in 32°F water
                </div>
                <ol style={{ marginLeft: '1.5rem', fontSize: '1.05rem', lineHeight: 2 }}>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-danger)' }}>DON&apos;T PANIC:</strong> Control your breathing. 
                    Cold shock response causes hyperventilation. Focus on slow, deep breaths.
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-danger)' }}>TURN TOWARD YOUR ENTRY POINT:</strong> The ice held you there moments ago - it&apos;s your best chance.
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-danger)' }}>USE ICE PICKS:</strong> Dig picks into ice edge and pull yourself up and forward onto the ice.
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-danger)' }}>KICK YOUR LEGS:</strong> Get your body horizontal like swimming. 
                    Kick hard to propel yourself onto the ice surface.
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-danger)' }}>ROLL AWAY FROM HOLE:</strong> Don&apos;t stand up immediately. 
                    Roll or crawl away to distribute your weight.
                  </li>
                  <li>
                    <strong style={{ color: 'var(--accent-danger)' }}>GET WARM IMMEDIATELY:</strong> Hypothermia sets in fast. 
                    Get to shelter, remove wet clothes, and warm up. Call 911.
                  </li>
                </ol>
              </div>
            </section>

            {/* Weather Factors */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                borderBottom: '3px solid var(--primary-medium)',
                paddingBottom: '0.5rem'
              }}>
                🌡️ Weather Factors That Weaken Ice
              </h2>
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
              }}>
                <ul style={{ marginLeft: '1.5rem', fontSize: '1.05rem', lineHeight: 2 }}>
                  <li><strong>Temperature swings:</strong> Repeated freeze/thaw cycles weaken ice structure dramatically</li>
                  <li><strong>Rain:</strong> Adds weight and creates slush layers that significantly reduce strength</li>
                  <li><strong>Snow cover:</strong> Insulates ice, preventing it from getting thicker and causing melting from below</li>
                  <li><strong>Wind:</strong> Can break up ice sheets or create dangerous pressure cracks and ridges</li>
                  <li><strong>Sunshine:</strong> Dark ice absorbs solar heat and can deteriorate rapidly on sunny days</li>
                  <li><strong>Early/late season:</strong> Ice is more unpredictable during freeze-up and ice-out periods</li>
                  <li><strong>Warm spring water:</strong> Underground springs create weak spots invisible from surface</li>
                </ul>
              </div>
            </section>

            {/* Final Reminder */}
            <section>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%)',
                color: 'white',
                padding: '3rem 2rem',
                borderRadius: '1rem',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❄️</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Remember: No Ice is 100% Safe
                </h2>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '1.5rem', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
                  Ice thickness is only one factor. Ice conditions vary dramatically across a single body of water and can 
                  change rapidly with weather. Always use caution, trust your instincts, and <strong>when in doubt, stay off the ice</strong>.
                </p>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginTop: '1.5rem',
                  fontSize: '1.05rem'
                }}>
                  Your safety is <strong>your responsibility</strong>. Ice Relay provides community signals, not permission to venture onto ice.
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
