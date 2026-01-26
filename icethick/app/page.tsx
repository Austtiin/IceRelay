'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
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
  const [showLakeConfirmation, setShowLakeConfirmation] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  
  // Lake search state
  const [lakeSearch, setLakeSearch] = useState('');
  const [lakeSuggestions, setLakeSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
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

  // Lake search handler
  const handleLakeSearchChange = async (value: string) => {
    setLakeSearch(value);
    
    if (value.trim().length < 2) {
      setLakeSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const { api } = await import('../lib/api');
      const results = await api.searchLakes(value);
      setLakeSuggestions(results.slice(0, 10));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching lakes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLakeSelect = (lake: any) => {
    setLakeSearch(lake.LakeName || lake.lakeName);
    setShowSuggestions(false);
    // Navigate to map view with this lake selected
    window.location.href = `/map?lake=${encodeURIComponent(lake.LakeName || lake.lakeName)}&lat=${lake.Latitude || lake.latitude}&lng=${lake.Longitude || lake.longitude}`;
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeAgo = (createdAt?: string | Date): string => {
    if (!createdAt) return 'Just now';
    
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', createdAt);
      return 'Just now';
    }
    
    // Calculate time difference (positive = past, negative = future)
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

        {/* Recent Reports */}
        <section style={{ 
          padding: '4rem 0 5rem',
          background: '#fafbfc'
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
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}>
                Latest ice thickness data from the community
              </p>
              
              {/* Lake Search */}
              <div ref={searchRef} style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                <TextField
                  fullWidth
                  placeholder="Search for a specific lake..."
                  value={lakeSearch}
                  onChange={(e) => handleLakeSearchChange(e.target.value)}
                  onFocus={() => lakeSuggestions.length > 0 && setShowSuggestions(true)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'var(--text-secondary)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--border-color)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--primary-main)',
                      },
                    }
                  }}
                />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && lakeSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '4px'
                  }}>
                    {lakeSuggestions.map((lake, index) => {
                      const lakeName = lake.LakeName || lake.lakeName;
                      const reportCount = lake.ReportCount || lake.reportCount || 0;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleLakeSelect(lake)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            textAlign: 'left',
                            border: 'none',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            borderBottom: index < lakeSuggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>
                            {lakeName}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {reportCount} report{reportCount !== 1 ? 's' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Can't find lake message */}
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginTop: '1rem'
              }}>
                Can't see what you're looking for?{' '}
                <Button
                  size="small"
                  onClick={handleNewReportClick}
                  sx={{
                    textTransform: 'none',
                    padding: '0',
                    minWidth: 'auto',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Consider adding the lake/report you're measuring ice thickness
                </Button>
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
              To ensure accurate ice thickness reports, you must be physically present on the lake where you're measuring. This helps maintain the reliability of our data for the community.
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
