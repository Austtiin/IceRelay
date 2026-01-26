'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SubmitReportForm from '../components/SubmitReportForm';

const MINNESOTA_LAKES = [
  'Lake Minnetonka',
  'White Bear Lake',
  'Lake Calhoun (Bde Maka Ska)',
  'Lake Harriet',
  'Lake of the Isles',
  'Lake Nokomis',
  'Cedar Lake',
  'Medicine Lake',
  'Lake Phalen',
  'Como Lake',
  'Bald Eagle Lake',
  'Forest Lake',
  'Prior Lake',
  'Lake Elmo',
  'Square Lake'
];

export default function NearMePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [selectedLake, setSelectedLake] = useState('');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => setIsSubmitFormOpen(true)}
      />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => setIsSubmitFormOpen(true)}
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
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <select
                  value={selectedLake}
                  onChange={(e) => setSelectedLake(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--primary-light)',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="">Select a lake...</option>
                  {MINNESOTA_LAKES.map(lake => (
                    <option key={lake} value={lake}>{lake}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedLake) {
                      console.log('Searching for:', selectedLake);
                      // TODO: Fetch reports for selected lake from API
                      alert(`Showing reports for ${selectedLake}`);
                    } else {
                      alert('Please select a lake first');
                    }
                  }}
                  disabled={!selectedLake}
                  style={{
                    width: '100%',
                    background: selectedLake ? 'var(--primary-dark)' : '#ccc',
                    color: 'white',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: selectedLake ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLake) {
                      e.currentTarget.style.background = 'var(--primary-medium)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLake) {
                      e.currentTarget.style.background = 'var(--primary-dark)';
                    }
                  }}
                >
                  Search
                </button>
              </div>
              <p style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                Select any lake to view ice thickness reports for that specific location
              </p>
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
                        // TODO: Fetch reports from API based on location
                      },
                      (error) => {
                        alert('Unable to get location. Please enable location services.');
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
