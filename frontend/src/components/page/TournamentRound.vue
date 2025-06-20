<script setup>

import router from "@/router";
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import {useRoute} from "vue-router";

const route = useRoute();
const authStore = useAuthStore();
const tournamentStore = useTournamentStore()
const isAuthenticated = computed(() => authStore.isAuthenticated);
const tournamentData = computed(() => tournamentStore.currentTournament);
const tournamentId = route.params.id;
const roundNr = ref(1);

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  await tournamentStore.getTournament(tournamentId);
  await tournamentStore.loadTournamentRound(roundNr.value);
})

function endGame(gameId) {
  tournamentStore.endGame(gameId)
}

function reopenGame(gameId) {
  tournamentStore.reopenGame(gameId)
}

function saveGame(game) {
  if (game.score1 > game.score2) game.winnerId = game.player1Id;
  else if (game.score2 > game.score1) game.winnerId = game.player2Id;
  else game.winnerId = null;
  tournamentStore.updateGame(game);
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <img src="./../../assets/images/logo.svg">
      <div class="mb-3">
        <h1 class="form-header m-0 text-center">{{ tournamentData.name }}</h1>
        <span class="sub-header text-center">{{ tournamentData.date }} | {{ tournamentData.state }}</span>
      </div>
      <span class="sub-header">Matches</span>
      <ul class="card-list w-100">
        <li class="card-container" v-for="game of tournamentData.games ? tournamentData.games : []">
          <div class="card">
            <div class="table-number">{{ game.tableNr }}</div>
            <div class="card-text-container text-truncate">
              <div class="text-truncate w-100 d-flex p-1"
                   :class="[{'winner': game.winnerId === game.player1Id && game.ended}, {'draw': game.winnerId === null && game.ended}, {'loser': game.winnerId === game.player2Id && game.ended}]">
                <span class="card-title">{{ game.player1Name }}</span>
                <span class="pi pi-crown winner-crown dark ms-1"
                      v-if="game.winnerId === game.player1Id && game.ended"></span>
                <span class="ms-auto card-title" v-if="game.ended">{{ game.score1 }}</span>
                <input class="ms-auto minimal-input" type="number" v-else v-model="game.score1"
                       v-on:blur="saveGame(game)">
              </div>
              <hr class="m-0">
              <div class="text-truncate w-100 d-flex p-1"
                   :class="[{'winner': game.winnerId === game.player2Id && game.ended}, {'draw': game.winnerId === null && game.ended}, {'loser': game.winnerId === game.player1Id && game.ended}, ]">
                <span class="card-title">{{ game.player2Name }}</span>
                <span class="pi pi-crown winner-crown dark ms-1"
                      v-if="game.winnerId === game.player2Id && game.ended"></span>
                <span class="ms-auto card-title" v-if="game.ended">{{ game.score2 }}</span>
                <input class="ms-auto minimal-input" type="number" v-else v-model="game.score2"
                       v-on:blur="saveGame(game)">
              </div>
            </div>
          </div>
          <button class="icon-button" v-if="!game.ended" v-on:click="endGame(game.id)">
            <span class="pi pi-check-circle fs-4"></span>
          </button>
          <button class="icon-button" v-else v-on:click="reopenGame(game.id)">
            <span class="pi pi-pen-to-square fs-4"></span>
          </button>
        </li>
      </ul>
      <div class="button-container">
        <button v-on:click="router.push({name: 'Tournament', params: {id: tournamentId}})">Overview
        </button>
        <button>Previous</button>
        <button>Next</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  height: 100%;
  overflow: hidden;
  display: block;

  .container-with-background {
    height: 100%;

    .card-list {
      overflow: auto;
      height: 100%;


      .card-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
        margin-right: 0.25rem;

        .card {
          padding: 0;

          .table-number {
            font-size: 1.5rem;
            font-weight: 800;
            margin: auto 1rem auto 0.5rem;
          }

          .draw {
            background-color: rgba(255, 255, 0, 0.15);
          }

          .winner {
            background-color: rgba(0, 255, 0, 0.20);
          }

          .loser {
            background-color: rgba(255, 0, 0, 0.15);
          }

          .winner-crown {
            font-size: 0.75rem;
            display: flex;
            align-items: center;
          }
        }
      }
    }

    .button-container {
      margin: 0.5rem 1.5rem 0 1.5rem;
    }
  }
}
</style>