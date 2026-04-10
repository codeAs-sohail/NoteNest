import axios from 'axios';

const api = axios.create({
  // Trailing slash is critical: axios + relative baseURL needs it to correctly
  // concatenate paths like 'notes/all/' → '/api/notes/all/', not '/notes/all/'
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/?$/, '/'),
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notenest_access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('notenest_refresh');
      
      if (refreshToken) {
        try {
          // NOTE: Your backend currently misses a refresh endpoint.
          // This call will fail until path('api/auth/token/refresh/', TokenRefreshView.as_view()) 
          // is added to the backend urls.py.
          const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('notenest_access', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out
          localStorage.removeItem('notenest_access');
          localStorage.removeItem('notenest_refresh');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
