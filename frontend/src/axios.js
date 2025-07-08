// src/axios.js
import axios from 'axios';

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

export default axios;
