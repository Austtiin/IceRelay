'use client';

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import {CircularProgress, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Set Mapbox token from public env; if missing, we'll show a friendly message instead of crashing
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(5);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!hasMapboxToken) {
      console.error('Mapbox token is not configured. Set NEXT_PUBLIC_MAPBOX_TOKEN before building.');
      return;
    }

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
  }, []);

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
        el.style.pointerEvents = 'none';
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
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)} hour${Math.floor(diffHours) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''} ago`;
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
        onNewReport={() => {}}
      />
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => {}}
      />

      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {/* Map Container */}
        <div ref={mapContainer} style={{ flex: 1 }} />

        {/* Sidebar */}
        {sidebarOpen && currentZoom >= 6 && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '350px',
            maxHeight: 'calc(100vh - 180px)',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Sidebar Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                Reports in View ({reports.length})
              </Typography>
              <Button
                size="small"
                onClick={() => setSidebarOpen(false)}
                sx={{ minWidth: 'auto', padding: '4px' }}
              >
                <CloseIcon />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <CircularProgress size={40} />
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
                  
                  return (
                  <div
                    key={reportId}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onClick={() => {
                      if (map.current) {
                        map.current.flyTo({
                          center: [lng, lat],
                          zoom: 12
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
          </div>
        )}

        {/* Toggle Sidebar Button (when closed) */}
        {!sidebarOpen && currentZoom >= 6 && (
          <Button
            variant="contained"
            onClick={() => setSidebarOpen(true)}
            sx={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              borderRadius: '50%',
              minWidth: 'auto',
              width: '48px',
              height: '48px',
              padding: 0,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <LocationOnIcon />
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
    </div>
  );
}
