import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1';

const client = axios.create({
    baseURL: API_BASE,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor: Attach Bearer Token
client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 — redirect to login
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only logout and clear state; let the React ProtectedRoute handle redirection
            // avoid window.location.href as it causes a hard reload and potential rate-limit loops
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default client;
