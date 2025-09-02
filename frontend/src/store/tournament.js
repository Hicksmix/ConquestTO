/**
 * Store zum Verwalten der Authentifizierung
 */
import {defineStore} from 'pinia';
import axios from '../axios';

export const useTournamentStore = defineStore('tournament', {
    state: () => ({
        tournaments: [],
        currentTournament: {}
    }),
    actions: {
        // Erstellt ein neues Turnier
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
        // Lädt die Turniere, die man selbst organisiert hat
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
        // Lädt die Daten eines Turniers
        async getTournament(tournamentId) {
            try {
                const response = await axios.get('tournament/get-tournament', {params: {tournamentId}});
                if (response.data.tournament) {
                    this.currentTournament = response.data.tournament
                    return response.data.tournament;
                }
            } catch (error) {
                console.error('Loading tournament failed:', error);
                throw error;
            }
        },
        // Fügt einen Spieler zu einem Turnier hinzu
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
        // Entfernt einen Spieler aus einem Turnier
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
        // Startet ein Turnier. Danach können keine weiteren Spieler hinzugefügt oder entfernt werden
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
        // Beendet ein Turnier. Danach können keine weiteren Turnier- oder Spieldaten bearbeitet werden
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
        // Lädt die Daten einer Runde
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
        // Beendet ein Spiel
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
        // Eröffnet ein Spiel wieder. Nur möglich, wenn die Runde noch nicht beendet wurde
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
        // Aktualisiert die Daten eines Spiels
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
                console.error('Updating game failed:', error);
                throw error;
            }
        },
        // Beendet eine Turnierrunde. Danach können keine Daten der Runde mehr verändert werden
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
        // Erstellt eine Turnierrunde
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
        // Startet eine Turnierrunde. Danach ist das Tauschen von Paarungen nicht mehr für diese Runde möglich
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
        // Tauscht zwei Spieler
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
