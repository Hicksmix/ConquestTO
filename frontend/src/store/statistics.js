/**
 * Store zum Verwalten der Statistiken und des Users
 */
import {defineStore} from 'pinia';
import axios from "@/axios";

export const useStatisticsStore = defineStore('statistics', {
    state: () => ({
        statistics: {}
    }),
    actions: {
        async loadStatisticsForFactionAndTimeframe(faction, startDate, endDate) {
            try {
                const response = await axios.get('/games/get-faction-statistics', {
                    params: {faction, startDate, endDate}
                });
                if (response.data) {
                    this.statistics[faction] = response.data;
                    return response.data;
                }

            } catch (error) {
                console.error('Loading statistics failed:', error);
                throw error;
            }
        },
        async loadAllStatisticsForTimeframe(startDate, endDate) {
            try {
                const response = await axios.get('/games/get-all-statistics', {
                    params: {startDate, endDate}
                });
                if (response.data) {
                    this.statistics = response.data;
                    return response.data;
                }

            } catch (error) {
                console.error('Loading statistics failed:', error);
                throw error;
            }
        },
    },
});
