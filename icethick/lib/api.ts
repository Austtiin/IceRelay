// API client for Ice Relay

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface IceReport {
  id?: string;
  lakeName?: string;
  thickness: number;
  location?: string;
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
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
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  // Create a new report
  async createReport(data: CreateReportData): Promise<IceReport> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
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
    const response = await fetch(`${API_BASE_URL}/reports/nearby`, {
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
    const response = await fetch(`${API_BASE_URL}/reports/lake/${encodedLakeName}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch lake reports');
    }
    
    return response.json();
  },
};
