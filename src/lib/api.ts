/**
 * Backend API client for Cloudflare Pages deployment
 * Falls back to /api proxy for local development
 */

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function callBackend<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
  data?: any
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };
    }

    return result;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// MikroTik API calls
export const mikrotik = {
  test: (config: any) => callBackend('/api/mikrotik/test', 'POST', config),
  getPppSecrets: (config: any) => callBackend('/api/mikrotik/ppp/secrets', 'POST', config),
  getActivePpp: (config: any) => callBackend('/api/mikrotik/ppp/active', 'POST', config),
  enableUser: (config: any) => callBackend('/api/mikrotik/ppp/enable', 'POST', config),
  disableUser: (config: any) => callBackend('/api/mikrotik/ppp/disable', 'POST', config),
  updateSpeed: (config: any) => callBackend('/api/mikrotik/ppp/update-speed', 'POST', config),
  addToAddressList: (config: any) => callBackend('/api/mikrotik/address-list/add', 'POST', config),
  getInterfaces: (config: any) => callBackend('/api/mikrotik/interfaces', 'POST', config),
  exec: (config: any) => callBackend('/api/mikrotik/exec', 'POST', config),
};

// OLT API calls
export const olt = {
  test: (config: any) => callBackend('/api/olt/test', 'POST', config),
  proxy: (config: any) => callBackend('/api/olt/proxy', 'POST', config),
};

// Health check
export const health = () => callBackend('/api/health', 'GET');
