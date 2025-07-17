import {defineStore} from 'pinia';
import axios from '../axios';

export const useTournamentStore = defineStore('tournament', {
    state: () => ({
        tournaments: [],
        currentTournament: {}
    }),
    actions: {
        undefined,
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
        async addPlayerToTournament(pinOrMail, tournamentId, faction, teamName) {
            try {
                const response = await axios.post('tournament/add-player', {
                    pinOrMail,
                    tournamentId,
                    faction,
                    teamName
                });
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
        async startTournament(tournamentId) {
            try {
                const response = await axios.post('tournament/start', {tournamentId});
                if (response.data.tournament) {
                    this.currentTournament = response.data.tournament
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Starting tournament failed:', error);
                throw error;
            }
        },
        async endTournament(tournamentId) {
            try {
                const response = await axios.post('tournament/end', {tournamentId});
                if (response.data.tournament) {
                    this.currentTournament = response.data.tournament
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Ending tournament failed:', error);
                throw error;
            }
        },
        async loadTournamentRound(roundNr) {
            try {
                const response = await axios.get('/games/get-tournament-round', {
                    params: {
                        tournamentId: this.currentTournament.id,
                        roundNr
                    }
                });
                if (response.data.games) {
                    this.currentTournament.games = response.data.games;
                    return response.data.games;
                }
            } catch (error) {
                console.error('Loading games failed:', error);
                throw error;
            }
        },
        async endGame(gameId) {
            try {
                const response = await axios.put('/games/end', {gameId, tournamentId: this.currentTournament.id});
                if (response.data) {
                    this.currentTournament = response.data.tournament;
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Ending game failed:', error);
                throw error;
            }
        },
        async reopenGame(gameId) {
            try {
                const response = await axios.put('/games/reopen', {gameId, tournamentId: this.currentTournament.id});
                if (response.data) {
                    this.currentTournament = response.data.tournament;
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Reopening game failed:', error);
                throw error;
            }
        },
        async updateGame(game) {
            try {
                const response = await axios.put('/games/update-score', {
                    game,
                    tournamentId: this.currentTournament.id
                });
                if (response.data) {
                    const index = this.currentTournament.games.indexOf(game);
                    this.currentTournament.games[index] = response.data;
                    return response.data;
                }
            } catch (error) {
                console.error('Reopening game failed:', error);
                throw error;
            }
        },
        async endTournamentRound() {
            try {
                const response = await axios.post('/tournament/end-round', {tournamentId: this.currentTournament.id});
                if (response.data) {
                    this.currentTournament = response.data
                    return response.data;
                }
            } catch (error) {
                console.error('Ending tournament round failed:', error);
                throw error;
            }
        },
        async createTournamentRound() {
            try {
                const response = await axios.post('/tournament/create-round', {tournamentId: this.currentTournament.id});
                if (response.data) {
                    this.currentTournament = response.data
                    return response.data;
                }
            } catch (error) {
                console.error('Creating tournament round failed:', error);
                throw error;
            }
        },
        async startTournamentRound() {
            try {
                const response = await axios.post('/tournament/start-round', {tournamentId: this.currentTournament.id});
                if (response.data) {
                    this.currentTournament = response.data
                    return response.data;
                }
            } catch (error) {
                console.error('Starting tournament round failed:', error);
                throw error;
            }
        },
        async swapPlayers(game1Id, game2Id, userIdToSwapFromGame1, userIdToSwapFromGame2) {
            try {
                const response = await axios.put('/games/swap-players', {
                    game1Id,
                    game2Id,
                    userIdToSwapFromGame1,
                    userIdToSwapFromGame2
                });
                if (response.data) {
                    this.currentTournament = response.data
                    return response.data;
                }
            } catch (error) {
                console.error('Swapping players failed:', error);
                throw error;
            }
        },
    },
});
