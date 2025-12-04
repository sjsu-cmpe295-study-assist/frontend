/**
 * API client for authentication endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: response.statusText,
    }));
    throw new ApiError(response.status, errorData.detail || 'Request failed');
  }

  return response.json();
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupData): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Store token
  setAuthToken(response.access_token);
  
  return response;
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<UserResponse> {
  return apiRequest<UserResponse>('/auth/me');
}

/**
 * Logout user
 */
export function logout(): void {
  removeAuthToken();
}

