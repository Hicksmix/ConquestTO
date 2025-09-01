// src/axios.js
import axios from 'axios';
import { toastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';

//configure cors
axios.defaults.withCredentials = true;
//configure baseURL
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL + '/api';

// Interceptor, der die sessionID zu jeder Anfrage hinzufügt, falls vorhanden
axios.interceptors.request.use((config) => {
    const jwt = localStorage.getItem('cto_jwt');
    if (jwt) {
        config.params = { ...config.params, jwt: jwt };
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor, der Errors vom Backend abfängt und als Toast anzeigt
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.data?.title) {
            toastStore.toasts.push({ summary: error.response.data.title, detail: error.response.data.text, severity: 'error' });
            if(error.response.data.auth === false && await useAuthStore().isAuthenticated) useAuthStore().logout();
        }
        return Promise.reject(error);
    }
);

export default axios;
