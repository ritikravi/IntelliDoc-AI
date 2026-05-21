import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
              { refreshToken }
            );

            const { token, refreshToken: newRefreshToken } = response.data;
            useAuthStore.getState().setTokens(token, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        const message = error.response?.data?.message || 'An error occurred';
        toast.error(message);
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  }

  async register(data: { name: string; email: string; password: string }) {
    const response = await this.api.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  }

  async logout() {
    const response = await this.api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  }

  async getMe() {
    const response = await this.api.get(API_ENDPOINTS.ME);
    return response.data;
  }

  // Document methods
  async uploadDocument(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(API_ENDPOINTS.DOCUMENT_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      },
    });

    return response.data;
  }

  async getDocuments(params?: any) {
    const response = await this.api.get(API_ENDPOINTS.DOCUMENTS, { params });
    return response.data;
  }

  async getDocument(id: string) {
    const response = await this.api.get(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
    return response.data;
  }

  async deleteDocument(id: string) {
    const response = await this.api.delete(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
    return response.data;
  }

  async processDocument(id: string) {
    const response = await this.api.post(`${API_ENDPOINTS.DOCUMENT_PROCESS}/${id}`);
    return response.data;
  }

  // Analytics methods
  async getAnalytics() {
    const response = await this.api.get(API_ENDPOINTS.ANALYTICS_OVERVIEW);
    return response.data;
  }

  async getTrends(period: string = '30d') {
    const response = await this.api.get(API_ENDPOINTS.ANALYTICS_TRENDS, {
      params: { period },
    });
    return response.data;
  }

  async getVendorAnalytics() {
    const response = await this.api.get(API_ENDPOINTS.ANALYTICS_VENDORS);
    return response.data;
  }

  // Search methods
  async search(query: string) {
    const response = await this.api.get(API_ENDPOINTS.SEARCH, {
      params: { q: query },
    });
    return response.data;
  }

  async semanticSearch(query: string) {
    const response = await this.api.post(API_ENDPOINTS.SEMANTIC_SEARCH, { query });
    return response.data;
  }

  // Chat methods
  async chatQuery(query: string, context?: string[]) {
    const response = await this.api.post(API_ENDPOINTS.CHAT_QUERY, { query, context });
    return response.data;
  }
}

export const apiService = new ApiService();
