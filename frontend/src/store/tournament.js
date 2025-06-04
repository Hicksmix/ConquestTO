import {defineStore} from 'pinia';
import axios from '../axios';

export const useTournamentStore = defineStore('tournament', {
    state: () => ({
        tournaments: [],
        currentTournament: {}
    }),
    actions: {
        // Führt den Login-Prozess durch
        async createTournament(name, date) {
            try {
                const response = await axios.put('/tournament/create', {name, date});
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
        },
        async getTournament(tournamentId) {
            try {
                const response = await axios.get('tournament/get-tournament', {params: {tournamentId}});
                if (response.data.tournament) {
                    this.currentTournament = response.data.tournament
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Loading tournaments failed:', error);
                throw error;
            }
        },
        async addPlayerToTournament(pinOrMail, tournamentId, faction) {
            try {
                const response = await axios.post('tournament/add-player', {pinOrMail, tournamentId, faction});
                if (response.data.tournament) {
                    this.currentTournament = response.data.tournament
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Adding player failed:', error);
                throw error;
            }
        },
        async removePlayerFromTournament(userId, tournamentId) {
            try {
                const response = await axios.delete('tournament/remove-player', {data: {userId, tournamentId}});
                if (response.data.tournament) {
                    this.currentTournament = response.data.tournament
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Removing player failed:', error);
                throw error;
            }
        },
    },
});
