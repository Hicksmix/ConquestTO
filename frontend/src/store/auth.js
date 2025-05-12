// src/store/auth.js
import { defineStore } from 'pinia';
import { getActivePinia } from "pinia";
import axios from '../axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: localStorage.getItem('jwt') !== null, // Prüft, ob ein JWT im LocalStorage vorhanden ist
    }),
    actions: {
        // Führt den Login-Prozess durch
        async login(email, password) {
            try {
                const response = await axios.post('/user/login', { email, password });
                if (response.data.jwt) {
                    this.isAuthenticated = true;

                    // Speichert das JWT im LocalStorage
                    localStorage.setItem('jwt', response.data.jwt);
                }
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },
        // Registriert einen neuen Benutzer und meldet ihn an
        async register(username, password, email, pbwPin) {
            try {
                const response = await axios.put('/user/register', { username, password, email, pbwPin });
                if (response.data.jwt) {
                    this.isAuthenticated = true;

                    // Speichert das JWT im LocalStorage
                    localStorage.setItem('jwt', response.data.jwt);
                }
            } catch (error) {
                console.error('Register failed:', error);
                throw error;
            }
        },
        // Führt den Logout-Prozess durch
        logout() {
            this.isAuthenticated = false;

            // Entfernt das JWT aus dem LocalStorage
            localStorage.removeItem('jwt');

            // Setzt den Zustand aller Stores zurück
            getActivePinia()._s.forEach(store => store.$reset());
        },
    },
});
