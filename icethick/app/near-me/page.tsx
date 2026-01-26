'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SubmitReportForm from '../components/SubmitReportForm';

export default function NearMePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [showLakeConfirmation, setShowLakeConfirmation] = useState(false);
  const [lakeSearch, setLakeSearch] = useState('');
  const [lakeSuggestions, setLakeSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const handleLakeSearchChange = async (value: string) => {
    setLakeSearch(value);

    if (value.trim().length < 2) {
      setLakeSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const { api } = await import('../../lib/api');
      const results = await api.searchLakes(value);
      setLakeSuggestions(results.slice(0, 10));
      setShowSuggestions(true);
    } catch (error) {
      console.error('[NearMe] Error searching lakes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLakeSelect = (lake: any) => {
    const lakeName = lake.LakeName || lake.lakeName;
    const lat = lake.Latitude || lake.latitude;
    const lng = lake.Longitude || lake.longitude;

    setLakeSearch(lakeName);
    setShowSuggestions(false);

    if (lat && lng) {
      window.location.href = `/map?lake=${encodeURIComponent(lakeName)}&lat=${lat}&lng=${lng}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => setShowLakeConfirmation(true)}
      />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => setShowLakeConfirmation(true)}
      />

      <main style={{ flex: 1, background: '#fafbfc' }}>
        {/* Hero Section */}
        <section style={{
          position: 'relative',
          backgroundImage: 'url(/HomeHero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '3rem 0',
          color: 'white',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          {/* Dark overlay for better text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(73, 88, 103, 0.85) 0%, rgba(87, 115, 153, 0.75) 100%)',
            zIndex: 1
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}>
              📍 Ice Thickness Near You
            </h1>
            <p style={{
              fontSize: '1rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Enable location or search for a specific lake to see ice reports
            </p>
          </div>
        </section>

        {/* Wave Transition */}
        <div style={{
          position: 'relative',
          marginTop: '-80px',
          marginBottom: '-40px',
          zIndex: 5
        }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '120px', display: 'block' }}>
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z" 
                  fill="#fafbfc" />
          </svg>
        </div>

        {/* Lake Selection */}
        <section style={{ padding: '2rem 0 1rem 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--primary-dark)',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🔍 Search for a Specific Lake
              </h2>
              <div
                ref={searchRef}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <input
                  type="text"
                  value={lakeSearch}
                  onChange={(e) => handleLakeSearchChange(e.target.value)}
                  placeholder="Start typing to search for a lake..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--primary-light)',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                />

                {isSearching && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic'
                  }}>
                    Searching lakes...
                  </div>
                )}

                {showSuggestions && lakeSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '2px solid var(--primary-light)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    marginTop: '0.25rem',
                    zIndex: 10
                  }}>
                    {lakeSuggestions.map((suggestion, idx) => {
                      const lakeName = suggestion.LakeName || suggestion.lakeName || 'Unknown Lake';
                      const reportCount = suggestion.ReportCount || suggestion.reportCount || 0;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLakeSelect(suggestion)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            border: 'none',
                            borderBottom: idx < lakeSuggestions.length - 1 ? '1px solid var(--primary-light)' : 'none',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-light)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                            {lakeName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {reportCount} report{reportCount !== 1 ? 's' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {lakeSearch.trim().length >= 2 && !isSearching && lakeSuggestions.length === 0 && (
                  <p style={{
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    We either don't have a record yet or can't find the lake you're looking for. If you're on the lake right now,{' '}
                    <button
                      type="button"
                      onClick={() => setShowLakeConfirmation(true)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        margin: 0,
                        color: 'var(--primary-dark)',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      feel free to add a new report
                    </button>
                    .
                  </p>
                )}

                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  Can't find your lake? Try searching by common abbreviations or alternate names (e.g., "Lake of the Woods" as "LOW").
                </p>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '1rem 0',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              - OR -
            </div>
          </div>
        </section>

        {/* Location Request */}
        <section style={{ padding: '0 0 2rem 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{
              background: 'white',
              padding: '2rem 1.5rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--primary-dark)',
                marginBottom: '0.75rem'
              }}>
                Enable Location Access
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                fontSize: '0.9rem'
              }}>
                To show ice thickness reports near you, we need access to your location. 
                Your location is only used to find nearby reports and is never stored or shared.
              </p>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        console.log('Location:', position.coords);
                        const { latitude, longitude } = position.coords;
                        // Send the user straight to the map, centered on their location
                        window.location.href = `/map?lat=${latitude}&lng=${longitude}&zoom=11`;
                      },
                      (error) => {
                        let errorMessage = 'Unable to get your location.';
                        if (error.code === error.PERMISSION_DENIED) {
                          errorMessage = 'Location access was denied. Please go into your browser settings and enable location access. We require location data to prevent spam and ensure reports are from actual lake locations.';
                        } else if (error.code === error.POSITION_UNAVAILABLE) {
                          errorMessage = 'Location information is unavailable right now. Please try again in a moment.';
                        } else if (error.code === error.TIMEOUT) {
                          errorMessage = 'Location request timed out. Please check your connection and try again.';
                        }
                        alert(errorMessage);
                      }
                    );
                  } else {
                    alert('Geolocation is not supported by your browser.');
                  }
                }}
                style={{
                  background: 'var(--primary-dark)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-medium)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--primary-dark)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                Enable Location
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Lake Confirmation Dialog */}
      {showLakeConfirmation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowLakeConfirmation(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--primary-dark)',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Are you currently on the lake?
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.75rem',
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              To keep reports accurate and trustworthy, please only submit a new report while you are physically on the lake you are measuring. We capture your GPS location with each report to verify this.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowLakeConfirmation(false);
                  alert('Please wait until you are actually on the lake before adding a report.');
                }}
                style={{
                  minWidth: '120px',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLakeConfirmation(false);
                  setIsSubmitFormOpen(true);
                }}
                style={{
                  minWidth: '120px',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'var(--primary-dark)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Yes, I'm on the lake
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitFormOpen && (
        <SubmitReportForm
          onClose={() => setIsSubmitFormOpen(false)}
          onSubmit={async (data) => {
            console.log('Report submitted:', data);
            setIsSubmitFormOpen(false);
          }}
        />
      )}
    </div>
  );
}
