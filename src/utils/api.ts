// API client for communicating with backend
import type {
  ApiResponse,
  Contact,
  ContactParams,
  RegisterData,
  LoginResponse,
  PlacesResponse,
  InitiateCallData,
  CallLog,
  CallParams,
} from '../types/api.types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      // Re-throw error for caller to handle
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
      const token = (response.data as { token: string }).token;
      this.token = token;
      localStorage.setItem('auth_token', token);
    }

    return response;
  }

  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Log and ignore logout errors - user still gets logged out locally
      if (error instanceof Error) {
        // Optional: Could log to monitoring service
      }
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  // Contacts
  async getContacts(params?: ContactParams): Promise<ApiResponse<Contact[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.request<Contact[]>(`/api/contacts${query}`);
  }

  async createContact(data: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return this.request<Contact>('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return this.request<Contact>(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/contacts/${id}`, { method: 'DELETE' });
  }

  // Places (Lead Finder)
  async searchPlaces(query: {
    query: string;
    location?: string;
    radius?: number;
    type?: string;
    maxResults?: number;
  }): Promise<PlacesResponse> {
    const queryString = new URLSearchParams({
      query: query.query,
      ...(query.location && { location: query.location }),
      ...(query.radius && { radius: query.radius.toString() }),
      ...(query.type && { type: query.type }),
      ...(query.maxResults && { maxResults: query.maxResults.toString() }),
    });

    const response = await this.request<PlacesResponse>(`/api/places/search?${queryString}`);
    return response.data || { places: [], total: 0 };
  }

  async bulkImportPlaces(params: {
    searchQuery: string;
    location?: string;
    maxResults?: number;
  }): Promise<{ count: number }> {
    const response = await this.request<{ count: number }>('/api/places/bulk-import', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data || { count: 0 };
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/api/campaigns');
  }

  async createCampaign(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Virtual Agents
  async getVirtualAgents(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/api/virtual-agents');
  }

  async createVirtualAgent(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/virtual-agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Calls
  async getCallLogs(params?: CallParams): Promise<ApiResponse<CallLog[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.request<CallLog[]>(`/api/calls${query}`);
  }

  async initiateCall(data: InitiateCallData): Promise<ApiResponse<CallLog>> {
    return this.request<CallLog>('/api/calls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }

  // Generic GET request
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // Generic POST request
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic DELETE request
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Set auth token (for when user is already logged in)
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear auth token
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient; // Alias for compatibility
export default apiClient;