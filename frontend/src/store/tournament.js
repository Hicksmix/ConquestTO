import { defineStore } from 'pinia';
import { getActivePinia } from "pinia";
import axios from '../axios';

export const useTournamentStore = defineStore('tournament', {
    state: () => ({
        tournaments: []
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
        async getTournamentsForOrga() {
            try {
                const response = await axios.get('tournament/get-for-orga');
                if (response.data.tournaments) {
                    this.tournaments = response.data.tournaments
                    return response.data.tournaments;
                }
            } catch (error) {
                console.error('Loading tournaments failed:', error);
                throw error;
            }
        }
    },
});
