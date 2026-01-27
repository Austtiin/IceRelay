'use client';

import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ReportCard from './components/ReportCard';
import SubmitReportForm, { ReportData } from './components/SubmitReportForm';
import CookieConsent from './components/CookieConsent';
import WaveDivider from './components/WaveDivider';
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

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [showLakeConfirmation, setShowLakeConfirmation] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Check for newReport URL parameter to auto-open form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('newReport') === 'true') {
      setIsSubmitFormOpen(true);
      // Clean up URL without page reload
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const { api } = await import('../lib/api');
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
      console.error('[FetchReports] Error fetching reports:', error);
      setNotification({
        message: 'Failed to load reports. Please try again.',
        type: 'error'
      });
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

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

  const getTimeAgo = (createdAt?: string | Date): string => {
    if (!createdAt) return 'Just now';
    
    // Parse the date assuming it's UTC (from database)
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    
    // Get current time in CST (UTC-6 or UTC-5 depending on DST)
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', createdAt);
      return 'Just now';
    }
    
    // Calculate time difference (both dates are in local browser time)
    const diffMs = now.getTime() - date.getTime();
    const diffMins = diffMs / 60000;
    const diffHours = diffMins / 60;
    const diffDays = diffHours / 24;
    
    // Handle future dates (shouldn't happen but log if it does)
    if (diffMs < 0) {
      console.warn('Report date is in the future:', createdAt);
      return 'Just now';
    }
    
    // If less than 1 hour, show "Just now"
    if (diffHours < 1) return 'Just now';
    const hours = Math.floor(diffHours);
    const days = Math.floor(diffDays);
    if (diffHours < 24) return `Posted ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `Posted ${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const formatSurfaceType = (type?: string): string => {
    if (!type) return 'Unknown';
    
    const typeMap: Record<string, string> = {
      'clear': 'Clear ice',
      'snow': 'Snow-covered',
      'slush': 'Slush',
      'refrozen': 'Refrozen',
      'snow-covered': 'Snow-covered'
    };
    return typeMap[type.toLowerCase()] || type;
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

  const stats = {
    danger: reports.filter(r => r.thickness < 4).length,
    foot: reports.filter(r => r.thickness >= 4 && r.thickness < 7).length,
    snowmobile: reports.filter(r => r.thickness >= 7 && r.thickness < 10).length,
    atv: reports.filter(r => r.thickness >= 10 && r.thickness < 12).length,
    truck: reports.filter(r => r.thickness >= 12).length
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
        <section style={{
          position: 'relative',
          backgroundImage: 'url(/HomeHero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '6rem 0',
          color: 'white',
          textAlign: 'center',
          overflow: 'hidden'
        }}>
          {/* Gradient fade at top to blend with navbar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, transparent 100%)',
            zIndex: 1
          }} />
          
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
          
          <div className="container" style={{ position: 'relative', zIndex: 3 }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Safe Ice Thickness Near You
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}>
              Current ice conditions and ice fishing safety reports from Minnesota and Midwest lakes. Check ice thickness before you go.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LocationOnIcon />}
                href="/near-me"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.dark',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                View Ice Near Me
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<EditNoteIcon />}
                onClick={handleNewReportClick}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'white',
                    color: 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                New Report
              </Button>
            </div>
          </div>
          
          {/* Wave transition at bottom of hero */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2
          }}>
            <WaveDivider color="white" flip={true} />
          </div>
        </section>

        {/* User-Submitted Disclaimer Banner */}
        <section style={{ 
          padding: '2.5rem 0 2rem',
          background: '#fafbfc',
          position: 'relative'
        }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{
              background: 'rgba(254, 95, 85, 0.08)',
              border: '2px solid var(--accent-danger)',
              borderRadius: '1rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--accent-danger)',
                  marginBottom: '0.4rem'
                }}>
                  All Reports Are User-Submitted
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Ice conditions are reported by community members and cannot be independently verified. 
                  <strong> Always measure ice thickness yourself before venturing out.</strong> Ice conditions 
                  vary greatly across a single lake and can change rapidly. <strong>No ice is 100% safe.</strong> Your 
                  safety is your responsibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Reports + Support Ads - Pin Board Theme */}
        <section style={{ 
          padding: '4rem 0 5rem',
          backgroundImage: 'url(/pin-board-4301129_1920.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}>
          <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
            <div style={{
              marginBottom: '2.5rem',
              textAlign: 'center',
              paddingTop: '3rem'
            }}>
              {/* Green sticky note */}
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #d4f4dd 0%, #a8e6cf 100%)',
                padding: '1.5rem 3rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                transform: 'rotate(-1deg)',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                {/* Sticky note shadow/fold effect */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '0',
                  height: '0',
                  borderLeft: '20px solid transparent',
                  borderBottom: '20px solid rgba(0,0,0,0.1)',
                  transform: 'rotate(90deg) translate(10px, 10px)'
                }} />
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#2d5016',
                  marginBottom: '0.5rem',
                  margin: 0
                }}>
                  Recent Reports
                </h2>
                <p style={{ 
                  color: '#3d6b1f',
                  fontSize: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  Latest ice thickness data from the community
                </p>
              </div>
            </div>

            {/* Small ad box to help keep the site free */}
            <div style={{ margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
              <AdBox />
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
                  startIcon={<EditNoteIcon />}
                  onClick={handleNewReportClick}
                >
                  Submit First Report
                </Button>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                  {/* Yellow sticky note style for button */}
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #fff59d 0%, #ffeb3b 100%)',
                    padding: '0.5rem',
                    transform: 'rotate(1deg)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
                    position: 'relative',
                    border: '1px solid rgba(0,0,0,0.05)',
                    marginTop: '1rem'
                  }}>
                    {/* Thumbtack at top */}
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '20px',
                      background: 'radial-gradient(circle, #2196F3 0%, #1976D2 70%)',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)',
                      border: '2px solid #1565C0'
                    }} />
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    href="/near-me"
                    sx={{
                      bgcolor: '#2196F3',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#1976D2',
                        boxShadow: 'none',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    View All Reports Near Me
                  </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Clean Ice-Themed Transition */}
        <div style={{
          height: '60px',
          background: 'linear-gradient(to bottom, #e8e8e8 0%, rgba(189, 213, 234, 0.3) 50%, var(--primary-light) 100%)'
        }} />

        {/* Ice Safety Scale - 5 Tiers */}
        <section style={{
          background: 'var(--primary-light)',
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
              ❄️ Minnesota Ice Safety Guidelines
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              fontSize: '0.95rem'
            }}>
              Official Minnesota recommendations - always check conditions yourself before venturing out
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {[
                {
                  icon: '🔴',
                  tier: 'Danger',
                  thickness: '< 4"',
                  activity: 'KEEP OFF',
                  color: '#FE5F55',
                  desc: 'Ice is too thin. Stay off completely.'
                },
                {
                  icon: '🟠',
                  tier: 'Foot Traffic',
                  thickness: '4"',
                  activity: 'On Foot / Portables',
                  color: '#FF8C42',
                  desc: 'Walking and ice fishing with portables only.'
                },
                {
                  icon: '🟡',
                  tier: 'Snowmobile',
                  thickness: '5-7"',
                  activity: 'Snowmobile',
                  color: '#F7A93D',
                  desc: 'Snowmobiles and light recreation.'
                },
                {
                  icon: '🟢',
                  tier: 'ATV/Side-by-Side',
                  thickness: '7-8"',
                  activity: 'ATV / UTV',
                  color: '#2ECC71',
                  desc: 'ATVs and side-by-side vehicles.'
                },
                {
                  icon: '🔵',
                  tier: 'Car/Skid House',
                  thickness: '9-12"',
                  activity: 'Car / Small Vehicle',
                  color: '#577399',
                  desc: 'Cars and small ice houses.'
                },
                {
                  icon: '🟣',
                  tier: 'Truck',
                  thickness: '13-17"',
                  activity: 'Pickup Truck',
                  color: '#4A90E2',
                  desc: 'Pickup trucks and medium vehicles.'
                },
                {
                  icon: '⚫',
                  tier: 'Heavy Duty',
                  thickness: '20+"',
                  activity: 'Heavy Truck + House',
                  color: '#2C3E50',
                  desc: 'Heavy duty trucks with large ice houses.'
                }
              ].map((tier, index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  borderLeft: `4px solid ${tier.color}`
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{tier.icon}</div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: tier.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}>
                    {tier.tier}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 700, 
                    marginBottom: '0.25rem',
                    color: 'var(--primary-dark)'
                  }}>
                    {tier.activity}
                  </h3>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    {tier.thickness}
                  </div>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    {tier.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <WaveDivider color="#fafbfc" flip={true} />

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
              To ensure accurate ice thickness reports, you must be physically present on the lake where you're measuring. We capture your GPS location with each report so we can verify you are actually on the lake and keep the data trustworthy for everyone.
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
                Yes, I'm on the lake
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSubmitFormOpen && (
        <SubmitReportForm
          onClose={() => setIsSubmitFormOpen(false)}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}
