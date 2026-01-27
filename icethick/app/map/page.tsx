'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import {CircularProgress, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface Report {
  Id?: string;
  id?: string;
  LakeName?: string;
  lakeName?: string;
  Latitude?: number;
  latitude?: number;
  Longitude?: number;
  longitude?: number;
  Thickness?: number;
  thickness?: number;
  CreatedAt?: string;
  createdAt?: string;
  SurfaceType?: string;
  surfaceType?: string;
  Location?: string;
  location?: string;
}

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [isMounted, setIsMounted] = useState(false);
  const [hasMapboxToken, setHasMapboxToken] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
    // Set mapbox token on client side only
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (token) {
      mapboxgl.accessToken = token;
      setHasMapboxToken(true);
      
      // Disable Mapbox telemetry to prevent blocked requests
      if (typeof mapboxgl.workerUrl === 'undefined') {
        (mapboxgl as any).workerClass = undefined; // Prevents worker-related telemetry
      }
    } else {
      console.error('Mapbox token is not configured. Set NEXT_PUBLIC_MAPBOX_TOKEN before building.');
    }
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMounted || !hasMapboxToken) return;
    if (!mapContainer.current || map.current) return;

    // Get URL params for initial position
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat') || '44.8');
    const lng = parseFloat(params.get('lng') || '-93.5');
    const zoom = parseFloat(params.get('zoom') || '5');

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Soft limit to Midwest
    map.current.setMaxBounds([
      [-104.05, 36.99], // Southwest
      [-80.52, 49.38]   // Northeast
    ]);

    // Handle map move
    map.current.on('moveend', () => {
      if (!map.current) return;
      
      const bounds = map.current.getBounds();
      if (!bounds) return;
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      
      setCurrentZoom(zoom);
      
      // Update URL
      const params = new URLSearchParams({
        lat: center.lat.toFixed(5),
        lng: center.lng.toFixed(5),
        zoom: zoom.toFixed(1)
      });
      window.history.replaceState({}, '', `?${params}`);
      
      // Fetch reports in bounds
      fetchReportsInBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: zoom
      });
    });

    // Initial load
    map.current.on('load', () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      if (!bounds) return;
      const zoom = map.current.getZoom();
      setCurrentZoom(zoom);
      
      fetchReportsInBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: zoom
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [isMounted, hasMapboxToken]);

  // Fetch reports within map bounds
  const fetchReportsInBounds = async (bbox: {
    north: number;
    south: number;
    east: number;
    west: number;
    zoom: number;
  }) => {
    try {
      setIsLoading(true);
      const { api } = await import('../../lib/api');
      const fetchedReports = await api.getReportsInBounds(bbox);
      
      setReports(fetchedReports);
      updateMapMarkers(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update map markers
  const updateMapMarkers = (reports: Report[]) => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Show a softer "heatmap" style when zoomed out, and detailed pins when zoomed in
    reports.forEach(report => {
      if (!map.current) return;

      const lakeName = report.LakeName || report.lakeName || 'Unknown';
      const lat = report.Latitude || report.latitude || 0;
      const lng = report.Longitude || report.longitude || 0;
      const thickness = report.Thickness || report.thickness || 0;
      const surfaceType = report.SurfaceType || report.surfaceType || 'unknown';
      const createdAt = report.CreatedAt || report.createdAt || new Date().toISOString();

      // Skip invalid coordinates
      if (!lat || !lng) return;

      let el: HTMLDivElement;
      let marker: mapboxgl.Marker;

      if (currentZoom < 6) {
        // Low-zoom: larger red heat-style dot for visibility on grey basemap
        el = document.createElement('div');
        el.className = 'ice-report-heat-dot';
        el.style.width = '26px';
        el.style.height = '26px';
        el.style.borderRadius = '50%';
        el.style.background = 'radial-gradient(circle, rgba(231,76,60,0.85) 0%, rgba(231,76,60,0.0) 75%)';
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        
        // Add click handler for heat dots
        el.addEventListener('click', () => {
          if (map.current) {
            // On mobile, offset the center to account for sidebar
            const isMobile = window.innerWidth < 768;
            const targetCenter: [number, number] = [lng, lat];
            
            if (isMobile) {
              // Pan map so marker is visible above the mobile sidebar (which is 40% height)
              // Calculate offset: move center up by about 20% of viewport
              const point = map.current.project([lng, lat]);
              point.y -= window.innerHeight * 0.15; // Move up 15% of screen height
              const adjustedCenter = map.current.unproject(point);
              map.current.flyTo({
                center: [adjustedCenter.lng, adjustedCenter.lat],
                zoom: 10,
                duration: 1000
              });
            } else {
              map.current.flyTo({
                center: targetCenter,
                zoom: 10,
                duration: 1000
              });
            }
            setSelectedReport(report);
            setSidebarOpen(true);
          }
        });
        
        marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map.current);
      } else {
        // High-zoom: detailed pin with popup
        el = document.createElement('div');
        el.className = 'ice-report-marker';
        el.style.backgroundImage = 'url(/pin-marker.svg)';
        el.style.width = '32px';
        el.style.height = '40px';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        // Add click handler for markers to open sidebar
        el.addEventListener('click', () => {
          setSelectedReport(report);
          setSidebarOpen(true);
          if (map.current) {
            // On mobile, offset the center to account for sidebar
            const isMobile = window.innerWidth < 768;
            const currentZoom = map.current.getZoom();
            const targetZoom = Math.max(currentZoom, 10);
            
            if (isMobile) {
              // Pan map so marker is visible above the mobile sidebar
              const point = map.current.project([lng, lat]);
              point.y -= window.innerHeight * 0.15; // Move up 15% of screen height
              const adjustedCenter = map.current.unproject(point);
              map.current.flyTo({
                center: [adjustedCenter.lng, adjustedCenter.lat],
                zoom: targetZoom,
                duration: 800
              });
            } else {
              map.current.flyTo({
                center: [lng, lat],
                zoom: targetZoom,
                duration: 800
              });
            }
          }
        });

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 1rem; color: var(--primary-dark);">${lakeName}</h3>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Thickness:</strong> ${thickness}"</p>
            <p style="margin: 4px 0; font-size: 0.9rem;"><strong>Surface:</strong> ${surfaceType}</p>
            <p style="margin: 4px 0; font-size: 0.85rem; color: var(--text-secondary);">${getTimeAgo(createdAt)}</p>
          </div>
        `);

        marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
      }

      markers.current.push(marker);
    });
  };

  // Time ago helper
  const getTimeAgo = (createdAt: string): string => {
    if (!createdAt) return 'Just now';
    
    const date = new Date(createdAt);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    // Calculate time difference (positive = past, negative = future)
    const diffMs = now.getTime() - date.getTime();
    const diffMins = diffMs / 60000;
    const diffHours = diffMins / 60;
    const diffDays = diffHours / 24;
    
    // Handle future dates
    if (diffMs < 0) {
      return 'Just now';
    }
    
    // If less than 1 hour, show "Just now"
    if (diffHours < 1) return 'Just now';
    
    // If less than 24 hours, show hours
    if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show days
    const days = Math.floor(diffDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Calculate distance from map center
  const getDistanceFromCenter = (lat: number, lng: number): string => {
    if (!map.current) return '';
    const center = map.current.getCenter();
    const distance = getDistance(center.lat, center.lng, lat, lng);
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  // Haversine distance calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => router.push('/')}
      />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => router.push('/')}
      />

      {!isMounted ? (
        // Prevent hydration mismatch by showing loading state until mounted
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </div>
      ) : !hasMapboxToken ? (
        // Show error message if token is missing
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <Box sx={{ textAlign: 'center', maxWidth: '500px' }}>
            <Typography variant="h5" gutterBottom color="error">
              Map Configuration Error
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mapbox token is not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.
            </Typography>
          </Box>
        </div>
      ) : (
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* User-Submitted Disclaimer Banner */}
        <div style={{
          background: 'rgba(254, 95, 85, 0.95)',
          color: 'white',
          padding: isMobile ? '8px 12px' : '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          lineHeight: 1.4,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>⚠️</span>
          <span style={{ flex: 1 }}>
            <strong>User-submitted reports:</strong> Always verify ice thickness yourself. No ice is 100% safe.
          </span>
        </div>

        {/* Map Container */}
        <div ref={mapContainer} style={{ flex: 1 }} />

        {/* Desktop Sidebar / Mobile Bottom Sheet */}
        {sidebarOpen && currentZoom >= 6 && (
          <Box
            sx={{
              position: 'absolute',
              ...(isMobile ? {
                // Mobile: Bottom sheet that slides up
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: '65vh',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '@keyframes slideUp': {
                  from: {
                    transform: 'translateY(100%)',
                    opacity: 0
                  },
                  to: {
                    transform: 'translateY(0)',
                    opacity: 1
                  }
                }
              } : {
                // Desktop: Right sidebar
                top: '16px',
                right: '16px',
                width: '350px',
                maxHeight: 'calc(100vh - 180px)',
                borderRadius: '12px',
                animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '@keyframes popIn': {
                  from: {
                    transform: 'scale(0.9)',
                    opacity: 0
                  },
                  to: {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }),
              backgroundColor: 'white',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1000
            }}
          >
            {/* Mobile: Drag Handle */}
            {isMobile && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '8px 0 4px',
                cursor: 'pointer'
              }}
              onClick={() => setSidebarOpen(false)}
              >
                <Box sx={{
                  width: '40px',
                  height: '4px',
                  backgroundColor: '#ddd',
                  borderRadius: '2px'
                }} />
              </Box>
            )}

            {/* Sidebar Header */}
            <div style={{
              padding: isMobile ? '12px 16px 16px' : '16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                {selectedReport 
                  ? (selectedReport.LakeName || selectedReport.lakeName || 'Unknown Lake')
                  : `Reports in View (${reports.length})`
                }
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setSidebarOpen(false);
                  setSelectedReport(null);
                }}
                sx={{ minWidth: 'auto', padding: '4px' }}
              >
                <CloseIcon />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '8px' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : selectedReport ? (
                // Show selected report details
                <Box sx={{ padding: '8px' }}>
                  <Box sx={{ marginBottom: '16px' }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                      Ice Thickness
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {selectedReport.Thickness || selectedReport.thickness}"
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                        Surface Type
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {selectedReport.SurfaceType || selectedReport.surfaceType || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                        Reported
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {getTimeAgo(selectedReport.CreatedAt || selectedReport.createdAt || new Date().toISOString())}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedReport.Location || selectedReport.location ? (
                    <Box sx={{ marginBottom: '16px' }}>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.Location || selectedReport.location}
                      </Typography>
                    </Box>
                  ) : null}

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSelectedReport(null);
                    }}
                    sx={{ marginTop: '16px' }}
                  >
                    View All Reports
                  </Button>
                </Box>
              ) : reports.length === 0 ? (
                <Box sx={{ padding: '32px', textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No reports in this area. Zoom or pan to find reports.
                  </Typography>
                </Box>
              ) : (
                reports.map(report => {
                  const lakeName = report.LakeName || report.lakeName || 'Unknown';
                  const lat = report.Latitude || report.latitude || 0;
                  const lng = report.Longitude || report.longitude || 0;
                  const thickness = report.Thickness || report.thickness || 0;
                  const surfaceType = report.SurfaceType || report.surfaceType || 'unknown';
                  const createdAt = report.CreatedAt || report.createdAt || new Date().toISOString();
                  const reportId = report.Id || report.id || Math.random().toString();
                  const selectedId = selectedReport ? ((selectedReport as Report).Id || (selectedReport as Report).id) : null;
                  const isSelected = selectedId === reportId;
                  
                  return (
                  <div
                    key={reportId}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: isSelected ? '#e3f2fd' : '#f8f9fa',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isSelected ? '2px solid #1976d2' : '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onClick={() => {
                      setSelectedReport(report);
                      if (map.current) {
                        map.current.flyTo({
                          center: [lng, lat],
                          zoom: 12,
                          duration: 800
                        });
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                        {lakeName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                        {getDistanceFromCenter(lat, lng)}
                      </Typography>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <div>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                          Thickness
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {thickness}"
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                          Surface
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {surfaceType}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
                      {getTimeAgo(createdAt)}
                    </Typography>
                  </div>
                  );
                })
              )}
            </div>
          </Box>
        )}

        {/* Toggle Sidebar Button (when closed) */}
        {!sidebarOpen && currentZoom >= 6 && (
          <Button
            variant="contained"
            onClick={() => setSidebarOpen(true)}
            sx={{
              position: 'absolute',
              ...(isMobile ? {
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '24px',
                width: 'auto',
                padding: '12px 24px',
                animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                '@keyframes bounceIn': {
                  '0%': {
                    transform: 'translateX(-50%) scale(0)',
                    opacity: 0
                  },
                  '50%': {
                    transform: 'translateX(-50%) scale(1.1)',
                  },
                  '100%': {
                    transform: 'translateX(-50%) scale(1)',
                    opacity: 1
                  }
                }
              } : {
                top: '16px',
                right: '16px',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                minWidth: 'auto',
                padding: 0
              }),
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {isMobile ? (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LocationOnIcon fontSize="small" />
                View Reports ({reports.length})
              </Typography>
            ) : (
              <LocationOnIcon />
            )}
          </Button>
        )}

        {/* Zoom Level Info */}
        {currentZoom < 6 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              padding: '12px 24px',
              borderRadius: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Zoom in to see individual report details
            </Typography>
          </Box>
        )}
      </div>
      )}
    </div>
  );
}
