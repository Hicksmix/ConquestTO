<script setup>
import {computed, onMounted} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import router from './../../router';

const authStore = useAuthStore();
const tournamentStore = useTournamentStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const orgaTournaments = computed(() => tournamentStore.tournaments);

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  await tournamentStore.getTournamentsForOrga();
})
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <img src="./../../assets/images/logo.svg">
      <h1 class="form-header mb-3 text-center">MY TOURNAMENTS</h1>
        <ul class="tournament-cards card-list w-100">
          <li class="card" v-for="tournament of orgaTournaments" v-on:click="router.push({name: 'Tournament', params: {id: tournament.id}})">
            <div class="card-text-container">
              <span class="card-title">{{ tournament.name }}</span>
              <div class="d-flex">
                <span>{{ tournament.date }}</span>
                <span class="ms-auto me-1">{{ tournament.state }}</span>
              </div>
            </div>
            <span class="pi pi-arrow-right dark card-icon"></span>
          </li>
        </ul>
      <div class="button-container">
        <button v-on:click="router.push({ name: 'Create Tournament' })">Create</button>
        <button>Join</button>
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

      .tournament-cards {
        overflow: auto;
        height: 100%;
      }

    .button-container {
      margin: 0.5rem 1.5rem 0 1.5rem;
    }
  }
}
</style>