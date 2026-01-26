'use client';

import { useState, useEffect } from 'react';
import { trackLocationUsage, trackLakeSearch } from '../lib/analytics';

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

interface LakeSuggestion {
  lakeName?: string;
  LakeName?: string;  // API returns PascalCase
  latitude: number;
  Latitude?: number;  // API returns PascalCase
  longitude: number;
  Longitude?: number;  // API returns PascalCase
  reportCount: number;
  ReportCount?: number;  // API returns PascalCase
  distanceKm?: number;
  DistanceKm?: number;  // API returns PascalCase
  lastReportDate?: string;
  LastReportDate?: string;  // API returns PascalCase
}

// Text sanitization utility
const sanitizeText = (text: string, fieldName: string = 'text'): string => {
  if (!text) return text;
  
  let cleaned = text;
  
  // Remove special characters and excessive symbols (keep basic punctuation and spaces)
  cleaned = cleaned.replace(/[^a-zA-Z0-9 .,!?'-]/g, '');
  
  // Limit consecutive special characters
  cleaned = cleaned.replace(/[.,!?'-]{3,}/g, (match) => match.substring(0, 2));
  
  // Fix ALL CAPS (if more than 70% of letters are uppercase and length > 10, convert to title case)
  const letters = cleaned.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 10) {
    const uppercase = cleaned.replace(/[^A-Z]/g, '').length;
    const ratio = uppercase / letters.length;
    if (ratio > 0.7) {
      // Convert to title case
      cleaned = cleaned.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }
  
  // Remove excessive spaces (3 or more spaces)
  cleaned = cleaned.replace(/\s{3,}/g, '  ');
  
  // Trim only at start and end
  cleaned = cleaned.trim();
  
  // Basic profanity filter (simple word list - expand as needed)
  const profanityList = ['fuck', 'shit', 'damn', 'ass', 'bitch', 'crap'];
  profanityList.forEach(badWord => {
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '*'.repeat(badWord.length));
  });
  
  return cleaned;
};

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

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [detectedLake, setDetectedLake] = useState<LakeSuggestion | null>(null);
  const [lakeConfirmed, setLakeConfirmed] = useState<boolean | null>(null); // null = not answered, true = yes, false = no
  const [lakeSuggestions, setLakeSuggestions] = useState<LakeSuggestion[]>([]);
  const [showLakeSuggestions, setShowLakeSuggestions] = useState<boolean>(false);
  const [isSearchingLakes, setIsSearchingLakes] = useState<boolean>(false);
  const [isDetectingLake, setIsDetectingLake] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const steps = [
    { number: 1, title: 'Location', description: 'Set your GPS location' },
    { number: 2, title: 'Lake', description: 'Identify the lake' },
    { number: 3, title: 'Ice Details', description: 'Thickness & surface' },
    { number: 4, title: 'Additional Info', description: 'Quality & notes' },
    { number: 5, title: 'Review', description: 'Confirm & submit' }
  ];

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('[Location] GPS Position obtained:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          useGPS: true
        }));
        setLocationStatus('success');
        
        // Track location usage in analytics
        trackLocationUsage();
        
        // Detect lake at this location
        setIsDetectingLake(true);
        console.log('[Location] Starting lake detection...');
        try {
          const { api } = await import('../../lib/api');
          const lakeSuggestion = await api.detectLake({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          console.log('[Location] Lake detection result:', lakeSuggestion);
          console.log('[Location] Checking lakeSuggestion properties:', {
            hasObject: !!lakeSuggestion,
            lakeName: lakeSuggestion?.lakeName,
            LakeName: (lakeSuggestion as any)?.LakeName,
            allKeys: lakeSuggestion ? Object.keys(lakeSuggestion) : []
          });
          
          // Backend returns PascalCase (LakeName), so check both
          const detectedLakeName = (lakeSuggestion as any)?.LakeName || lakeSuggestion?.lakeName;
          
          if (lakeSuggestion && detectedLakeName) {
            console.log(`[Location] Lake found: ${detectedLakeName} at ${lakeSuggestion.distanceKm?.toFixed(2)}km`);
            
            // Normalize the object to camelCase for consistency
            const normalizedSuggestion: LakeSuggestion = {
              lakeName: detectedLakeName,
              latitude: (lakeSuggestion as any).Latitude || lakeSuggestion.latitude,
              longitude: (lakeSuggestion as any).Longitude || lakeSuggestion.longitude,
              reportCount: (lakeSuggestion as any).ReportCount || lakeSuggestion.reportCount,
              distanceKm: (lakeSuggestion as any).DistanceKm || lakeSuggestion.distanceKm,
              lastReportDate: (lakeSuggestion as any).LastReportDate || lakeSuggestion.lastReportDate
            };
            
            setDetectedLake(normalizedSuggestion);
            setLakeConfirmed(null); // Reset confirmation state
            // Don't auto-fill yet - wait for user confirmation
          } else {
            console.log('[Location] No lake found nearby');
            setDetectedLake(null);
            setLakeConfirmed(null);
          }
        } catch (error) {
          console.error('[Location] Error detecting lake:', error);
          setDetectedLake(null);
        } finally {
          setIsDetectingLake(false);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access was denied. Please go into your browser settings and enable location access. We require location data to prevent spam and ensure reports are from actual lake locations.';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission from step 5 (review page)
    if (currentStep !== 5) {
      console.log('[Submit] Prevented submission - not on review page (step', currentStep, ')');
      return;
    }

    // Validate location is set
    if (formData.latitude === 0 || formData.longitude === 0) {
      setLocationError('Please use your location before submitting');
      setLocationStatus('error');
      setCurrentStep(1); // Go back to location step
      return;
    }

    // Validate required fields
    if (!formData.lake || formData.lake.trim().length === 0) {
      setLocationError('Lake name is required before submitting');
      setLocationStatus('error');
      setCurrentStep(2);
      return;
    }

    if (formData.thickness <= 0 || formData.thickness > 50) {
      setLocationError('Please enter a valid ice thickness between 0 and 50 inches');
      setLocationStatus('error');
      setCurrentStep(3);
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
      // Error handling is done in parent, but log here for debugging
      console.error('[Submit] Form submission error:', error);
      // Show inline error instead of a browser alert
      setLocationError('Failed to submit report. Please check your connection and try again.');
      setLocationStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleIceQuality = (quality: string) => {
    setFormData(prev => ({
      ...prev,
      iceQuality: prev.iceQuality.includes(quality)
        ? prev.iceQuality.filter(q => q !== quality)
        : [...prev.iceQuality, quality]
    }));
  };

  // Search lakes as user types with debounce to prevent flickering
  const handleLakeNameChange = async (value: string) => {
    const sanitized = sanitizeText(value, 'lake name');
    setFormData(prev => ({ ...prev, lake: sanitized }));
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length >= 2) {
      // Wait 500ms before searching to avoid flickering
      const timeout = setTimeout(async () => {
        setIsSearchingLakes(true);
        const searchStartTime = Date.now();
        
        try {
          const { api } = await import('../../lib/api');
          const suggestions = await api.searchLakes(value);
          
          console.log('Lake search results for "' + value + '":', suggestions);
          
          // Ensure loading shows for at least 300ms to prevent flicker
          const elapsedTime = Date.now() - searchStartTime;
          const minDisplayTime = 300;
          
          if (elapsedTime < minDisplayTime) {
            await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsedTime));
          }
          
          setLakeSuggestions(suggestions);
          setShowLakeSuggestions(suggestions.length > 0);
          console.log('Showing suggestions:', suggestions.length > 0, 'Count:', suggestions.length);
        } catch (error) {
          console.error('Error searching lakes:', error);
        } finally {
          setIsSearchingLakes(false);
        }
      }, 500);
      
      setSearchTimeout(timeout);
    } else {
      setLakeSuggestions([]);
      setShowLakeSuggestions(false);
      setIsSearchingLakes(false);
    }
  };

  const selectLakeSuggestion = (suggestion: LakeSuggestion) => {
    const lakeName = suggestion.LakeName || suggestion.lakeName || '';
    console.log('Selected lake:', lakeName, 'from suggestion:', suggestion);
    setFormData(prev => ({ ...prev, lake: lakeName }));
    setShowLakeSuggestions(false);
    setDetectedLake(suggestion);
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    // Can't proceed if any loading operation is in progress
    if (isDetectingLake || isSearchingLakes || locationStatus === 'loading') {
      return false;
    }
    
    switch (step) {
      case 1: // Location step
        return locationStatus === 'success' && formData.latitude !== 0 && formData.longitude !== 0;
      case 2: // Lake step
        return formData.lake.trim().length > 0;
      case 3: // Ice details
        return formData.thickness > 0 && formData.surfaceType.length > 0 && formData.isMeasured;
      case 4: // Additional info (optional, always can proceed)
        return true;
      default:
        return true;
    }
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

        {/* Step Indicator */}
        <div style={{
          padding: '2rem 1.5rem 1.5rem',
          background: '#f8f9fa',
          borderBottom: '1px solid #e9ecef'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '0',
              right: '0',
              height: '2px',
              background: '#e9ecef',
              zIndex: 0
            }}>
              <div style={{
                height: '100%',
                background: 'var(--success)',
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Steps */}
            {steps.map((step) => (
              <div key={step.number} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentStep >= step.number ? 'var(--success)' : 'white',
                  border: `2px solid ${currentStep >= step.number ? 'var(--success)' : '#dee2e6'}`,
                  color: currentStep >= step.number ? 'white' : '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: currentStep === step.number ? 600 : 500,
                  color: currentStep === step.number ? 'var(--primary-dark)' : '#6c757d',
                  textAlign: 'center',
                  maxWidth: '90px',
                  lineHeight: '1.2'
                }}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => {
            // Prevent Enter key from submitting unless on review step
            if (e.key === 'Enter' && currentStep !== 5) {
              e.preventDefault();
            }
          }}
          style={{ padding: '1.5rem', minHeight: '400px' }}
        >
          
          {/* Step 1: GPS Location */}
          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                color: 'var(--primary-dark)'
              }}>
                📍 Set Your GPS Location
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--primary-dark)',
                  fontSize: '0.95rem'
                }}>
                  Location <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                
                {/* Use My Location Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUseMyLocation();
                  }}
                  disabled={locationStatus === 'loading'}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
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
                  {locationStatus === 'success' && '✓ Location Captured'}
                  {locationStatus === 'idle' && '📍 Use My Location'}
                  {locationStatus === 'error' && '⚠️ Try Again'}
                </button>

                {/* Show coordinates when captured */}
                {locationStatus === 'success' && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--primary-light)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--primary-dark)',
                    marginBottom: '0.75rem',
                    fontWeight: 500
                  }}>
                    ✓ Latitude: {formData.latitude.toFixed(6)}, Longitude: {formData.longitude.toFixed(6)}
                  </div>
                )}

                {/* Lake detection in progress */}
                {isDetectingLake && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#e7f3ff',
                    border: '2px solid #0066cc',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#004085',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{ 
                      display: 'inline-block',
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid #0066cc',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Searching for nearby lakes...
                  </div>
                )}

                {/* Error message */}
                {locationStatus === 'error' && locationError && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#fee',
                    border: '1px solid var(--danger)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--danger)',
                    marginBottom: '0.75rem'
                  }}>
                    {locationError}
                  </div>
                )}

                {/* Optional text location description */}
                <label style={{
                  display: 'block',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}>
                  Location Description (Optional - let everyone know where on the lake you are)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, location: sanitizeText(e.target.value, 'location') })}
                  placeholder="e.g., West shore, North bay, Near boat launch..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--primary-light)',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Lake Name */}
          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                color: 'var(--primary-dark)'
              }}>
                🏞️ Identify the Lake
              </h3>

              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                {/* Show detecting lake spinner */}
                {isDetectingLake && (
                  <div style={{
                    padding: '1rem',
                    background: '#e7f3ff',
                    border: '2px solid #0066cc',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.95rem',
                    color: '#004085',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{ 
                      display: 'inline-block',
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '3px solid #0066cc',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>🔍 Searching for lakes nearby...</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Checking our database for reports within 2km
                      </div>
                    </div>
                  </div>
                )}

                {/* Show detected lake message with Yes/No confirmation */}
                {!isDetectingLake && detectedLake && detectedLake.lakeName && lakeConfirmed === null && (
                  <div style={{
                    padding: '1rem',
                    background: '#d4edda',
                    border: '2px solid #28a745',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.95rem',
                    color: '#155724'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1rem' }}>
                      📍 I noticed you might be close to <strong>{detectedLake.lakeName}</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      Is this the same lake you are at?
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0d4d1d', marginBottom: '1rem' }}>
                      Found {detectedLake.reportCount} recent report{detectedLake.reportCount !== 1 ? 's' : ''} nearby
                      {detectedLake.distanceKm !== undefined && (
                        detectedLake.distanceKm < 1 
                          ? ` (~${Math.round(detectedLake.distanceKm * 1000)}m away)` 
                          : ` (~${detectedLake.distanceKm.toFixed(2)}km away)`
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLakeConfirmed(true);
                          setFormData(prev => ({ ...prev, lake: detectedLake.lakeName || '' }));
                        }}
                        style={{
                          flex: 1,
                          padding: '0.625rem 1rem',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Yes, I'm at {detectedLake.lakeName}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLakeConfirmed(false);
                          setDetectedLake(null);
                          setFormData(prev => ({ ...prev, lake: '' }));
                        }}
                        style={{
                          flex: 1,
                          padding: '0.625rem 1rem',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✗ No, different lake
                      </button>
                    </div>
                  </div>
                )}

                {/* Show confirmed lake message */}
                {lakeConfirmed === true && detectedLake && (
                  <div style={{
                    padding: '0.875rem',
                    background: '#d4edda',
                    border: '2px solid #28a745',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    color: '#155724'
                  }}>
                    ✓ Lake confirmed: <strong>{detectedLake.lakeName}</strong> (based on GPS data)
                  </div>
                )}

                {/* Show "no lake found" message - only when GPS was used and either no lake detected OR user said No */}
                {!isDetectingLake && locationStatus === 'success' && ((!detectedLake && lakeConfirmed === null) || lakeConfirmed === false) && (
                  <div style={{
                    padding: '0.875rem',
                    background: '#fff3cd',
                    border: '2px solid #ffc107',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.95rem',
                    color: '#856404'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                      {lakeConfirmed === false ? '📝 Please enter the lake name' : '🎯 No lake found at this location'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {lakeConfirmed === false 
                        ? 'Enter the lake name below to continue.' 
                        : 'Be the first to report! Enter a lake name below to help others find it.'}
                    </div>
                  </div>
                )}

                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--primary-dark)',
                  fontSize: '0.95rem'
                }}>
                  Lake Name <span style={{ color: 'var(--danger)' }}>*</span>
                  {lakeConfirmed === true && <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#28a745', marginLeft: '0.5rem' }}>(based on GPS data)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.lake}
                    onChange={(e) => handleLakeNameChange(e.target.value)}
                    onFocus={() => setShowLakeSuggestions(lakeSuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowLakeSuggestions(false), 300)}
                    placeholder="Start typing to search for a lake..."
                    autoComplete="off"
                    readOnly={lakeConfirmed === true}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '2px solid var(--primary-light)',
                      fontSize: '0.95rem',
                      background: lakeConfirmed === true ? '#e9ecef' : 'white',
                      cursor: lakeConfirmed === true ? 'not-allowed' : 'text'
                    }}
                  />
                  
                  {/* Lake name autocomplete suggestions */}
                  {showLakeSuggestions && lakeSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '2px solid var(--primary-light)',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      marginTop: '0.25rem'
                    }}>
                      {lakeSuggestions.slice(0, 10).map((suggestion, idx) => {
                        const lakeName = suggestion.LakeName || suggestion.lakeName || 'Unknown Lake';
                        return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectLakeSuggestion(suggestion)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: 'none',
                            borderBottom: idx < lakeSuggestions.length - 1 ? '1px solid var(--primary-light)' : 'none',
                            background: 'white',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                            {lakeName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {suggestion.reportCount || suggestion.ReportCount || 0} report{(suggestion.reportCount || suggestion.ReportCount || 0) !== 1 ? 's' : ''}
                            {(suggestion.lastReportDate || suggestion.LastReportDate) && ` • Last: ${new Date((suggestion.lastReportDate || suggestion.LastReportDate)!).toLocaleDateString()}`}
                          </div>
                        </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {isSearchingLakes && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    🔍 Searching...
                  </div>
                )}
                
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  {detectedLake 
                    ? 'Lake name detected from previous reports. You can change it if needed.'
                    : 'Start typing to search, or enter a new lake name to help others.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Ice Details */}
          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                color: 'var(--primary-dark)'
              }}>
                🧊 Ice Details
              </h3>

              {/* Thickness Slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--primary-dark)',
                  fontSize: '0.95rem'
                }}>
                  Ice Thickness: <span style={{ color: 'var(--primary-medium)', fontSize: '1.25rem' }}>{formData.thickness}&quot;</span>
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
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--primary-light)',
                    outline: 'none'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem'
                }}>
                  <span>0&quot;</span>
                  <span>35&quot;</span>
                </div>
              </div>

              {/* Surface Type */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--primary-dark)',
                  fontSize: '0.95rem'
                }}>
                  Surface Type <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                        padding: '0.75rem',
                        background: formData.surfaceType === type.value ? 'var(--primary-light)' : 'white',
                        border: `2px solid ${formData.surfaceType === type.value ? 'var(--primary-medium)' : 'var(--primary-light)'}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem',
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
              <div>
                <label style={{
                  padding: '0.75rem',
                  background: formData.isMeasured ? 'var(--primary-light)' : 'white',
                  border: `2px solid ${formData.isMeasured ? 'var(--primary-medium)' : 'var(--primary-light)'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.95rem'
                }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isMeasured}
                    onChange={(e) => setFormData({ ...formData, isMeasured: e.target.checked })}
                    style={{ marginRight: '0.5rem', width: '18px', height: '18px' }}
                  />
                  ✅ I drilled/measured it (not just observed)
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {currentStep === 4 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                color: 'var(--primary-dark)'
              }}>
                📝 Additional Information (Optional)
              </h3>

              {/* Ice Quality */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--primary-dark)',
                  fontSize: '0.95rem'
                }}>
                  Ice Conditions
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    'Pressure cracks', 
                    'Pressure ridges', 
                    'Thin ice', 
                    'Weak ice', 
                    'Fair ice', 
                    'Great ice',
                    'Be careful', 
                    'Foot traffic only', 
                    'ATV broke through',
                    'Vehicle broke through'
                  ].map((quality) => (
                    <label
                      key={quality}
                      style={{
                        padding: '0.75rem 1rem',
                        background: formData.iceQuality.includes(quality) ? 'var(--primary-light)' : 'white',
                        border: `2px solid ${formData.iceQuality.includes(quality) ? 'var(--primary-medium)' : 'var(--primary-light)'}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.iceQuality.includes(quality)}
                        onChange={() => toggleIceQuality(quality)}
                        style={{ marginRight: '0.5rem', width: '16px', height: '16px' }}
                      />
                      {quality}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: 'var(--primary-dark)',
                  fontSize: '0.95rem'
                }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: sanitizeText(e.target.value, 'notes') })}
                  placeholder="Any additional observations about ice conditions, access, or safety concerns..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--primary-light)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                color: 'var(--primary-dark)'
              }}>
                ✓ Review Your Report
              </h3>

              {/* Summary */}
              <div style={{ 
                background: '#f8f9fa', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>📍 Location:</strong>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                    {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    {formData.location && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formData.location}</div>}
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>🏞️ Lake:</strong>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                    {formData.lake || 'Not specified'}
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>🧊 Ice Thickness:</strong>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                    {formData.thickness}&quot;
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>Surface Type:</strong>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                    {formData.surfaceType}
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>Measured:</strong>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                    {formData.isMeasured ? 'Yes - Drilled/Measured' : 'No - Visual estimate'}
                  </div>
                </div>

                {formData.iceQuality.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--primary-dark)' }}>Conditions:</strong>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                      {formData.iceQuality.join(', ')}
                    </div>
                  </div>
                )}

                {formData.notes && (
                  <div>
                    <strong style={{ color: 'var(--primary-dark)' }}>Notes:</strong>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                      {formData.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div style={{
                background: '#FFF3CD',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                border: '2px solid #F7A93D'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#856404' }}>
                  ⚠️ Before you submit:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#856404' }}>
                  <li>This is a community signal, not permission to access ice</li>
                  <li>Does not guarantee safety - conditions vary</li>
                  <li>Ice conditions change rapidly</li>
                  <li>Always check conditions yourself before venturing out</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prevStep();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '2px solid var(--primary-medium)',
                    background: 'white',
                    color: 'var(--primary-medium)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem'
                  }}
                >
                  ← Back
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #dee2e6',
                  background: 'white',
                  color: '#6c757d',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                Cancel
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }}
                  disabled={!canProceedFromStep(currentStep)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: canProceedFromStep(currentStep) ? 'var(--primary-medium)' : '#dee2e6',
                    color: 'white',
                    fontWeight: 600,
                    cursor: canProceedFromStep(currentStep) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {(isDetectingLake || isSearchingLakes || locationStatus === 'loading') ? (
                    <>
                      <div style={{ 
                        display: 'inline-block',
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      Loading...
                    </>
                  ) : (
                    'Next →'
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 2rem',
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
                    '✓ Submit Report'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
