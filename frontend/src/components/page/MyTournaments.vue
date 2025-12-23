<script setup>
import {computed, onMounted} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import router from './../../router';
import TournamentCards from "@/components/common/TournamentCards.vue";

const authStore = useAuthStore();
const tournamentStore = useTournamentStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const orgaTournaments = computed(() => tournamentStore.tournaments);

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  // Laden der Turniere
  await tournamentStore.getTournamentsForOrga();
})


/**
 * Öffnen eines Turniers. Je nach Status des Turniers in der Übersicht oder in der Add Players Ansicht
 */
async function openTournament(tournament) {
  if (tournament.state === 'created') {
    await router.push({name: 'Add Players', params: {id: tournament.id}});
  } else {
    await router.push({name: 'Tournament', params: {id: tournament.id}})
  }
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.push({name: 'Landing Page'})"></span>
      <img src="./../../assets/images/logo.svg">
      <h1 class="form-header mb-3 text-center">MY TOURNAMENTS</h1>
      <TournamentCards :tournaments="orgaTournaments" @openTournament="openTournament"></TournamentCards>
      <div class="button-container">
        <button v-on:click="router.push({ name: 'Create Tournament' })">Create</button>
        <button :disabled class="disabled">Join</button>
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