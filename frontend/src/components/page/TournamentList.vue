<script setup>
import router from "@/router";
import {computed, onMounted, ref} from "vue";
import {useTournamentStore} from "@/store/tournament";
import {useAuthStore} from "@/store/auth";
import Dialog from "primevue/dialog";
import TournamentCards from "@/components/common/TournamentCards.vue";

const tournamentStore = useTournamentStore()
const authStore = useAuthStore();
const currentUser = computed(() => authStore.currentUser);
const pageNr = ref(1);
const dialogVisible = ref(false);
const pageCount = computed(() => tournamentStore.pageCount);
const tournaments = computed(() => tournamentStore.tournaments);
const fromDate = ref();
const toDate = ref();
const country = ref();
const city = ref();
const maxPlayers = ref();
const name = ref();
const hasSlots = ref(false);
const isLoading = ref(false);
let filters = {};

onMounted(async () => {
  await tournamentStore.getTournamentPage(pageNr.value);
})

/**
 * Wechselt die aktuelle Seite
 * @param newPageNr
 * @returns {Promise<void>}
 */
async function selectPage(newPageNr) {
  pageNr.value = newPageNr
  await tournamentStore.getTournamentPage(newPageNr, filters);
}

/**
 * Öffnen eines Turniers. Je nach Status des Turniers in der Übersicht oder in der Add Players Ansicht
 */
async function openTournament(tournament) {
  if (tournament.state === 'created' && tournament.orgaId === currentUser.value.id) {
    await router.push({name: 'Add Players', params: {id: tournament.id}});
  } else {
    await router.push({name: 'Tournament', params: {id: tournament.id}})
  }
}

/**
 * Speichert die gesetzten Filter und lädt die erste Seite
 * @returns {Promise<void>}
 */
async function saveFilters() {
  filters = {};
  if (fromDate.value) filters.fromDate = fromDate.value;
  if (toDate.value) filters.toDate = toDate.value;
  if (country.value) filters.country = country.value;
  if (city.value) filters.city = city.value;
  if (maxPlayers.value) filters.maxPlayers = maxPlayers.value;
  if (hasSlots.value) filters.hasSlots = hasSlots.value;
  if (name.value) filters.name = name.value;
  pageNr.value = 1;

  try {
    isLoading.value = true;
    await tournamentStore.getTournamentPage(pageNr.value, filters);
    dialogVisible.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Setzt die Filter zurück und lädt die erste Seite
 * @returns {Promise<void>}
 */
async function resetFilters() {
  filters = {};
  fromDate.value = null;
  toDate.value = null;
  country.value = null;
  city.value = null;
  maxPlayers.value = null;
  hasSlots.value = false;
  pageNr.value = 1;

  try {
    isLoading.value = true;
    await tournamentStore.getTournamentPage(pageNr.value, filters);
    dialogVisible.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.back()"></span>
      <img src="./../../assets/images/logo.svg">
      <h1 class="form-header text-center mb-0">TOURNAMENTS</h1>
      <div class="sub-header text-center">
        <div class="d-inline-flex gap-1 text-center align-items-center ms-1" v-on:click="dialogVisible = true">
          <span class="pi pi-sliders-h"></span>
          <span>Filters</span>
        </div>
      </div>
      <TournamentCards :tournaments="tournaments" @openTournament="openTournament"></TournamentCards>
      <div class="page-select mt-auto">
            <span class="pi pi-angle-left" v-on:click="selectPage(pageNr - 1)" :class="[{'disabled': pageNr <= 1}]"
                  :disabled="pageNr <= 1"></span>
        <span v-for="index in pageCount" :class="[{'active': index === pageNr}]"
              v-on:click="selectPage(index)">{{ index }}</span>
        <span class="pi pi-angle-right" v-on:click="selectPage(pageNr + 1)"
              :class="[{'disabled': pageNr >= pageCount}]"
              :disabled="pageNr >= pageCount"></span>
      </div>
    </div>
  </div>


  <Dialog v-model:visible="dialogVisible" modal header="FILTERS" :style="{ width: '15rem' }" :closable="false">
    <form class="m-auto mb-3 w-75">
      <div class="form-field">
        <label for="name" class="form-label">Name</label>
        <input v-model.trim="name" id="name" type="text" class="form-control">
      </div>
      <div class="form-field">
        <label for="from-date" class="form-label">From</label>
        <input v-model.trim="fromDate" id="from-date" type="date" class="form-control">
      </div>
      <div class="form-field">
        <label for="to-date" class="form-label">To</label>
        <input v-model.trim="toDate" id="to-date" type="date" class="form-control">
      </div>
      <div class="form-field">
        <label for="country" class="form-label">Country</label>
        <input v-model.trim="country" id="country" type="text" class="form-control">
      </div>
      <div class="form-field">
        <label for="city" class="form-label">City</label>
        <input v-model.trim="city" id="city" type="text" class="form-control">
      </div>
      <div class="form-field">
        <label for="max-players" class="form-label">Max Players</label>
        <input v-model.trim="maxPlayers" id="max-players" type="text" class="form-control">
      </div>
      <div class="form-field checkbox">
        <label for="has-slots" class="form-label">Has free slots</label>
        <input v-model.trim="hasSlots" id="has-slots" type="checkbox" class="form-control">
      </div>
    </form>
    <template #footer>
      <div class="button-container">
        <button v-on:click="saveFilters()">Save</button>
        <button v-on:click="resetFilters()">Reset</button>
        <button class="secondary" v-on:click="dialogVisible=false">Cancel</button>
      </div>
    </template>
  </Dialog>
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

    .page-select {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > span {
        font-size: 1.25rem;
        font-weight: 600;

        &.active {
          color: var(--color-active);
        }
      }
    }

    .button-container {
      margin: 0.5rem 1.5rem 0 1.5rem;
    }
  }
}

</style>