// API client for Ice Relay

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

if (process.env.NODE_ENV === 'development') {
  console.info('[API Config] API_BASE_URL:', API_BASE_URL);
}

/** Thrown when the API cannot be reached at all (server down, offline, CORS, DNS). */
export class ApiUnavailableError extends Error {
  constructor() {
    super('The ice report service is not reachable right now.');
    this.name = 'ApiUnavailableError';
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retries network failures only; HTTP error responses are returned to the caller.
async function fetchWithRetry(url: string, options?: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (isAbortError(error)) throw error;
      if (attempt === retries) throw new ApiUnavailableError();
      await wait(RETRY_DELAY * attempt);
    }
  }
  throw new ApiUnavailableError();
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
  LakeName?: string;
  latitude?: number;
  Latitude?: number;
  longitude?: number;
  Longitude?: number;
  reportCount?: number;
  ReportCount?: number;
  distanceKm?: number;
  DistanceKm?: number;
  lastReportDate?: string;
  LastReportDate?: string;
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
      throw new Error(`Failed to detect lake (${response.status})`);
    }

    const result: LakeSuggestion = await response.json();
    console.log('[API] POST /reports/detect-lake - Success:', result);
    return result;
  },

  // Search lake names (autocomplete)
  async searchLakes(query: string): Promise<LakeSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    console.log('[API] GET /reports/search-lakes - Query:', query);
    const encodedQuery = encodeURIComponent(query);
    const response = await fetchWithRetry(`${API_BASE_URL}/reports/search-lakes?q=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Lake search failed (${response.status})`);
    }

    const results: LakeSuggestion[] = await response.json();
    console.log('[API] GET /reports/search-lakes - Results:', results);
    return results;
  },

  // Get reports within map bounds
  async getReportsInBounds(bbox: {
    north: number;
    south: number;
    east: number;
    west: number;
    zoom: number;
  }, signal?: AbortSignal): Promise<IceReport[]> {
    const params = new URLSearchParams({
      north: bbox.north.toString(),
      south: bbox.south.toString(),
      east: bbox.east.toString(),
      west: bbox.west.toString(),
      zoom: bbox.zoom.toString()
    });

    const response = await fetchWithRetry(`${API_BASE_URL}/reports/bounds?${params}`, { signal });

    if (!response.ok) {
      throw new Error(`Failed to fetch map reports (${response.status})`);
    }

    return await response.json() as IceReport[];
  },
};
