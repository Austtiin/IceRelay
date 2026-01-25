'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ReportCard from './components/ReportCard';
import SubmitReportForm, { ReportData } from './components/SubmitReportForm';
import DisclaimerModal from './components/DisclaimerModal';
import WaveDivider from './components/WaveDivider';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [reports, setReports] = useState([
    {
      id: 1,
      lakeName: 'Lake Minnetonka',
      thickness: 5.5,
      timeAgo: '2 hours ago',
      location: 'West shore',
      quality: ['Foot traffic only'],
      reportCount: 3,
      surfaceType: 'Clear ice',
      isMeasured: true
    },
    {
      id: 2,
      lakeName: 'White Bear Lake',
      thickness: 11,
      timeAgo: '5 hours ago',
      location: 'East bay',
      quality: [],
      reportCount: 2,
      surfaceType: 'Snow-covered',
      isMeasured: true
    },
    {
      id: 3,
      lakeName: 'Lake Calhoun (Bde Maka Ska)',
      thickness: 3,
      timeAgo: '2 days ago',
      location: 'Center',
      quality: ['Pressure cracks'],
      reportCount: 1,
      surfaceType: 'Slush',
      isMeasured: false
    },
    {
      id: 4,
      lakeName: 'Lake Harriet',
      thickness: 9,
      timeAgo: '3 hours ago',
      location: 'North shore',
      quality: [],
      reportCount: 4,
      surfaceType: 'Clear ice',
      isMeasured: true
    },
    {
      id: 5,
      lakeName: 'Como Lake',
      thickness: 13,
      timeAgo: '8 hours ago',
      location: 'South side',
      quality: [],
      reportCount: 2,
      surfaceType: 'Refrozen',
      isMeasured: true
    }
  ]);

  const handleSubmitReport = (data: ReportData) => {
    const newReport = {
      id: reports.length + 1,
      lakeName: data.lake,
      thickness: data.thickness,
      timeAgo: 'Just now',
      location: data.useGPS ? 'GPS location' : (data.location || 'Not specified'),
      quality: data.iceQuality,
      reportCount: 1,
      surfaceType: data.surfaceType,
      isMeasured: data.isMeasured
    };
    setReports([newReport, ...reports]);
    setIsSubmitFormOpen(false);
    alert('✅ Thank you! Your ice report helps the community stay safe.');
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
      <DisclaimerModal />
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
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
                startIcon={<AddIcon />}
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
                fontSize: '1rem'
              }}>
                Latest ice thickness data from the community
              </p>
            </div>

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
