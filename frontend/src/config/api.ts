export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  AI_SERVICE_URL: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  GOOGLE_AUTH: '/auth/google',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ME: '/auth/me',
  
  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_UPLOAD: '/documents/upload',
  DOCUMENT_PROCESS: '/documents/process',
  DOCUMENT_EXPORT: '/documents/export',
  
  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_OVERVIEW: '/analytics/overview',
  ANALYTICS_TRENDS: '/analytics/trends',
  ANALYTICS_VENDORS: '/analytics/vendors',
  
  // Search
  SEARCH: '/search',
  SEMANTIC_SEARCH: '/search/semantic',
  
  // Chat
  CHAT: '/chat',
  CHAT_QUERY: '/chat/query',
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
};
