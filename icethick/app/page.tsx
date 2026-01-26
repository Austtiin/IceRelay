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
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const { api } = await import('../lib/api');
      const fetchedReports = await api.getReports();
      
      // Transform API reports to display format
      // Backend returns PascalCase, so we need to handle both cases
      const displayReports = fetchedReports.map((report) => ({
        id: report.Id || report.id || Math.random().toString(),
        lakeName: report.LakeName || report.lakeName || 'Unknown location',
        thickness: report.Thickness || report.thickness,
        timeAgo: getTimeAgo(report.CreatedAt || report.createdAt),
        location: report.Location || report.location,
        quality: report.IceQuality || report.iceQuality || [],
        reportCount: 1, // This would need aggregation in the API
        surfaceType: formatSurfaceType(report.SurfaceType || report.surfaceType),
        isMeasured: report.IsMeasured !== undefined ? report.IsMeasured : report.isMeasured
      }));
      
      setReports(displayReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setNotification({
        message: 'Failed to load reports. Please try again.',
        type: 'error'
      });
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const getTimeAgo = (createdAt?: string | Date): string => {
    if (!createdAt) return 'Just now';
    
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', createdAt);
      return 'Just now';
    }
    
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Debug logging
    console.log('Date comparison:', { 
      createdAt, 
      parsed: date.toISOString(), 
      now: now.toISOString(), 
      diffMs, 
      diffMins, 
      diffHours 
    });
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
      // Import the api client dynamically
      const { api } = await import('../lib/api');
      
      // Create report via API (will retry 3 times automatically)
      await api.createReport(data);
      
      setIsSubmitFormOpen(false);
      
      // Track report submission in analytics
      trackReportSubmission(data.lake || 'Unknown', data.thickness);
      
      // Success notification
      setNotification({
        message: 'Success! Your ice report has been submitted and will help keep the community safe. Thank you!',
        type: 'success'
      });

      // Refresh the reports list to show the new report
      await fetchReports();
    } catch (error) {
      console.error('Failed to submit report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Failed notification
      setNotification({
        message: `Failed to submit report after 3 attempts. ${errorMessage}. Please check your connection and try again.`,
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
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Ice Thickness Across the Midwest
            </h1>
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}>
              Community-reported ice conditions. Real-time data from fellow ice enthusiasts.
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
                onClick={() => setIsSubmitFormOpen(true)}
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
        </section>

        {/* Recent Reports */}
        <section style={{ 
          padding: '4rem 0',
          background: '#fafbfc',
          borderTop: '3px solid var(--primary-light)'
        }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{
              marginBottom: '2.5rem',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--primary-dark)',
                marginBottom: '0.5rem'
              }}>
                Recent Reports
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                Latest ice thickness data from the community
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
                  startIcon={<EditNoteIcon />}
                  onClick={() => setIsSubmitFormOpen(true)}
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
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    href="/near-me"
                    sx={{
                      borderColor: 'primary.dark',
                      color: 'primary.dark',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.dark',
                        color: 'white',
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

        {/* Wave transition */}
        <WaveDivider color="var(--primary-light)" flip={true} />

        {/* Ice Safety Scale - 5 Tiers */}
        <section style={{
          background: 'var(--primary-light)',
          padding: '3rem 0'
        }}>
          <div className="container">
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: 'var(--primary-dark)',
              textAlign: 'center'
            }}>
              ❄️ 5-Tier Ice Safety Scale
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              fontSize: '0.95rem'
            }}>
              General guidelines - always check conditions yourself before venturing out
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {[
                {
                  icon: '🔴',
                  tier: 'Tier 1',
                  thickness: '0-3 inches',
                  activity: 'STAY OFF',
                  color: '#FE5F55',
                  desc: 'Dangerous. Not safe for any activity.'
                },
                {
                  icon: '🟠',
                  tier: 'Tier 2',
                  thickness: '4-6 inches',
                  activity: 'Foot Traffic',
                  color: '#FF8C42',
                  desc: 'Walking only. Test carefully.'
                },
                {
                  icon: '🟡',
                  tier: 'Tier 3',
                  thickness: '7-9 inches',
                  activity: 'Snowmobile',
                  color: '#F7A93D',
                  desc: 'Light vehicles and snowmobiles.'
                },
                {
                  icon: '🟢',
                  tier: 'Tier 4',
                  thickness: '10-12 inches',
                  activity: 'ATV / UTV',
                  color: '#577399',
                  desc: 'ATVs and small groups.'
                },
                {
                  icon: '🔵',
                  tier: 'Tier 5',
                  thickness: '12+ inches',
                  activity: 'Light Truck',
                  color: '#4A90E2',
                  desc: 'Trucks (proceed with extreme caution).'
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
      </main>

      <Footer />

      {isSubmitFormOpen && (
        <SubmitReportForm
          onClose={() => setIsSubmitFormOpen(false)}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}
