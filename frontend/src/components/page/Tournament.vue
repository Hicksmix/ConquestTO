<script setup>
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import {filename} from 'pathe/utils'
import router from './../../router';
import {useRoute} from "vue-router";
import Dialog from "primevue/dialog";

const route = useRoute();
const authStore = useAuthStore();
const tournamentStore = useTournamentStore()
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isOrga = computed(() => authStore.currentUser.id === tournamentData.value.orgaId);
const alreadyJoined = computed(() => tournamentData.value?.players?.filter((player) => player.id === authStore.currentUser.id)?.length === 1);
const tournamentData = computed(() => tournamentStore.currentTournament);
const glob = import.meta.glob('@/assets/images/faction-icons/*.png', {eager: true});
const factionIcons = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value.default])
);
const tournamentId = route.params.id
const dialogVisible = ref(false);
const faction = ref('');
const team = ref('');
const isLoading = ref(false);

onMounted(async () => {
  await tournamentStore.getTournament(tournamentId);
})

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
async function joinTournament() {
  isLoading.value = true;

  // Versucht den Spieler hinzuzufügen. Je nach Erfolg werden die Daten des Formulars zurück gesetzt
  try {
    await tournamentStore.joinTournament(tournamentId, faction.value, team.value);
    isLoading.value = false;
    faction.value = '';
    team.value = '';
    dialogVisible.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.push({name: 'Landing Page'})"></span>
      <img src="./../../assets/images/logo.svg">
      <div class="mb-3">
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
        <span class="sub-header text-center">{{
            `${tournamentData.address}, ${tournamentData.zip} ${tournamentData.city}, ${tournamentData.country}`
          }}</span>
        <div class="sub-header text-center">
          <div v-if="tournamentData.externalLink" class="d-inline-flex gap-1 text-center align-items-center">
            <a href="{{tournamentData.externalLink}}" class="pi pi-external-link"></a>
            <a href="{{tournamentData.externalLink}}">{{ tournamentData.externalLink }}</a>
          </div>
          <div class="d-inline-flex gap-1 text-center align-items-center ms-1">
            <span class="pi pi-user"></span>
            <span>{{tournamentData.players?.length}}/{{tournamentData.maxPlayers }}</span>
          </div>
        </div>
        <span class="sub-header text-center">
          {{ tournamentData.state }}
        </span>
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
                {{ `${player.winCount}/${player.lossCount}/${player.drawCount}` }}</span>
            </div>
          </div>
          <div class="faction-icon-container">
            <img class="faction-icon" :src="factionIcons[player.faction]">
          </div>
        </li>
      </ul>
      <div class="button-container">
        <button v-if="isOrga" :class="[{disabled: tournamentData.state !== 'created'}]"
                :disabled="tournamentData.state !== 'created'"
                v-on:click="router.push({name: 'Add Players', params: {id: tournamentId}})">Add Players
        </button>
        <button v-else
                :class="[{disabled: tournamentData.state !== 'created' || tournamentData.maxPlayers <= tournamentData.players.length || alreadyJoined || !isAuthenticated}]"
                :disabled="tournamentData.state !== 'created' || tournamentData.maxPlayers <= tournamentData.players.length || alreadyJoined || !isAuthenticated"
                v-on:click="dialogVisible = true">Join
        </button>
        <button :class="[{disabled: tournamentData.state === 'created'}]" :disabled="tournamentData.state === 'created'"
                v-on:click="router.push({name: 'Tournament Round', params: {id: tournamentId, round: tournamentData.currentRound}})">Rounds
        </button>
      </div>
    </div>
  </div>


  <Dialog v-model:visible="dialogVisible" modal header="JOIN TOURNAMENT" :style="{ width: '15rem' }" :closable="false">
    <form v-if="tournamentData.players">
      <form class="m-auto mb-3 w-75">
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
    </form>
    <template #footer>
      <div class="button-container">
        <button v-on:click="joinTournament()" :disabled="!faction"
                :class="{ ['disabled']: !faction }">Join
        </button>
        <button class="secondary" v-on:click="dialogVisible=false">Close</button>
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