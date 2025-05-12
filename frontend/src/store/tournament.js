import { defineStore } from 'pinia';
import { getActivePinia } from "pinia";
import axios from '../axios';

export const useTournamentStore = defineStore('tournament', {
    state: () => ({
        tournaments: new Map()
    }),
    actions: {
        // Führt den Login-Prozess durch
        async createTournament(name, date) {
            try {
                const response = await axios.put('/tournament/create', { name, date });
                if (response.data.result) {
                    return response.data.result;
                }
            } catch (error) {
                console.error('Create tournament failed:', error);
                throw error;
            }
        },
        // async getTournament(id) {
        //     try {
        //         const response = await axios.get('/tour')
        //     }
        // }
    },
});
