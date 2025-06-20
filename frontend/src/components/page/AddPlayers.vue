<script setup>
import {computed, onMounted, ref} from 'vue';
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
const pinOrMail = ref('');
const faction = ref('');
const isLoading = ref(false)

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  await tournamentStore.getTournament(tournamentId);
})


/**
 * Kontrolliert, ob der "einloggen"-Button aktiviert oder deaktiviert ist.
 */
function disableSubmit() {
  return !pinOrMail.value || !faction.value;
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

async function addPlayer() {
  isLoading.value = true;

  try {
    await tournamentStore.addPlayerToTournament(pinOrMail.value, tournamentId, faction.value);
    isLoading.value = false;
    pinOrMail.value = '';
    faction.value = '';
  } catch (error) {
    isLoading.value = false;
  }
}

async function removePlayer(id) {
  isLoading.value = true;

  try {
    await tournamentStore.removePlayerFromTournament(id, tournamentId);
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

async function startTournament() {
  isLoading.value = true;

  try {
    await tournamentStore.startTournament(tournamentId);
    isLoading.value = false;
    await router.push({name: 'Tournament', params: {id: tournamentId}});
  } catch (error) {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <img src="./../../assets/images/logo.svg">
      <div class="mb-3">
        <h1 class="form-header m-0 text-center">{{ tournamentData.name }}</h1>
        <span class="sub-header text-center">{{ tournamentData.date }} | {{ tournamentData.state }}</span>
        <h1 class="form-header m-0 text-center">ADD PLAYERS</h1>
      </div>
      <form class="m-auto mb-3 w-75">
        <div class="form-field">
          <label for="pinOrMail" class="form-label">PBW Pin or Email address</label>
          <input v-model.trim="pinOrMail" id="pinOrMail" type="text" class="form-control" @input="checkValidity">
        </div>
        <div class="form-field">
          <label for="faction" class="form-label">Faction</label>
          <span class="select-icon pi pi-angle-down"></span>
          <select v-model.trim="faction" id="faction" type="text" name="faction" class="form-control"
                  @input="checkValidity">
            <option value="100K">100K</option>
            <option value="spires">Spires</option>
            <option value="dweghom">Dweghom</option>
            <option value="nords">Nords</option>
            <option value="wadrhun">W’adrhŭn</option>
            <option value="old_dominion">Old Dominion</option>
            <option value="sorcerer_kings">Sorcerer Kings</option>
            <option value="Yoroni">Yoroni</option>
          </select>
        </div>
      </form>
      <span class="sub-header">Added players</span>
      <ul class="card-list w-100">
        <li class="card-container" v-for="(player, index) of tournamentData.players">
          <div class="card">
            <div class="placement">{{ index + 1 }}</div>
            <div class="card-text-container text-truncate">
              <div class="text-truncate">
                <span class="card-title">{{ player.username }}</span>
              </div>
              <div class="d-flex">
                <span class="fs-6 text-truncate"> {{ player.pbwPin ? player.pbwPin : player.email }}</span>
              </div>
            </div>
            <div class="faction-icon-container">
              <img class="faction-icon" :src="factionIcons[player.faction]">
            </div>
          </div>
          <button class="icon-button" v-on:click="removePlayer(player.id)">
            <span class="pi pi-minus-circle fs-4"></span>
          </button>
        </li>
      </ul>
      <div class="button-container">
        <button type="button" :disabled="tournamentData?.players?.length < 1"
                :class="{ ['button-loading']: isLoading, ['disabled']: tournamentData?.players?.length < 1 }"
                v-on:click="startTournament()">Start Tourney
        </button>
        <button type="button" :disabled="disableSubmit()"
                :class="{ ['button-loading']: isLoading, ['disabled']: disableSubmit() }"
                v-on:click="addPlayer()">Add Player
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

      .card-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
        margin-right: 0.25rem;

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
    }

    .button-container {
      margin: 0.5rem 1.5rem 0 1.5rem;
    }
  }
}
</style>