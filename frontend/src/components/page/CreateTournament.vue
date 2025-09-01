<script setup>
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import router from "@/router";

const authStore = useAuthStore();
const tournamentStore = useTournamentStore();
const name = ref('');
const date = ref('');
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false);

/**
 * Überprüft, ob Nutzer authentifiziert ist.
 * Wenn der Nutzer bereits eingeloggt ist -> Weiterleitung Profilseite.
 * Ruft checkValidity auf -> Überprüfung der Gültigkeit der Eingaben
 */
onMounted(() => {
  if (!isAuthenticated.value) router.push({ name: 'Login' });
  checkValidity({target: document.getElementById('name')});
  checkValidity({target: document.getElementById('date')});
})

async function createTournament() {
  isLoading.value = true;
  try {
    const tournamentId = await tournamentStore.createTournament(name.value, date.value);
    isLoading.value = false;
    await router.push({name: "Add Players", params: {id: tournamentId}})
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Kontrolliert, ob der "einloggen"-Button aktiviert oder deaktiviert ist.
 */
function disableSubmit() {
  return !name.value || !date.value;
}

/**
 * Überprüft, ob das übergebene Eingabefeld (name, date) einen gültigen Wert enthält.
 * Setzt eventuell Fehlermeldung
 * @param e
 */
function checkValidity(e) {
  if (!e.target.value) {
    e.target.setCustomValidity("This field is mandatory");
  } else {
    e.target.setCustomValidity("")
  }
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.back()"></span>
      <img src="./../../assets/images/logo.svg">
      <form class="m-auto" @submit.prevent="createTournament">
        <h1 class="form-header text-center">CREATE TOURNAMENT</h1>
        <div class="form-field">
          <label for="name" class="form-label">Name</label>
          <input v-model.trim="name" id="name" type="text" class="form-control" @input="checkValidity">
        </div>
        <div class="form-field">
          <label for="date" class="form-label">Date</label>
          <input v-model.trim="date" id="date" type="date" class="form-control" @input="checkValidity">
        </div>

        <div class="button-container mt-4">
          <button class="button" type="submit" :disabled="disableSubmit()"
                  :class="{ ['button-loading']: isLoading }">Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>