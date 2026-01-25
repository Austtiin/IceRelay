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
  lakeName?: string;
  thickness: number;
  location?: string;
  latitude: number;
  longitude: number;
  surfaceType: string;
  isMeasured: boolean;
  method?: string;
  iceQuality?: string[];
  notes?: string;
  createdAt?: string;
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

export const api = {
  // Get all reports
  async getReports(): Promise<IceReport[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/reports`);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  // Create a new report with retry logic
  async createReport(data: CreateReportData): Promise<IceReport> {
    const response = await fetchWithRetry(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create report');
    }
    
    return response.json();
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
};
