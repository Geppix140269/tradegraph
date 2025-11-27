import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  ShipmentSearchParams,
  ShipmentSearchResult,
  Company,
  CompanySearchResult,
  ComplianceCheckResult,
  DutyRateResult,
  SavedSearch,
  Watchlist,
} from '@/types';

/**
 * API Client
 *
 * Centralized API access for CargoIntel backend.
 * Handles authentication, error handling, and request/response typing.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  // Get token from auth provider (e.g., Auth0, Clerk)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SHIPMENTS API
// ─────────────────────────────────────────────────────────────────────────────

export const shipmentsApi = {
  /**
   * Search shipments with filters
   */
  search: async (params: ShipmentSearchParams): Promise<ShipmentSearchResult> => {
    const response = await apiClient.post<ShipmentSearchResult>('/shipments/search', params);
    return response.data;
  },

  /**
   * Get single shipment by ID
   */
  getById: async (id: string): Promise<ShipmentSearchResult['items'][0]> => {
    const response = await apiClient.get(`/shipments/${id}`);
    return response.data;
  },

  /**
   * Get shipments for a specific company
   */
  getByCompany: async (
    companyId: string,
    role: 'shipper' | 'consignee' | 'both' = 'both',
    page: number = 1,
    pageSize: number = 20
  ): Promise<ShipmentSearchResult> => {
    const response = await apiClient.get(`/shipments/by-company/${companyId}`, {
      params: { role, page, pageSize },
    });
    return response.data;
  },

  /**
   * Export shipment search results
   */
  export: async (params: ShipmentSearchParams, format: 'csv' | 'xlsx'): Promise<Blob> => {
    const response = await apiClient.post(
      '/shipments/export',
      params,
      {
        params: { format },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Get route analytics for an HS code
   */
  getRouteAnalytics: async (
    hsCode: string,
    dateFrom?: string,
    dateTo?: string
  ) => {
    const response = await apiClient.get('/shipments/analytics/routes', {
      params: { hsCode, dateFrom, dateTo },
    });
    return response.data;
  },

  /**
   * Get price distribution for benchmarking
   */
  getPriceDistribution: async (
    hsCode: string,
    originCountry?: string,
    destinationCountry?: string
  ) => {
    const response = await apiClient.get('/shipments/analytics/price-distribution', {
      params: { hsCode, originCountry, destinationCountry },
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPANIES API
// ─────────────────────────────────────────────────────────────────────────────

export const companiesApi = {
  /**
   * Get company profile by ID
   */
  getById: async (id: string): Promise<Company> => {
    const response = await apiClient.get<Company>(`/companies/${id}`);
    return response.data;
  },

  /**
   * Search companies
   */
  search: async (params: {
    q?: string;
    country?: string;
    hsCode?: string;
    role?: 'importer' | 'exporter' | 'both';
    page?: number;
    pageSize?: number;
  }): Promise<CompanySearchResult> => {
    const response = await apiClient.get<CompanySearchResult>('/companies', { params });
    return response.data;
  },

  /**
   * Get trade partners for a company
   */
  getTradePartners: async (
    companyId: string,
    role: 'buyers' | 'suppliers' | 'both' = 'both',
    page: number = 1,
    pageSize: number = 20
  ) => {
    const response = await apiClient.get(`/companies/${companyId}/trade-partners`, {
      params: { role, page, pageSize },
    });
    return response.data;
  },

  /**
   * Find similar companies (look-alike)
   */
  findSimilar: async (companyId: string, limit: number = 10) => {
    const response = await apiClient.get(`/companies/${companyId}/similar`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get company trade timeline
   */
  getTimeline: async (companyId: string, months: number = 12) => {
    const response = await apiClient.get(`/companies/${companyId}/timeline`, {
      params: { months },
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE API
// ─────────────────────────────────────────────────────────────────────────────

export const complianceApi = {
  /**
   * Run compliance check on a company
   */
  check: async (companyId: string): Promise<ComplianceCheckResult> => {
    const response = await apiClient.post<ComplianceCheckResult>('/compliance/check', {
      companyId,
    });
    return response.data;
  },

  /**
   * Batch compliance check
   */
  batchCheck: async (companyIds: string[]): Promise<ComplianceCheckResult[]> => {
    const response = await apiClient.post<ComplianceCheckResult[]>('/compliance/check/batch', {
      companyIds,
    });
    return response.data;
  },

  /**
   * Get compliance check history
   */
  getHistory: async (): Promise<ComplianceCheckResult[]> => {
    const response = await apiClient.get<ComplianceCheckResult[]>('/compliance/history');
    return response.data;
  },

  /**
   * Get credits balance
   */
  getCredits: async (): Promise<{ remaining: number; total: number }> => {
    const response = await apiClient.get('/compliance/credits');
    return response.data;
  },

  /**
   * Export check as PDF
   */
  exportPdf: async (checkId: string): Promise<Blob> => {
    const response = await apiClient.get(`/compliance/check/${checkId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TARIFFS API
// ─────────────────────────────────────────────────────────────────────────────

export const tariffsApi = {
  /**
   * Get duty rates for HS code + route
   */
  getRates: async (
    hsCode: string,
    origin: string,
    destination: string
  ): Promise<DutyRateResult> => {
    const response = await apiClient.get<DutyRateResult>('/tariffs/rates', {
      params: { hsCode, origin, destination },
    });
    return response.data;
  },

  /**
   * Get trade measures
   */
  getMeasures: async (destination: string, hsCode?: string, origin?: string) => {
    const response = await apiClient.get('/tariffs/measures', {
      params: { destination, hsCode, origin },
    });
    return response.data;
  },

  /**
   * Search HS codes by description
   */
  searchHsCodes: async (query: string, limit: number = 10) => {
    const response = await apiClient.get('/tariffs/hs-codes', {
      params: { q: query, limit },
    });
    return response.data;
  },

  /**
   * Calculate landed cost estimate
   */
  calculateLandedCost: async (
    hsCode: string,
    origin: string,
    destination: string,
    cifValue: number
  ) => {
    const response = await apiClient.get('/tariffs/landed-cost', {
      params: { hsCode, origin, destination, cifValue },
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVED SEARCHES & WATCHLISTS API
// ─────────────────────────────────────────────────────────────────────────────

export const savedSearchesApi = {
  list: async (): Promise<SavedSearch[]> => {
    const response = await apiClient.get<SavedSearch[]>('/saved-searches');
    return response.data;
  },

  create: async (data: Omit<SavedSearch, 'id' | 'createdAt' | 'lastAlertSentAt'>): Promise<SavedSearch> => {
    const response = await apiClient.post<SavedSearch>('/saved-searches', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/saved-searches/${id}`);
  },

  run: async (id: string): Promise<ShipmentSearchResult> => {
    const response = await apiClient.post<ShipmentSearchResult>(`/saved-searches/${id}/run`);
    return response.data;
  },
};

export const watchlistsApi = {
  list: async (): Promise<Watchlist[]> => {
    const response = await apiClient.get<Watchlist[]>('/watchlists');
    return response.data;
  },

  create: async (data: { name: string; type: Watchlist['type'] }): Promise<Watchlist> => {
    const response = await apiClient.post<Watchlist>('/watchlists', data);
    return response.data;
  },

  addItems: async (watchlistId: string, itemIds: string[]): Promise<void> => {
    await apiClient.post(`/watchlists/${watchlistId}/items`, { itemIds });
  },

  removeItems: async (watchlistId: string, itemIds: string[]): Promise<void> => {
    await apiClient.delete(`/watchlists/${watchlistId}/items`, { data: { itemIds } });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/watchlists/${id}`);
  },
};

export default apiClient;
