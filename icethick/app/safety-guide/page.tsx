'use client';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useState } from 'react';
import { officialIceSafetyResources } from '../../lib/ice-coverage';

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
      />
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
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
               Ice Safety Guide
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: 0, opacity: 0.95 }}>
              Essential information for ice conditions across our region
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
                 NO ICE IS 100% SAFE
              </p>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                Always verify conditions yourself. Ice thickness varies drastically across a single body of water.
              </p>
            </div>

            {/* Ice Thickness Guidance */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                paddingBottom: '0.75rem',
                position: 'relative' as const
              }}>
                Ice Thickness Depends on Local Conditions
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(to right, var(--primary-medium) 0%, var(--primary-light) 100%)',
                borderRadius: '3px',
                marginBottom: '1.5rem',
                width: '100%'
              }} />
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '1.25rem'
              }}>
                <p style={{ marginBottom: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
                  Ice strength cannot be judged by thickness alone. It varies across a lake and depends on ice
                  quality, currents, snow cover, weather, and other local conditions. Follow current guidance
                  from the state agency responsible for the water you plan to visit. Ice Relay reports are
                  not a clearance to travel.
                </p>
                <ul style={{ marginBottom: 0 }}>
                  <li>Measure at multiple locations as you move; one measurement does not represent a lake.</li>
                  <li>Stay away from currents, inlets, outlets, bridges, and areas with changing ice.</li>
                  <li>When in doubt, stay off the ice.</li>
                </ul>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>
                Official state safety resources
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.75rem' }}>
                {officialIceSafetyResources.map((resource) => (
                  <a
                    key={resource.state}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      color: 'var(--primary-dark)',
                      fontWeight: 600
                    }}
                  >
                    {resource.state === 'Minnesota' ? 'Minnesota DNR (MN DNR) ice safety' : `${resource.state} ice safety`}
                  </a>
                ))}
              </div>
              <p style={{ marginTop: '1rem' }}>
                Minnesota DNR guidance explains that thickness alone cannot establish ice
                strength and that conditions vary across a lake. Check the agency&apos;s
                current advice before a winter outing. Ice Relay is independent of these
                agencies; linking to their guidance does not imply endorsement.
              </p>
            </section>

            {/* Ice Types */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                paddingBottom: '0.75rem',
                position: 'relative' as const
              }}>
                Understanding Ice Types
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(to right, var(--primary-medium) 0%, var(--primary-light) 100%)',
                borderRadius: '3px',
                marginBottom: '1.5rem',
                width: '100%'
              }} />
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  borderLeft: '6px solid #4A90E2',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.75rem', color: '#4A90E2' }}>
                     Clear Blue/Black Ice
                  </h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
                    Clear ice is generally stronger than white ice, but appearance alone cannot establish that ice is safe.
                    Conditions can vary significantly in a small area.
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
                     White/Snow Ice
                  </h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
                    White or snow-covered ice can be weaker and snow can hide thin spots, cracks, or open water.
                    Do not rely on a simple conversion from white ice to clear ice.
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
                     Slush Ice
                  </h3>
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
                    Slush and water-saturated ice can be weak and unpredictable. Avoid treating it like solid ice,
                    and use current local agency guidance when assessing conditions.
                  </p>
                </div>
              </div>
            </section>

            {/* Warning Signs */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                paddingBottom: '0.75rem',
                position: 'relative' as const
              }}>
                Warning Signs of Unsafe Ice
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(to right, var(--accent-danger) 0%, var(--accent-warning) 100%)',
                borderRadius: '3px',
                marginBottom: '1.5rem',
                width: '100%'
              }} />
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { title: 'Dark Spots or Areas', desc: 'May indicate thin ice, open water, springs, or weak spots' },
                    { title: 'Cracks or Pressure Ridges', desc: 'Signs of unstable or shifting ice. Ice can move and create weak zones' },
                    { title: 'Areas with Current', desc: 'River inlets/outlets, channels, narrows, and moving water weaken ice' },
                    { title: 'Snow-Covered Ice', desc: 'Snow insulates ice (prevents freezing) and hides thin spots, cracks, or holes' },
                    { title: 'Shore Ice Gaps', desc: 'Ice pulling away from shore is a clear sign of instability or warming' },
                    { title: 'Boiling or Bubbling Areas', desc: 'May indicate springs, warm water influx, or underwater currents' },
                    { title: 'Sunny, Dark Ice', desc: 'Dark ice absorbs solar heat and can weaken rapidly on sunny days' },
                    { title: 'Old Fishing Holes', desc: 'Areas with many holes weaken surrounding ice structure' }
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      minWidth: 0,
                      gap: '1rem',
                      alignItems: 'start',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '0.5rem'
                    }}>
                      <div style={{ minWidth: 0 }}>
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
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                paddingBottom: '0.75rem',
                position: 'relative' as const
              }}>
                 Safety Best Practices
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(to right, #4caf50 0%, var(--primary-medium) 100%)',
                borderRadius: '3px',
                marginBottom: '1.5rem',
                width: '100%'
              }} />
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{
                  background: 'white',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                paddingBottom: '0.75rem',
                position: 'relative' as const
              }}>
                 If You Fall Through Ice
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(to right, var(--accent-danger) 0%, #FF8C42 100%)',
                borderRadius: '3px',
                marginBottom: '1.5rem',
                width: '100%'
              }} />
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
                   You have approximately 10 minutes of meaningful movement in 32°F water
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
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--primary-dark)',
                paddingBottom: '0.75rem',
                position: 'relative' as const
              }}>
                 Weather Factors That Weaken Ice
              </h2>
              <div style={{
                height: '3px',
                background: 'linear-gradient(to right, var(--primary-medium) 0%, var(--primary-light) 100%)',
                borderRadius: '3px',
                marginBottom: '1.5rem',
                width: '100%'
              }} />
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
                <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem' }}>
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
