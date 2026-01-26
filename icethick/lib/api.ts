// API client for Ice Relay

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for fetch requests
async function fetchWithRetry(url: string, options?: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Network error'}`);
      }
      // Wait before retrying
      await wait(RETRY_DELAY * attempt); // Exponential backoff
    }
  }
  throw new Error('Unexpected error in retry logic');
}

export interface IceReport {
  id?: string;
  Id?: string;  // Backend returns PascalCase
  lakeName?: string;
  LakeName?: string;  // Backend returns PascalCase
  thickness: number;
  Thickness?: number;  // Backend returns PascalCase
  location?: string;
  Location?: string;  // Backend returns PascalCase
  latitude: number;
  Latitude?: number;  // Backend returns PascalCase
  longitude: number;
  Longitude?: number;  // Backend returns PascalCase
  surfaceType: string;
  SurfaceType?: string;  // Backend returns PascalCase
  isMeasured: boolean;
  IsMeasured?: boolean;  // Backend returns PascalCase
  method?: string;
  Method?: string;  // Backend returns PascalCase
  iceQuality?: string[];
  IceQuality?: string[];  // Backend returns PascalCase
  notes?: string;
  Notes?: string;  // Backend returns PascalCase
  createdAt?: string;
  CreatedAt?: string;  // Backend returns PascalCase
  reportCount?: number;
}

export interface CreateReportData {
  lake?: string;
  thickness: number;
  location?: string;
  latitude: number;
  longitude: number;
  surfaceType: string;
  isMeasured: boolean;
  method: string;
  iceQuality?: string[];
  notes?: string;
  useGPS: boolean;
}

export interface NearbyReportsRequest {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export interface LakeSuggestion {
  lakeName?: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  distanceKm?: number;
  lastReportDate?: string;
}

export interface DetectLakeRequest {
  latitude: number;
  longitude: number;
}

export const api = {
  // Get all reports
  async getReports(): Promise<IceReport[]> {
    console.log('[API] GET /reports - Fetching all reports');
    const response = await fetchWithRetry(`${API_BASE_URL}/reports`);
    if (!response.ok) {
      console.error('[API] GET /reports - Failed:', response.status, response.statusText);
      throw new Error('Failed to fetch reports');
    }
    const data = await response.json();
    console.log('[API] GET /reports - Success:', data);
    return data;
  },

  // Create a new report with retry logic
  async createReport(data: CreateReportData): Promise<IceReport> {
    console.log('[API] POST /reports - Payload:', data);
    const response = await fetchWithRetry(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[API] POST /reports - Failed:', response.status, error);
      throw new Error(error || 'Failed to create report');
    }
    
    const result = await response.json();
    console.log('[API] POST /reports - Success:', result);
    return result;
  },

  // Get nearby reports
  async getNearbyReports(request: NearbyReportsRequest): Promise<IceReport[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/reports/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch nearby reports');
    }
    
    return response.json();
  },

  // Get reports by lake name
  async getLakeReports(lakeName: string): Promise<IceReport[]> {
    const encodedLakeName = encodeURIComponent(lakeName);
    const response = await fetchWithRetry(`${API_BASE_URL}/reports/lake/${encodedLakeName}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch lake reports');
    }
    
    return response.json();
  },

  // Detect lake by GPS coordinates
  async detectLake(request: DetectLakeRequest): Promise<LakeSuggestion | null> {
    console.log('[API] POST /reports/detect-lake - Payload:', request);
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/reports/detect-lake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (response.status === 404) {
        console.log('[API] POST /reports/detect-lake - No lake found (404)');
        return null;
      }
      
      if (!response.ok) {
        console.error('[API] POST /reports/detect-lake - Failed:', response.status, response.statusText);
        throw new Error('Failed to detect lake');
      }
      
      const result = await response.json();
      console.log('[API] POST /reports/detect-lake - Success:', result);
      return result;
    } catch (error) {
      console.error('[API] POST /reports/detect-lake - Error:', error);
      return null;
    }
  },

  // Search lake names (autocomplete)
  async searchLakes(query: string): Promise<LakeSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    console.log('[API] GET /reports/search-lakes - Query:', query);
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetchWithRetry(`${API_BASE_URL}/reports/search-lakes?q=${encodedQuery}`);
      
      if (!response.ok) {
        console.error('[API] GET /reports/search-lakes - Failed:', response.status);
        return [];
      }
      
      const results = await response.json();
      console.log('[API] GET /reports/search-lakes - Results:', results);
      return results;
    } catch (error) {
      console.error('[API] GET /reports/search-lakes - Error:', error);
      return [];
    }
  },
};
