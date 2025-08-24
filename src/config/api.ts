// Detect protocol automatically
const getProtocol = () => {
  if (typeof window !== 'undefined') {
    return window.location.protocol;
  }
  return 'https:';
};

// Build base URL with proper protocol
const buildBaseURL = () => {
  const protocol = getProtocol();
  const host = import.meta.env.VITE_API_URL || '185.201.9.64:3002';
  
  // If VITE_API_URL is provided, use it as-is
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, build URL with detected protocol
  return `${protocol}//${host}`;
};

export const API_CONFIG = {
  baseURL: buildBaseURL(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  enableLogging: import.meta.env.VITE_API_LOGGING === 'true',
} as const;

export const API_ENDPOINTS = {
  dashboard: {
    overview: '/api/dashboard/overview',
    dailyChart: '/api/dashboard/chart/daily',
    monthlyChart: '/api/dashboard/chart/monthly',
  },
  users: {
    activity: '/api/dashboard/users/activity',
    all: '/api/dashboard/users/all',
    stats: '/api/dashboard/users/stats',
    transactions: (userId: string) => `/api/dashboard/users/${userId}/transactions`,
  },
  transactions: {
    search: (reffId: string) => `/api/dashboard/transactions/search/${reffId}`,
    recent: (limit?: number) => `/api/dashboard/transactions/recent${limit ? `?limit=${limit}` : ''}`,
  },
  products: {
    stats: '/api/dashboard/products/stats',
  },
  export: (format: string) => `/api/dashboard/export/${format}`,
} as const; 