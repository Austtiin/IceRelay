'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ReportCard from './components/ReportCard';
import SubmitReportForm, { ReportData } from './components/SubmitReportForm';
import CookieConsent from './components/CookieConsent';
import Notification, { NotificationType } from './components/Notification';
import AdBox from './components/AdBox';
import { trackReportSubmission } from './lib/analytics';

interface NotificationState {
  message: string;
  type: NotificationType;
}

interface Report {
  id: string | number;
  lakeName: string;
  thickness: number;
  timeAgo: string;
  location?: string;
  quality?: string[];
  reportCount: number;
  surfaceType: string;
  isMeasured: boolean;
}

const subscribeToLocation = (onStoreChange: () => void) => {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
};

const getNewReportQuery = () =>
  new URLSearchParams(window.location.search).get('newReport') === 'true';

const getServerNewReportQuery = () => false;

function getTimeAgo(createdAt?: string | Date): string {
  if (!createdAt) return 'Just now';

  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const now = new Date();

  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', createdAt);
    return 'Just now';
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMins = diffMs / 60000;
  const diffHours = diffMins / 60;
  const diffDays = diffHours / 24;

  if (diffMs < 0) {
    console.warn('Report date is in the future:', createdAt);
    return 'Just now';
  }

  if (diffHours < 1) return 'Just now';
  const hours = Math.floor(diffHours);
  const days = Math.floor(diffDays);
  if (diffHours < 24) return `Posted ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `Posted ${days} day${days !== 1 ? 's' : ''} ago`;
}

function formatSurfaceType(type?: string): string {
  if (!type) return 'Unknown';

  const typeMap: Record<string, string> = {
    'clear': 'Clear ice',
    'snow': 'Snow-covered',
    'slush': 'Slush',
    'refrozen': 'Refrozen',
    'snow-covered': 'Snow-covered'
  };

  return typeMap[type.toLowerCase()] || type;
}

export default function Home() {
  const newReportRequested = useSyncExternalStore(
    subscribeToLocation,
    getNewReportQuery,
    getServerNewReportQuery
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [showLakeConfirmation, setShowLakeConfirmation] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const closeSubmitForm = () => {
    setIsSubmitFormOpen(false);
    if (newReportRequested) {
      window.history.replaceState({}, '', window.location.pathname);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      const { api } = await import('../lib/api');
      setIsLoadingReports(true);
      const fetchedReports = await api.getReports();
      
      console.log('[FetchReports] Raw API response:', fetchedReports);
      console.log('[FetchReports] Total reports fetched:', fetchedReports.length);
      
      // Transform API reports to display format
      // Backend returns PascalCase, so we need to handle both cases
      const displayReports = fetchedReports.map((report) => {
        const createdAt = report.CreatedAt || report.createdAt;
        return {
          id: report.Id || report.id || Math.random().toString(),
          lakeName: report.LakeName || report.lakeName || 'Unknown location',
          thickness: report.Thickness || report.thickness,
          timeAgo: getTimeAgo(createdAt),
          createdAt: createdAt,
          location: report.Location || report.location,
          quality: report.IceQuality || report.iceQuality || [],
          reportCount: 1, // This would need aggregation in the API
          surfaceType: formatSurfaceType(report.SurfaceType || report.surfaceType),
          isMeasured: report.IsMeasured !== undefined ? report.IsMeasured : report.isMeasured
        };
      });
      
      console.log('[FetchReports] After mapping:', displayReports);
      
      // Explicitly sort by CreatedAt descending (newest first)
      displayReports.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first (descending)
      });
      
      setReports(displayReports);
    } catch (error) {
      const { ApiUnavailableError } = await import('../lib/api');
      console.warn('[FetchReports] Reports unavailable:', error instanceof Error ? error.message : error);
      setNotification({
        message: error instanceof ApiUnavailableError
          ? 'Ice reports are temporarily unavailable. Please try again shortly.'
          : 'Failed to load reports. Please try again.',
        type: 'error'
      });
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    // The callback yields to async module loading before it updates component state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [fetchReports]);

  const handleNewReportClick = () => {
    setShowLakeConfirmation(true);
  };

  const handleLakeConfirmYes = () => {
    setShowLakeConfirmation(false);
    setIsSubmitFormOpen(true);
  };

  const handleLakeConfirmNo = () => {
    setShowLakeConfirmation(false);
    setNotification({
      message: 'You must be on the lake to submit an accurate report. Please visit the lake and try again.',
      type: 'warning'
    });
  };

  const handleSubmitReport = async (data: ReportData) => {
    try {
      // Validate data before sending
      if (!data.lake || data.lake.trim().length === 0) {
        setNotification({
          message: 'Lake name is required. Please go back and enter a lake name.',
          type: 'error'
        });
        return;
      }

      if (data.thickness <= 0 || data.thickness > 50) {
        setNotification({
          message: 'Ice thickness must be between 0 and 50 inches.',
          type: 'error'
        });
        return;
      }

      if (data.latitude === 0 || data.longitude === 0) {
        setNotification({
          message: 'Location is required. Please enable GPS and try again.',
          type: 'error'
        });
        return;
      }

      // Import the api client dynamically
      const { api } = await import('../lib/api');
      
      console.log('[Submit] Sending report:', data);
      
      // Create report via API (will retry 3 times automatically)
      await api.createReport(data);
      
      console.log('[Submit] Report created successfully');
      
      // Track report submission in analytics
      trackReportSubmission(data.lake || 'Unknown', data.thickness);
      
      // Play success sound
      try {
        const audio = new Audio('/ding-101377.mp3');
        audio.play().catch(err => console.log('Audio play failed:', err));
      } catch (err) {
        console.log('Audio creation failed:', err);
      }
      
      // Success notification - set BEFORE closing form
      setNotification({
        message: 'Success! Your ice report has been submitted and will help keep the community safe. Thank you!',
        type: 'success'
      });
      
      // Close form after a brief delay to ensure notification is set
      setTimeout(() => {
        setIsSubmitFormOpen(false);
      }, 100);

      // Refresh the reports list to show the new report
      console.log('[Submit] Refreshing reports list');
      await fetchReports();
    } catch (error) {
      console.error('[Submit] Failed to submit report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Parse error message for user-friendly display
      let userMessage = 'Failed to submit report. Please try again.';
      
      if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'Request timed out. Please check your connection and try again.';
      } else if (errorMessage.includes('Database')) {
        userMessage = 'Server error. Please try again in a few moments.';
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        userMessage = `Invalid data: ${errorMessage}. Please check your inputs.`;
      }
      
      // Failed notification
      setNotification({
        message: userMessage,
        type: 'error'
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CookieConsent />
      
      {/* Notification Toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => setIsSubmitFormOpen(true)}
      />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => setIsSubmitFormOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="home-hero" aria-labelledby="home-title">
          <Image
            src="/HomeHero.jpg"
            alt=""
            fill
            sizes="100vw"
            preload
            className="home-hero-image"
          />
          <div className="home-hero-overlay" aria-hidden="true" />
          
          <div className="container home-hero-content" style={{ position: 'relative', zIndex: 3 }}>
            <p className="home-hero-eyebrow">ICE RELAY · UPPER MIDWEST</p>
            <h1 id="home-title" className="home-hero-title" style={{
              fontSize: '3.25rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '-0.035em'
            }}>
              Community ice thickness reports for your local lakes.
            </h1>
            <p className="home-hero-description">
              Explore recent, community-submitted observations from lakes across the Upper Midwest. Reports are unverified and are not a measure of ice safety.
            </p>
            <div className="home-hero-actions" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-start',
              flexWrap: 'wrap'
            }}>
              <Button
                variant="contained"
                size="large"
                href="/near-me"
                sx={{
                  bgcolor: 'white',
                  color: '#18364f',
                  borderRadius: '0.5rem',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#eaf2f8',
                    boxShadow: 'none',
                  },
                }}
              >
                Search your lake
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleNewReportClick}
                sx={{
                  borderColor: 'rgba(255,255,255,0.65)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  bgcolor: 'transparent',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Share an observation
              </Button>
            </div>
          </div>
          
        </section>

        <section className="home-introduction" aria-labelledby="community-heading">
          <div className="container home-introduction-content">
            <div>
              <h2 id="community-heading">A community resource for the winter season</h2>
              <p>
                Ice Relay brings together recent ice thickness observations from lakes across
                the Upper Midwest. Search for a lake, explore nearby reports, and learn what
                other visitors have observed.
              </p>
              <Link href="/about/">Learn about Ice Relay</Link>
            </div>
            <div>
              <h2>Don&apos;t see your lake listed?</h2>
              <p>
                Start by adding your lake for the community. Share a firsthand observation
                through the report form when you are at the lake. Never venture onto
                uncertain ice to collect a report.
              </p>
              <button type="button" onClick={handleNewReportClick}>Add your lake with a report</button>
            </div>
          </div>
        </section>

        {/* User-Submitted Disclaimer Banner */}
        <section style={{ 
          padding: '2.5rem 0 2rem',
          background: '#fafbfc',
          position: 'relative'
        }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="safety-note" style={{
              background: '#edf4f8',
              border: '1px solid #d5e3ec',
              borderLeft: '4px solid #577399',
              borderRadius: '0.5rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem'
            }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#274d6b',
                  marginBottom: '0.4rem'
                }}>
                  Use reports as context—not a safety assessment
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#3e5363',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Observations are unverified, can become outdated, and may vary across a lake. Check current local guidance and conditions; no ice is completely safe.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{
          padding: '3.5rem 0 4rem',
          background: 'white'
        }}>
          <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
            <div style={{
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--primary-dark)',
                marginBottom: '0.5rem'
              }}>
                Recent Reports
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Latest community-submitted observations
              </p>
            </div>

            {isLoadingReports ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <CircularProgress 
                  size={60} 
                  thickness={4}
                  sx={{ 
                    color: 'var(--primary-main)',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }} 
                />
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ fontSize: '1.1rem' }}
                >
                  Loading ice reports...
                </Typography>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No reports yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Be the first to submit an ice thickness report!
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleNewReportClick}
                >
                  Submit First Report
                </Button>
              </div>
            ) : (
              <>
                <div className="home-report-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {reports.slice(0, 6).map(report => (
                    <ReportCard
                      key={report.id}
                      lakeName={report.lakeName}
                      thickness={report.thickness}
                      timeAgo={report.timeAgo}
                      location={report.location}
                      quality={report.quality}
                      reportCount={report.reportCount}
                      surfaceType={report.surfaceType}
                      isMeasured={report.isMeasured}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    href="/near-me"
                    sx={{
                      bgcolor: 'var(--primary-medium)',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: 'var(--primary-dark)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    View All Reports Near Me
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Safety resources */}
        <section style={{
          background: '#f3f6f8',
          padding: '3rem 0',
          position: 'relative'
        }}>
          <div className="container">
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: 'var(--primary-dark)',
              textAlign: 'center'
            }}>
              Ice safety starts with local guidance
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              fontSize: '0.95rem'
            }}>
              There is no single thickness that makes every body of water or activity safe.
            </p>
            <div style={{
              maxWidth: '760px',
              margin: '0 auto',
              padding: '1.5rem',
              borderRadius: '1rem',
              background: 'white',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <p style={{ lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Ice Relay reports are community-submitted observations, not safety assessments. Ice strength
                changes across a lake and depends on factors beyond a single thickness reading. Check current
                guidance from the local natural-resources agency, inspect conditions yourself, and stay off
                when uncertain.
              </p>
              <Button variant="contained" href="/safety-guide">
                Review ice safety guidance
              </Button>
              <p style={{ marginTop: '1rem', lineHeight: 1.7 }}>
                For Minnesota ice safety and ice thickness guidance, start with the{' '}
                <a href="https://www.dnr.state.mn.us/safety/ice/index.html" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>
                  Minnesota Department of Natural Resources (MN DNR)
                </a>.
                {' '}Ice Relay is an independent community project, not a DNR service or endorsement.
              </p>
            </div>
          </div>
        </section>

        {/* Support Ad near bottom of page */}
        <section style={{ 
          background: '#fafbfc', 
          padding: '2rem 0 3rem'
        }}>
          <div className="container" style={{ maxWidth: '900px', display: 'flex', justifyContent: 'center' }}>
            <AdBox />
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
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'var(--primary-dark)',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              Are you currently on the lake?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}
            >
              Please submit only while you are physically at the lake you are measuring. GPS coordinates provide location context, but do not independently verify the report or ice conditions.
            </Typography>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleLakeConfirmNo}
                sx={{ minWidth: '120px' }}
              >
                No
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleLakeConfirmYes}
                sx={{ minWidth: '120px' }}
              >
                Yes, I&apos;m on the lake
              </Button>
            </div>
          </div>
        </div>
      )}

      {(isSubmitFormOpen || newReportRequested) && (
        <SubmitReportForm
          onClose={closeSubmitForm}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}
