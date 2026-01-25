'use client';

import { useState, useEffect } from 'react';

interface SubmitReportFormProps {
  onClose: () => void;
  onSubmit: (data: ReportData) => Promise<void>;
}

export interface ReportData {
  lake: string;
  thickness: number;
  method: string;
  location: string;
  iceQuality: string[];
  notes: string;
  surfaceType: string;
  isMeasured: boolean;
  useGPS: boolean;
  latitude: number;
  longitude: number;
}

// Light normalization for lake names
const normalizeLakeName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Remove double spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Title Case
    .join(' ');
};

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

export default function SubmitReportForm({ onClose, onSubmit }: SubmitReportFormProps) {
  const [formData, setFormData] = useState<ReportData>({
    lake: '',
    thickness: 6,
    method: 'visual',
    location: '',
    iceQuality: [],
    notes: '',
    surfaceType: 'clear',
    isMeasured: false,
    useGPS: false,
    latitude: 0,
    longitude: 0
  });

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          useGPS: true
        }));
        setLocationStatus('success');
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out';
        }
        setLocationError(errorMessage);
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate location is set
    if (formData.latitude === 0 || formData.longitude === 0) {
      setLocationError('Please use your location before submitting');
      setLocationStatus('error');
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Normalize lake name if provided
      const normalizedData = {
        ...formData,
        lake: formData.lake ? normalizeLakeName(formData.lake) : ''
      };
      await onSubmit(normalizedData);
      // Note: Form will be closed by parent on success
    } catch (error) {
      // Error handling is done in parent
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
    onSubmit(normalizedData);
  };

  const toggleIceQuality = (quality: string) => {
    setFormData(prev => ({
      ...prev,
      iceQuality: prev.iceQuality.includes(quality)
        ? prev.iceQuality.filter(q => q !== quality)
        : [...prev.iceQuality, quality]
    }));
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'var(--background)',
        borderRadius: '1rem',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '95vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--primary-dark)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '1rem 1rem 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Submit Ice Report
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          {/* Two column grid for most fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Lake Selection */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.4rem',
                color: 'var(--primary-dark)',
                fontSize: '0.9rem'
              }}>
                Lake Name (Optional)
              </label>
              <input
                type="text"
                value={formData.lake}
                onChange={(e) => setFormData({ ...formData, lake: e.target.value })}
                placeholder="e.g., Lake Minnetonka, Tonka, Local pond..."
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: '2px solid var(--primary-light)',
                  fontSize: '0.95rem',
                  background: 'white'
                }}
              />
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                marginTop: '0.3rem',
                fontStyle: 'italic'
              }}>
                Enter any name you'd like - helps others identify the location
              </p>
            </div>

            {/* Thickness Slider */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.4rem',
                color: 'var(--primary-dark)',
                fontSize: '0.9rem'
              }}>
                Ice Thickness: {formData.thickness}&quot;
              </label>
              <input
                type="range"
                min="0"
                max="35"
                step="0.5"
                value={formData.thickness}
                onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '4px',
                  background: 'var(--primary-light)',
                  outline: 'none'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                marginTop: '0.2rem'
              }}>
                <span>0&quot;</span>
                <span>35&quot;</span>
              </div>
            </div>

            {/* Surface Type */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.4rem',
                color: 'var(--primary-dark)',
                fontSize: '0.9rem'
              }}>
                Surface Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {[
                  { value: 'clear', label: '🧊 Clear', desc: 'Strongest' },
                  { value: 'snow-covered', label: '❄️ Snow', desc: 'Insulated' },
                  { value: 'slush', label: '💧 Slush', desc: 'Weak' },
                  { value: 'refrozen', label: '🔄 Refrozen', desc: 'Variable' }
                ].map((type) => (
                  <label
                    key={type.value}
                    style={{
                      display: 'block',
                      padding: '0.5rem',
                      background: formData.surfaceType === type.value ? 'var(--primary-light)' : 'white',
                      border: `2px solid ${formData.surfaceType === type.value ? 'var(--primary-medium)' : 'var(--primary-light)'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}
                  >
                    <input
                      type="radio"
                      name="surfaceType"
                      value={type.value}
                      checked={formData.surfaceType === type.value}
                      onChange={(e) => setFormData({ ...formData, surfaceType: e.target.value })}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontWeight: formData.surfaceType === type.value ? 600 : 400 }}>
                      {type.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Measurement Method */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                padding: '0.6rem',
                background: formData.isMeasured ? 'var(--primary-light)' : 'white',
                border: `2px solid ${formData.isMeasured ? 'var(--primary-medium)' : 'var(--primary-light)'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.9rem'
              }}
              >
                <input
                  type="checkbox"
                  checked={formData.isMeasured}
                  onChange={(e) => setFormData({ ...formData, isMeasured: e.target.checked })}
                  style={{ marginRight: '0.5rem' }}
                />
                ✅ I drilled/measured it (not just observed)
              </label>
            </div>

            {/* Location with Use My Location Button */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.4rem',
                color: 'var(--primary-dark)',
                fontSize: '0.9rem'
              }}>
                Location <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              
              {/* Use My Location Button */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locationStatus === 'loading'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  background: locationStatus === 'success' ? 'var(--success)' : 'var(--primary-medium)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: locationStatus === 'loading' ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {locationStatus === 'loading' && '⏳ Getting your location...'}
                {locationStatus === 'success' && '✓ Location captured'}
                {locationStatus === 'idle' && '📍 Use My Location'}
                {locationStatus === 'error' && '⚠️ Try Again'}
              </button>

              {/* Show coordinates when captured */}
              {locationStatus === 'success' && (
                <div style={{
                  padding: '0.5rem',
                  background: 'var(--primary-light)',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--primary-dark)',
                  marginBottom: '0.5rem'
                }}>
                  ✓ Latitude: {formData.latitude.toFixed(6)}, Longitude: {formData.longitude.toFixed(6)}
                </div>
              )}

              {/* Error message */}
              {locationStatus === 'error' && locationError && (
                <div style={{
                  padding: '0.5rem',
                  background: '#fee',
                  border: '1px solid var(--danger)',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--danger)',
                  marginBottom: '0.5rem'
                }}>
                  {locationError}
                </div>
              )}

              {/* Optional text location */}
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Optional: Describe spot (West shore, North bay...)"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '0.5rem',
                  border: '2px solid var(--primary-light)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Ice Quality - More compact */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.4rem',
                color: 'var(--primary-dark)',
                fontSize: '0.9rem'
              }}>
                Conditions (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Pressure cracks', 'Foot traffic only', 'ATV broke through'].map((quality) => (
                  <label
                    key={quality}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: formData.iceQuality.includes(quality) ? 'var(--primary-light)' : 'white',
                      border: `2px solid ${formData.iceQuality.includes(quality) ? 'var(--primary-medium)' : 'var(--primary-light)'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.iceQuality.includes(quality)}
                      onChange={() => toggleIceQuality(quality)}
                      style={{ marginRight: '0.4rem' }}
                    />
                    {quality}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: '#FFF3CD',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            border: '2px solid #F7A93D'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#856404' }}>
              ⚠️ Before you submit:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#856404' }}>
              <li>Community signal, not permission</li>
              <li>Does not guarantee safety</li>
              <li>Ice conditions change rapidly</li>
            </ul>
          </didisabled={isSubmitting}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                border: '2px solid var(--primary-medium)',
                background: 'white',
                color: 'var(--primary-medium)',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem',
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: isSubmitting ? '#999' : 'var(--primary-dark)',
                color: 'white',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ 
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #fff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}.65rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'var(--primary-dark)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem'
              }}
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
