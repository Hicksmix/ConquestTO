<script setup>
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import {filename} from 'pathe/utils'
import router from './../../router';
import {useRoute} from "vue-router";
import ConfirmDialog from 'primevue/confirmdialog';
import {useConfirm} from "primevue/useconfirm";

const confirm = useConfirm();
const route = useRoute();
const authStore = useAuthStore();
const tournamentStore = useTournamentStore()
const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.currentUser);
const tournamentData = computed(() => tournamentStore.currentTournament);
const glob = import.meta.glob('@/assets/images/faction-icons/*.png', {eager: true});
const factionIcons = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value.default])
);
const tournamentId = route.params.id
const pinOrMail = ref('');
const faction = ref('');
const team = ref('');
const isLoading = ref(false);

onMounted(async () => {
  // Authentifizierung überprüfen, sonst Weiterleitung zum Login
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  // Laden der Daten, des geöffneten Turniers
  await tournamentStore.getTournament(tournamentId);
  if (tournamentData.value.orgaId !== currentUser.value.id)
    await router.push({name: 'Tournament', params: {id: tournamentId}})
})


/**
 * Kontrolliert, ob der "Add User"-Button aktiviert oder deaktiviert ist.
 */
function disableSubmit() {
  return !pinOrMail.value || !faction.value || tournamentData.value?.state !== 'created' || tournamentData.value?.maxPlayers <= tournamentData.value?.players?.length;
}

/**
 * Überprüft, ob das Eingabefeld des Events ausgefüllt ist.
 * Setzt eventuell Fehlermeldung
 */
function checkValidity(e) {
  if (!e.target.value) {
    e.target.setCustomValidity("This field is mandatory");
  } else {
    e.target.setCustomValidity("")
  }
}

/**
 * Fügt einen Spieler zum Turnier hinzu
 */
async function addPlayer() {
  isLoading.value = true;

  // Versucht den Spieler hinzuzufügen. Je nach Erfolg werden die Daten des Formulars zurück gesetzt
  try {
    await tournamentStore.addPlayerToTournament(pinOrMail.value, tournamentId, faction.value, team.value);
    isLoading.value = false;
    pinOrMail.value = '';
    faction.value = '';
    team.value = '';
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Entfernt einen Spieler aus dem Turnier
 */
async function removePlayer(id) {
  isLoading.value = true;

  // Öffnen eines Bestätigungsdialogs
  confirm.require({
    message: "Are you sure you want to remove the player?",
    header: "REMOVE PLAYER",
    rejectProps: {
      label: "Cancel",
      severity: "secondary"
    },
    acceptProps: {
      label: "Remove"
    },
    // Bei Bestätigen wird der Spieler entfernt
    accept: async () => {
      try {
        await tournamentStore.removePlayerFromTournament(id, tournamentId);
        isLoading.value = false;
      } catch (error) {
        isLoading.value = false;
      }
    },
    reject: () => {
      isLoading.value = false;
    }
  })
}

/**
 * Startet das Turnier. Danach kann man keine weiteren Spieler hinzufügen oder entfernen. Leitet automatisch zur Turnierübersicht weiter
 */
async function startTournament() {
  isLoading.value = true;

  // Öffnen eines Bestätigungsdialogs
  confirm.require({
    message: "Are you sure you want to start the tournament? You won't be able to manage the participants afterwards.",
    header: "START TOURNAMENT",
    rejectProps: {
      label: "Cancel",
      severity: "secondary"
    },
    acceptProps: {
      label: "Start Tournament"
    },
    // Bei Bestätigen wird das Turnier gestartet
    accept: async () => {
      try {
        await tournamentStore.startTournament(tournamentId);
        isLoading.value = false;
        await router.push({name: 'Tournament', params: {id: tournamentId}});
      } catch (error) {
        isLoading.value = false;
      }
    },
    reject: () => {
      isLoading.value = false;
    }
  })
}
</script>

<template>
  <ConfirmDialog></ConfirmDialog>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.push({name: 'My Tournaments'})"></span>
      <img src="./../../assets/images/logo.svg">
      <div>
        <h1 class="form-header m-0 text-center">{{ tournamentData.name }}</h1>
        <span class="sub-header text-center">{{
            new Date(tournamentData.date).toLocaleString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          }}
          <template v-if="tournamentData.endDate"> - {{
              new Date(tournamentData.endDate).toLocaleString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            }}
        </template>
        </span>
        <div class="sub-header text-center">
          <div class="d-inline-flex gap-1 text-center align-items-center ms-1">
            <span class="pi pi-user"></span>
            <span>{{tournamentData.players?.length}}/{{tournamentData.maxPlayers }}</span>
          </div>
        </div>
        <h1 class="form-header m-0 text-center">ADD PLAYERS</h1>
      </div>
      <form class="m-auto mb-2 w-75">
        <div class="form-field">
          <label for="pinOrMail" class="form-label">PBW Pin or Email address*</label>
          <input v-model.trim="pinOrMail" id="pinOrMail" type="text" class="form-control" @input="checkValidity">
        </div>
        <div class="form-field">
          <label for="faction" class="form-label">Faction*</label>
          <span class="select-icon pi pi-angle-down"></span>
          <select v-model.trim="faction" id="faction" name="faction" class="form-control"
                  @input="checkValidity">
            <option disabled value="">Please select one</option>
            <option value="100K">100K</option>
            <option value="spires">Spires</option>
            <option value="dweghom">Dweghom</option>
            <option value="nords">Nords</option>
            <option value="wadrhun">W’adrhŭn</option>
            <option value="old_dominion">Old Dominion</option>
            <option value="city_states">City States</option>
            <option value="sorcerer_kings">Sorcerer Kings</option>
            <option value="yoroni">Yoroni</option>
          </select>
        </div>
        <div class="form-field">
          <label for="team" class="form-label">Team</label>
          <input v-model.trim="team" id="team" type="text" class="form-control">
        </div>
      </form>
      <span class="sub-header">Added players</span>
      <ul class="card-list w-100">
        <li class="card-container" v-for="(player, index) of tournamentData.players">
          <div class="card">
            <div class="placement">{{ index + 1 }}</div>
            <div class="card-text-container text-truncate">
              <div class="text-truncate">
                <span class="card-title text-truncate">{{ player.username }} {{player.teamName ? `(${player.teamName})` : null}}</span>
              </div>
              <div class="d-flex">
                <span class="fs-6 text-truncate">{{ player.pbwPin ? player.pbwPin : player.email }}</span>
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
                :class="{ ['button-loading']: isLoading, ['disabled']: tournamentData?.players?.length < 2 }"
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