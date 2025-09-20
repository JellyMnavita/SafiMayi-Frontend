import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RefreshTokenResponse, TokenError } from '../types/api';

// Configuration de base pour axios
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.safimayi.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour rafraîchir le token
const refreshToken = async (): Promise<string | null> => {
  try {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      console.error('Aucun refresh token trouvé');
      return null;
    }

    const response = await axios.post<RefreshTokenResponse>('https://api.safimayi.com/api/users/token/refresh/', {
      refresh: refresh
    });

    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du refresh du token:', error);
    // Si le refresh échoue, rediriger vers la page de connexion
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }
};

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const errorData = error.response.data as TokenError;
      
      // Vérifier si c'est bien une erreur de token expiré
      if (errorData?.code === 'token_not_valid' && errorData?.detail === 'Given token not valid for any token type') {
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
