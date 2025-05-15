import axios from 'axios';

const API_URL = 'http://localhost:80/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For working with cookies during authorization
  timeout: 15000 // 15 second timeout
});

// Utility function to get full image URL
export const getFullImageUrl = (imagePath: string | null | undefined | { image_path?: string; url?: string; path?: string }): string => {
  // Обрабатываем объекты изображений
  if (imagePath && typeof imagePath === 'object') {
    const imgObj = imagePath as { image_path?: string; url?: string; path?: string };
    imagePath = imgObj.image_path || imgObj.url || imgObj.path || '';
  }
  
  // Преобразуем к строке и проверяем на пустоту
  const path = imagePath as string;
  if (!path) return '';
  
  // If it's already an absolute URL (starts with http or https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a data URI (for SVG placeholders, etc.), return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Ensure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Return the full URL
  return `${API_URL}${normalizedPath}`;
};

// Interceptor for adding token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Enhanced request logging
  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params || {},
    data: config.data || {},
    headers: config.headers || {}
  });
  
  // Log raw query string for debugging
  if (config.params) {
    try {
      // Create a URLSearchParams instance for debugging
      const searchParams = new URLSearchParams();
      
      // Add all params to the URLSearchParams object
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      // Log the raw query string
      console.log('[API REQUEST] Query string:', searchParams.toString());
      
      // Access the URL that would be generated (for debugging)
      const requestUrl = (config.baseURL || API_URL) + (config.url || '') + '?' + searchParams.toString();
      console.log('[API REQUEST] Full URL:', requestUrl);
    } catch (error) {
      console.error('Error building query string:', error);
    }
  }
  
  return config;
}, (error) => {
  console.error('[API ERROR] Request setup error:', error);
  return Promise.reject(error);
});

// Interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Enhanced response logging
    console.log(`[API RESPONSE] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API ERROR] Request timeout:', error.message);
    } else if (error.response) {
      // Server returned response with status other than 2xx
      console.error(`[API ERROR] ${error.response.status} on ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
        data: error.response.data,
        headers: error.response.headers
      });
      
      // On 401 error (not authorized) redirect to login page
      if (error.response.status === 401) {
        console.warn('[API ERROR] Authentication token expired or invalid, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API ERROR] No response received:', error.request);
    } else {
      // Error setting up request
      console.error('[API ERROR] Setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 