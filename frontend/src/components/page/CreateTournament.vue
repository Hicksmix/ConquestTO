<script setup>
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import router from "@/router";

const authStore = useAuthStore();
const tournamentStore = useTournamentStore();
const name = ref('');
const date = ref('');
const country = ref('');
const city = ref('');
const zip = ref('');
const address = ref('');
const externalLink = ref('');
const description = ref('');
const endDate = ref('');
const maxPlayers = ref('');
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false);
const currentPage = ref(0);

onMounted(() => {
  // Authentifizierung überprüfen, sonst Weiterleitung zum Login
  if (!isAuthenticated.value) router.push({name: 'Login'});

  // Erster checkValidity auf Name und Datum
  checkValidity({target: document.getElementById('name')});
  checkValidity({target: document.getElementById('start-date')});
  checkValidity({target: document.getElementById('max-players')});
})


/**
 * Erstellt ein Turnier und leitet zur Seite zum Spieler hinzufügen weiter
 */
async function createTournament() {
  isLoading.value = true;
  try {
    const tournamentId = await tournamentStore.createTournament(name.value, date.value, endDate.value, maxPlayers.value,
        country.value, city.value, zip.value, address.value, description.value, externalLink.value);
    isLoading.value = false;
    await router.push({name: "Add Players", params: {id: tournamentId}})
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Kontrolliert, ob der "Submit"-Button aktiviert oder deaktiviert ist.
 */
function disableSubmit() {
  return !name.value || !date.value || !maxPlayers.value || !country.value || !address.value || !city.value || !zip.value;
}

/**
 * Kontrolliert, ob der "Continue"-Button aktiviert oder deaktiviert ist.
 */
function disableContinue() {
  return !name.value || !date.value || !maxPlayers.value;
}

/**
 * Überprüft, ob das übergebene Eingabefeld (name, date) einen gültigen Wert enthält.
 * Setzt eventuell Fehlermeldung
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
        <template v-if="currentPage === 0">
          <div class="form-field">
            <label for="name" class="form-label">Name*</label>
            <input v-model.trim="name" id="name" type="text" class="form-control" @input="checkValidity">
          </div>
          <div class="form-field">
            <label for="start-date" class="form-label">Start Date*</label>
            <input v-model.trim="date" id="start-date" type="date" class="form-control" @input="checkValidity">
          </div>
          <div class="form-field">
            <label for="end-date" class="form-label">End Date</label>
            <input v-model.trim="endDate" id="end-date" type="date" class="form-control">
          </div>
          <div class="form-field">
            <label for="max-players" class="form-label">Max Players*</label>
            <input v-model.trim="maxPlayers" id="max-players" type="number" class="form-control" @input="checkValidity">
          </div>
        </template>
        <template v-if="currentPage === 1">
          <div class="form-field">
            <label for="country" class="form-label">Country*</label>
            <input v-model.trim="country" id="country" type="text" class="form-control" @input="checkValidity">
          </div>
          <div class="form-field">
            <label for="city" class="form-label">City*</label>
            <input v-model.trim="city" id="city" type="text" class="form-control" @input="checkValidity">
          </div>
          <div class="form-field">
            <label for="zip" class="form-label">ZIP Code*</label>
            <input v-model.trim="zip" id="zip" type="number" class="form-control" @input="checkValidity">
          </div>
          <div class="form-field">
            <label for="address" class="form-label">Address*</label>
            <input v-model.trim="address" id="address" type="text" class="form-control" @input="checkValidity">
          </div>
          <div class="form-field">
            <label for="link" class="form-label">External Link</label>
            <input v-model.trim="externalLink" id="address" type="text" class="form-control">
          </div>
          <div class="form-field">
            <label for="description" class="form-label">Description</label>
            <textarea v-model.trim="description" id="description" class="form-control"></textarea>
          </div>
        </template>

        <div class="button-container mt-4">
          <button class="button" type="button" :disabled="currentPage <= 0"
                  :class="{ ['button-loading']: isLoading, ['disabled']: currentPage <= 0 }"
                  v-on:click="currentPage -= 1">Previous
          </button>
          <button class="button" type="button" :disabled="disableContinue()" v-if="currentPage === 0"
                  :class="{ ['button-loading']: isLoading, ['disabled']: disableContinue() }"
                  v-on:click="currentPage += 1">Continue
          </button>
          <button class="button" type="submit" :disabled="disableSubmit()" v-else
                  :class="{ ['button-loading']: isLoading, ['disabled']: disableSubmit() }">Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>