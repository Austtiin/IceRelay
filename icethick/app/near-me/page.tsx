'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Notification, { NotificationType } from '../components/Notification';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SubmitReportForm from '../components/SubmitReportForm';
import type { ReportData } from '../components/SubmitReportForm';
import { api } from '../../lib/api';
import type { LakeSuggestion } from '../../lib/api';
import { iceCoverageStates } from '../../lib/ice-coverage';
import { trackReportSubmission } from '../lib/analytics';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function NearMePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [showLakeConfirmation, setShowLakeConfirmation] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [lakeSearch, setLakeSearch] = useState('');
  const [lakeSuggestions, setLakeSuggestions] = useState<LakeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lakeSearchError, setLakeSearchError] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const latestSearchId = useRef(0);

  const handleLakeSearchChange = async (value: string) => {
    setLakeSearch(value);
    const searchId = ++latestSearchId.current;

    if (value.trim().length < 2) {
      setLakeSuggestions([]);
      setShowSuggestions(false);
      setLakeSearchError(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLakeSearchError(false);
    try {
      const results = await api.searchLakes(value);
      if (searchId !== latestSearchId.current) return;
      setLakeSuggestions(results.slice(0, 10));
      setShowSuggestions(true);
    } catch (error) {
      console.error('[NearMe] Error searching lakes:', error);
      if (searchId === latestSearchId.current) {
        setLakeSuggestions([]);
        setShowSuggestions(false);
        setLakeSearchError(true);
      }
    } finally {
      if (searchId === latestSearchId.current) setIsSearching(false);
    }
  };

  const handleLakeSelect = (lake: LakeSuggestion) => {
    const lakeName = lake.LakeName || lake.lakeName || '';
    const lat = lake.Latitude ?? lake.latitude;
    const lng = lake.Longitude ?? lake.longitude;

    setLakeSearch(lakeName);
    setShowSuggestions(false);

    if (lat !== undefined && lng !== undefined) {
      router.push(`/map?lake=${encodeURIComponent(lakeName)}&lat=${lat}&lng=${lng}&zoom=12`);
    }
  };

  const handleSubmitReport = async (data: ReportData) => {
    try {
      await api.createReport(data);
      trackReportSubmission(data.lake, data.thickness);
      setNotification({
        message: 'Your report was submitted. Thank you for sharing current conditions.',
        type: 'success'
      });
      setIsSubmitFormOpen(false);
    } catch (error) {
      console.error('[NearMe] Error submitting report:', error);
      setNotification({
        message: error instanceof Error
          ? `Could not submit report: ${error.message}`
          : 'Could not submit report. Please try again.',
        type: 'error'
      });
      throw error;
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
               Ice Thickness Near You
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
                 Search for a Specific Lake
              </h2>
              <div
                ref={searchRef}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <input
                  aria-label="Search for a lake"
                  type="text"
                  value={lakeSearch}
                  onChange={(e) => handleLakeSearchChange(e.target.value)}
                  onFocus={(e) => {
                    // Scroll search box into view on mobile
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
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

                {(showSuggestions || isSearching || lakeSearchError) && lakeSearch.trim().length >= 2 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '2px solid var(--primary-light)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {isSearching && (
                      <div style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                      }}>
                        Searching lakes...
                      </div>
                    )}

                    {!isSearching && lakeSuggestions.length > 0 && lakeSuggestions.map((suggestion, idx) => {
                      const lakeName = suggestion.LakeName || suggestion.lakeName || 'Unknown Lake';
                      const reportCount = suggestion.ReportCount || suggestion.reportCount || 0;
                      const lastReportDate = suggestion.LastReportDate || suggestion.lastReportDate;
                      const distanceKm = suggestion.DistanceKm || suggestion.distanceKm;

                      // Format last report date
                      let lastReportText = '';
                      if (lastReportDate) {
                        const date = new Date(lastReportDate);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 0) {
                          lastReportText = 'Today';
                        } else if (diffDays === 1) {
                          lastReportText = 'Yesterday';
                        } else if (diffDays < 7) {
                          lastReportText = `${diffDays} days ago`;
                        } else if (diffDays < 30) {
                          lastReportText = `${Math.floor(diffDays / 7)} weeks ago`;
                        } else {
                          lastReportText = date.toLocaleDateString();
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLakeSelect(suggestion)}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            textAlign: 'left',
                            border: 'none',
                            borderBottom: idx < lakeSuggestions.length - 1 ? '1px solid #e0e4ea' : 'none',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '1rem' }}>
                            {lakeName}
                          </div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: 'var(--text-secondary)', 
                            marginTop: '0.25rem',
                            display: 'flex',
                            gap: '0.75rem',
                            flexWrap: 'wrap'
                          }}>
                            <span> {reportCount} report{reportCount !== 1 ? 's' : ''}</span>
                            {lastReportText && <span> Last: {lastReportText}</span>}
                            {distanceKm !== undefined && <span> {(distanceKm * 0.621371).toFixed(1)} mi away</span>}
                          </div>
                        </button>
                      );
                    })}

                    {!isSearching && lakeSuggestions.length === 0 && (
                      <div style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {lakeSearchError
                          ? 'Lake search is unavailable right now. Please try again.'
                          : "Don't see your lake listed?"}
                      </div>
                    )}
                  </div>
                )}

                {lakeSearch.trim().length >= 2 && !isSearching && lakeSuggestions.length === 0 && !lakeSearchError && (
                  <p style={{
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Don&apos;t see your lake listed? If you&apos;re at the lake, start a report to add it to the community list.{' '}
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
                      Add your lake
                    </button>
                  </p>
                )}

                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  Try common abbreviations or alternate names too (e.g., &quot;Lake of the Woods&quot; as &quot;LOW&quot;).
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
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Explore reports by state
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                Choose an Upper Midwest state to explore its map. Report coverage depends on community submissions.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem'
              }}>
                {iceCoverageStates.map((state) => (
                  <button
                    key={state.code}
                    type="button"
                    onClick={() => router.push(`/map?lat=${state.latitude}&lng=${state.longitude}&zoom=6`)}
                    style={{
                      minHeight: '48px',
                      padding: '0.75rem',
                      border: '1px solid var(--primary-light)',
                      borderRadius: '0.625rem',
                      background: '#f8fbff',
                      color: 'var(--primary-dark)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {state.name}
                  </button>
                ))}
              </div>
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
                Your location helps center the map. If you submit a report, its coordinates are stored with that public report.
                Don&apos;t enable location or submit a report if you prefer not to share it.
              </p>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    setIsLoadingLocation(true);
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        console.log('Location:', position.coords);
                        const { latitude, longitude } = position.coords;
                        // Send the user straight to the map, centered on their location
                        router.push(`/map?lat=${latitude}&lng=${longitude}&zoom=11`);
                      },
                      (error) => {
                        setIsLoadingLocation(false);
                        let errorMessage = 'Unable to get your location.';
                        if (error.code === error.PERMISSION_DENIED) {
                          errorMessage = 'Location access was denied. Please go into your browser settings and enable location access. We require location data to prevent spam and ensure reports are from actual lake locations.';
                        } else if (error.code === error.POSITION_UNAVAILABLE) {
                          errorMessage = 'Location information is unavailable right now. Please try again in a moment.';
                        } else if (error.code === error.TIMEOUT) {
                          errorMessage = 'Location request timed out. Please check your connection and try again.';
                        }
                        setNotification({ message: errorMessage, type: 'error' });
                      }
                    );
                  } else {
                    setNotification({ message: 'Geolocation is not supported by your browser.', type: 'error' });
                  }
                }}
                disabled={isLoadingLocation}
                style={{
                  background: isLoadingLocation ? 'var(--primary-medium)' : 'var(--primary-dark)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  cursor: isLoadingLocation ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: isLoadingLocation ? 0.8 : 1,
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingLocation) {
                    e.currentTarget.style.background = 'var(--primary-medium)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingLocation) {
                    e.currentTarget.style.background = 'var(--primary-dark)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}>
                {isLoadingLocation && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                )}
                {isLoadingLocation ? 'Getting Location...' : 'Enable Location'}
              </button>
            </div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </section>
      </main>

      <Footer />

      {/* Lake Confirmation Dialog */}
      <Dialog open={showLakeConfirmation} onClose={() => setShowLakeConfirmation(false)} aria-labelledby="lake-confirmation-title" maxWidth="sm" fullWidth>
        <DialogTitle id="lake-confirmation-title">Are you currently at the lake?</DialogTitle>
        <DialogContent>
          <p>Please submit only while physically at the lake you are measuring. GPS coordinates provide location context, but do not independently verify the report or ice conditions.</p>
          <p style={{ marginTop: '1rem' }}>Never venture onto uncertain ice to collect a report.</p>
        </DialogContent>
        <DialogActions sx={{ padding: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button variant="outlined" onClick={() => {
            setShowLakeConfirmation(false);
            setNotification({
              message: 'Please wait until you are physically at the lake before adding a report. Never enter uncertain ice to collect a report.',
              type: 'warning'
            });
          }}>No</Button>
          <Button variant="contained" onClick={() => {
            setShowLakeConfirmation(false);
            setIsSubmitFormOpen(true);
          }}>Yes, I&apos;m at the lake</Button>
        </DialogActions>
      </Dialog>

      {isSubmitFormOpen && (
        <SubmitReportForm
          onClose={() => setIsSubmitFormOpen(false)}
          onSubmit={handleSubmitReport}
        />
      )}

      {/* Notification Toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
