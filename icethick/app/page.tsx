'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ReportCard from './components/ReportCard';
import SubmitReportForm, { ReportData } from './components/SubmitReportForm';
import CookieConsent from './components/CookieConsent';
import Notification, { NotificationType } from './components/Notification';
import { trackReportSubmission } from './lib/analytics';
import { iceCoverageStates } from '../lib/ice-coverage';

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
  notes?: string;
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
  const [reportsError, setReportsError] = useState(false);

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
      setReportsError(false);
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
          notes: report.Notes || report.notes,
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
      setReportsError(true);
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
      message: 'Only share firsthand observations while at the lake. Never make a trip onto uncertain ice to collect a report.',
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
        message: 'Your report has been submitted. Thank you for helping others understand what you observed.',
        type: 'success'
      });
      
      // Close form after a brief delay to ensure notification is set
      setTimeout(() => {
        closeSubmitForm();
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
      throw error;
    }
  };

  return (
    <div className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <h1 id="home-title" className="home-hero-title" style={{
              fontSize: '3.25rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              letterSpacing: '-0.035em'
            }}>
              Local ice reports.<br />Shared winter knowledge.
            </h1>
            <p className="home-hero-description">
              Find community ice thickness reports across the Upper Midwest, or pass along
              a firsthand measurement from your lake. Every report adds local context.
              Reports are unverified, not a measure of ice safety.
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
                onClick={handleNewReportClick}
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
                Share a report
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="/near-me/"
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
                Find your lake
              </Button>
            </div>
          </div>
          
        </section>

        <nav className="home-wayfinding" aria-label="Homepage sections">
          <div className="container">
            <a href="#recent-reports">Recent observations</a>
            <a href="#region-heading">Explore your state</a>
            <a href="#contribution-heading">Help your community</a>
            <a href="#home-resources-heading">Reporting resources</a>
          </div>
        </nav>

        <section className="home-introduction" aria-labelledby="community-heading">
          <div className="container home-introduction-content">
            <div>
              <h2 id="community-heading">Built around lakes. Powered by people.</h2>
              <p>
                Winter observations are often scattered across conversations and local forums.
                Ice Relay gives them a shared home: lake names, locations, thickness readings,
                and notes that other visitors can explore together.
              </p>
              <Link href="/about/">Learn about Ice Relay</Link>
            </div>
            <div>
              <h2>Your report could be the first.</h2>
              <p>
                You don&apos;t need an account or an existing lake listing. If you are already
                at a lake and have a firsthand measurement, share the reading with local conditions.
                Never venture onto uncertain ice to collect a report.
              </p>
              <Link href="/contribute/">Learn how to make a useful report</Link>
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
              borderRadius: '0.5rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem'
            }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#274d6b',
                  marginBottom: '0.4rem'
                }}>
                  Use reports as context—not a safety assessment
                </h2>
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

        <section id="recent-reports" aria-labelledby="recent-reports-heading" style={{
          padding: '3.5rem 0 4rem',
          background: 'white'
        }}>
          <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
            <div style={{
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h2 id="recent-reports-heading" style={{
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
              <Link href="/map/" className="text-link">Explore the report map</Link>
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
            ) : reportsError ? (
              <div className="reports-status" role="status">
                <h3>Reports are temporarily unavailable</h3>
                <p>We couldn&apos;t reach the report service. This does not mean there are no reports or that any lake is safe.</p>
                <Button variant="outlined" onClick={fetchReports}>Try loading reports again</Button>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Typography component="h3" variant="h6" color="text.secondary" gutterBottom>
                  No reports yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Already at a lake with a firsthand observation? Help start the community record. Never go onto uncertain ice to make a report.
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
                      notes={report.notes}
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
                    Find more lake reports
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="site-section region-section" aria-labelledby="region-heading">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <h2 id="region-heading">Explore the Upper Midwest</h2>
                <p>Choose a state to move the map. Coverage grows with community submissions, not every lake has a report.</p>
              </div>
              <Link href="/near-me/" className="text-link">Search by lake name</Link>
            </div>
            <ul className="region-links">
              {iceCoverageStates.map((state) => (
                <li key={state.code}>
                  <Link href={`/map/?lat=${state.latitude}&lng=${state.longitude}&zoom=6`}>
                    {state.name}<span>Explore reports</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="site-section contribution-section" aria-labelledby="contribution-heading">
          <div className="container contribution-layout">
            <div>
              <h2 id="contribution-heading">Pass your observation along.</h2>
              <p>The map is only as useful as the people who contribute. A report from an overlooked lake or a fresh observation from a familiar one helps others see what has been reported.</p>
              <div className="site-actions">
                <button className="site-button" type="button" onClick={handleNewReportClick}>Share a report</button>
                <Link href="/contribute/" className="text-link">Read the reporting guide</Link>
              </div>
              <p className="contribution-caution">Only report what you observed firsthand. Never take a risk to contribute.</p>
            </div>
            <ol className="reporting-steps">
              <li><h3>Identify the lake and location</h3><p>Enable location access at the lake and confirm the lake name.</p></li>
              <li><h3>Describe what you observed</h3><p>Include thickness, measurement method, surface conditions, and useful notes.</p></li>
              <li><h3>Review before sharing</h3><p>Keep it factual. An observation describes one place and time, not a whole lake.</p></li>
            </ol>
          </div>
        </section>

        <section className="site-section home-resources" aria-labelledby="home-resources-heading">
          <div className="container home-resource-layout">
            <div>
              <h2 id="home-resources-heading">More context.<br />Better contributions.</h2>
              <p>Start with a measurement, read the whole observation, and keep its limits in mind. These guides help you make sense of community ice reports.</p>
              <Link href="/resources/" className="text-link">All ice reporting resources</Link>
            </div>
            <ul className="home-resource-list">
              <li><h3><Link href="/contribute/">Help report ice thickness near you</Link></h3><p>A practical guide to GPS, lake names, measurements, and useful notes. No account required.</p></li>
              <li><h3><Link href="/community-ice-reports/">Understand self-reported ice conditions</Link></h3><p>Location, age, and surface conditions matter. A community observation is not a safety rating.</p></li>
              <li><h3><Link href="/report-poor-ice-conditions/">Include poor ice conditions</Link></h3><p>Describe thin ice, cracks, and slush without making a lake-wide claim or taking a risk to report.</p></li>
            </ul>
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

        <section className="site-section home-questions" aria-labelledby="home-questions-heading">
          <div className="container">
            <h2 id="home-questions-heading">Before you look at the map</h2>
            <div className="guide-faq">
              <details><summary>How do I find ice thickness reports near me?</summary><p>Use <Link href="/near-me/">lake search</Link> or the <Link href="/map/">report map</Link>. Search results depend on submitted reports, not a complete list of lakes. No report does not mean safe ice.</p></details>
              <details><summary>Can I add a lake that is not listed?</summary><p>Yes. If you are already at the lake with a firsthand measurement, enter the lake name in the report form and confirm your GPS location. Never go onto uncertain ice just to contribute.</p></details>
              <details><summary>Can I report thin ice or other concerns?</summary><p>You can add condition labels and notes to a measured thickness report. The form is not a hazard-only alert or emergency service. Read our <Link href="/report-poor-ice-conditions/">poor ice reporting guide</Link> for its limits.</p></details>
              <details><summary>Are these official or verified ice reports?</summary><p>No. Ice Relay is an independent community project. Reports are unverified and do not determine whether ice is safe. Consult <Link href="/safety-guide/">current official guidance</Link> and stay off when uncertain.</p></details>
            </div>
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
          <Button variant="outlined" onClick={handleLakeConfirmNo}>No</Button>
          <Button variant="contained" onClick={handleLakeConfirmYes}>Yes, I&apos;m at the lake</Button>
        </DialogActions>
      </Dialog>

      {(isSubmitFormOpen || newReportRequested) && (
        <SubmitReportForm
          onClose={closeSubmitForm}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}
