<script setup>
import {computed, onMounted} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import {filename} from 'pathe/utils'
import router from './../../router';
import {useRoute} from "vue-router";

const route = useRoute();
const authStore = useAuthStore();
const tournamentStore = useTournamentStore()
const isAuthenticated = computed(() => authStore.isAuthenticated);
const tournamentData = computed(() => tournamentStore.currentTournament);
const glob = import.meta.glob('@/assets/images/faction-icons/*.png', {eager: true});
const factionIcons = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value.default])
);
const tournamentId = route.params.id

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  await tournamentStore.getTournament(tournamentId);
})

</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.push({ name: 'My Tournaments'})"></span>
      <img src="./../../assets/images/logo.svg">
      <div class="mb-3">
        <h1 class="form-header m-0 text-center">{{ tournamentData.name }}</h1>
        <span class="sub-header text-center">{{ new Date(tournamentData.date).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) }} | {{ tournamentData.state }}</span>
      </div>
      <span class="sub-header">Players</span>
      <ul class="card-list w-100">
        <li class="card" v-for="(player, index) of tournamentData.players">
          <div class="placement">{{ index + 1 }}</div>
          <div class="card-text-container text-truncate">
            <div class="text-truncate">
              <span class="card-title">{{ player.username }}</span>
              <span class="fs-6 text-truncate"> ({{ player.pbwPin ? player.pbwPin : player.email }})</span>
            </div>
            <div class="d-flex">
              <span class="text-truncate">TP: {{ player.TP }}, SoS: {{ player.SoS }}, VP: {{ player.VP }};
                {{`${player.winCount}/${player.lossCount}/${player.drawCount}`}}</span>
            </div>
          </div>
          <div class="faction-icon-container">
            <img class="faction-icon" :src="factionIcons[player.faction]">
          </div>
        </li>
      </ul>
      <div class="button-container">
        <button :class="[{disabled: tournamentData.state !== 'created'}]" :disabled="tournamentData.state !== 'created'"
                v-on:click="router.push({name: 'Add Players', params: {id: tournamentId}})">Add Players
        </button>
        <button :class="[{disabled: tournamentData.state === 'created'}]" :disabled="tournamentData.state === 'created'"
                v-on:click="router.push({name: 'Tournament Round', params: {id: tournamentId}})">Rounds
        </button>
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

      .placement {
        font-size: 1.5rem;
        font-weight: 800;
        margin: auto 0.5rem auto 0.25rem;
      }

      .faction-icon-container {
        min-width: 40px;
        height: 40px;
        margin: auto 0.25rem auto 0.5rem;
        display: flex;
        justify-content: center;

        .faction-icon {
          height: 100%;
        }
      }
    }

    .button-container {
      margin: 0.5rem 1.5rem 0 1.5rem;
    }
  }
}
</style>