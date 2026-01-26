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
        onNewReport={() => {}}
      />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => setIsSubmitFormOpen(true)}
      />

      <main style={{ flex: 1, background: '#fafbfc' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%)',
          padding: '3rem 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="container">
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

        {/* Lake Selection */}
        <section style={{ padding: '3rem 0 1.5rem 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '2rem'
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
                gap: '1rem',
                alignItems: 'center'
              }}>
                <select
                  value={selectedLake}
                  onChange={(e) => setSelectedLake(e.target.value)}
                  style={{
                    flex: 1,
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
                    background: selectedLake ? 'var(--primary-dark)' : '#ccc',
                    color: 'white',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: selectedLake ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
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
        <section style={{ padding: '0 0 3rem 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{
              background: 'white',
              padding: '3rem 2rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📍</div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--primary-dark)',
                marginBottom: '1rem'
              }}>
                Enable Location Access
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                lineHeight: '1.6'
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

              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                <strong>Coming Soon:</strong> Interactive map view, distance-based filtering, 
                and real-time API integration
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder for Future Map */}
        <section style={{ padding: '0 0 3rem 0' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{
              background: 'white',
              padding: '3rem 2rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              border: '2px dashed #e9ecef'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                marginBottom: '0.5rem'
              }}>
                Interactive Map Coming Soon
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                View all reports on an interactive map with heatmap visualization
              </p>
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
