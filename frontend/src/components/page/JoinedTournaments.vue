<script setup>
import router from "@/router";
import {computed, onMounted, ref} from "vue";
import {useTournamentStore} from "@/store/tournament";
import {useAuthStore} from "@/store/auth";
import TournamentCards from "@/components/common/TournamentCards.vue";

const tournamentStore = useTournamentStore()
const authStore = useAuthStore();
const currentUser = computed(() => authStore.currentUser);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const pageNr = ref(1);
const pageCount = computed(() => tournamentStore.pageCount);
const tournaments = computed(() => tournamentStore.tournaments);

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  await tournamentStore.getTournamentsForParticipant(pageNr.value);
})

async function selectPage(newPageNr) {
  pageNr.value = newPageNr
  await tournamentStore.getTournamentsForParticipant(newPageNr);
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

</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.back()"></span>
      <img src="./../../assets/images/logo.svg">
      <h1 class="form-header mb-3 text-center">JOINED TOURNAMENTS</h1>
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