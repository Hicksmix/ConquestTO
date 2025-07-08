// src/store/auth.js
import { defineStore } from 'pinia';
import { getActivePinia } from "pinia";
import axios from '../axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: localStorage.getItem('cto_jwt') !== null, // Prüft, ob ein JWT im LocalStorage vorhanden ist
        currentUser: {}
    }),
    actions: {
        // Führt den Login-Prozess durch
        async login(email, password) {
            try {
                const response = await axios.post('/user/login', { email, password });
                if (response.data.jwt) {
                    this.isAuthenticated = true;

                    // Speichert das JWT im LocalStorage
                    localStorage.setItem('cto_jwt', response.data.jwt);
                    this.currentUser = response.data.user;
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
                    localStorage.setItem('cto_jwt', response.data.jwt);
                    this.currentUser = response.data.user;
                }
            } catch (error) {
                console.error('Register failed:', error);
                throw error;
            }
        },
        async loadUser() {
            if(this.isAuthenticated) {
                try {
                    const response = await axios.get('/user/load');
                    if (response.data) {
                        this.currentUser = response.data;
                    }
                } catch (error) {
                    console.error('Register failed:', error);
                    throw error;
                }
            }
        },
        // Registriert einen neuen Benutzer und meldet ihn an
        async editUser(username, password, pbwPin) {
            try {
                const response = await axios.post('/user/edit', { username, password, pbwPin });
                if (response.data) {
                    this.currentUser = response.data.user;
                }
            } catch (error) {
                console.error('Register failed:', error);
                throw error;
            }
        },
        // Führt den Logout-Prozess durch
        logout() {
            this.isAuthenticated = false;
            this.currentUser = null;

            // Entfernt das JWT aus dem LocalStorage
            localStorage.removeItem('cto_jwt');

            // Setzt den Zustand aller Stores zurück
            getActivePinia()._s.forEach(store => store.$reset());
        },
    },
});
