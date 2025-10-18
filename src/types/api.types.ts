// API type definitions

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position?: string;
  status: string;
  source?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  company: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    company: string;
  };
}

export interface Place {
  place_id: string;
  name: string;
  address: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
}

export interface PlacesSearchParams {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
}

export interface PlacesResponse {
  places: Place[];
  total: number;
}

export interface ImportResponse {
  count: number;
  contacts: Contact[];
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  targetAudience?: string;
  message?: string;
}

export interface VirtualAgent {
  id: string;
  name: string;
  type: string;
  status: string;
  configuration?: Record<string, unknown>;
}

export interface CallLog {
  id: string;
  contactId: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  status: string;
  duration: number;
  recordingUrl?: string;
  createdAt: string;
}

export interface CallParams {
  from?: string;
  to?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface InitiateCallData {
  to: string;
  from: string;
  contactId?: string;
}
