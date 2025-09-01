<script setup>

import router from "@/router";
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import {useTournamentStore} from '@/store/tournament';
import {useRoute} from "vue-router";
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import {useConfirm} from "primevue/useconfirm";

const confirm = useConfirm();
const route = useRoute();
const authStore = useAuthStore();
const tournamentStore = useTournamentStore()
const isAuthenticated = computed(() => authStore.isAuthenticated);
const tournamentData = computed(() => tournamentStore.currentTournament);
const tournamentId = route.params.id;
const roundNr = ref(1);
const dialogVisible = ref(false);
const player1 = ref();
const player2 = ref();
const gameForSwap = ref();

onMounted(async () => {
  // Authentifizierung überprüfen
  if (!isAuthenticated.value) await router.push({name: 'Login'});

  await tournamentStore.getTournament(tournamentId);
  await tournamentStore.loadTournamentRound(roundNr.value);
})

/**
 * Beendet ein Spiel und trägt automatisch den Sieger ein
 */
async function endGame(game) {
  if (game.score1 > game.score2 || !game.player2Id) game.winnerId = game.player1Id;
  else if (game.score2 > game.score1) game.winnerId = game.player2Id;
  else game.winnerId = null;
  await tournamentStore.updateGame(game);
  await tournamentStore.endGame(game.id)
}

/**
 * Eröffnet ein Spiel. Nur möglich, wenn die aktuell angezeigte Runde am laufen ist
 */
function reopenGame(gameId) {
  tournamentStore.reopenGame(gameId)
}

/**
 * Spichert die aktualisierten Daten eines Spiels und trägt automatisch den Sieger ein
 */
function saveGame(game) {
  if(game.score2.length < 1) game.score2 = 0;
  if(game.score1.length < 1) game.score1 = 0;
  if (game.score1 > game.score2 || !game.player2Id) game.winnerId = game.player1Id;
  else if (game.score2 > game.score1) game.winnerId = game.player2Id;
  else game.winnerId = null;
  tournamentStore.updateGame(game);
}

/**
 * Beendet, wenn möglich, die aktuelle Runde, nach Bestätigen eines Dialogs
 */
function endRound() {
  if (tournamentData.value.canEndRound) {
    confirm.require({
      message: "Are you sure you want to end the tournament round? You won't be able to manage the current round afterwards.",
      header: "END ROUND",
      rejectProps: {
        label: "Cancel",
        severity: "secondary"
      },
      acceptProps: {
        label: "End"
      },
      accept: () => {
        tournamentStore.endTournamentRound();
      }
    })
  }
}

/**
 * Erstellt, wenn möglich, eine neue Runde, nach Bestätigen eines Dialogs und wählt die neue Runde direkt aus
 */
async function createNewRound() {
  if (tournamentData.value.currentRoundState === "ended") {
    confirm.require({
      message: "Are you sure you want to create a new tournament round? You won't be able to undo this.",
      header: "CREATE NEW ROUND",
      rejectProps: {
        label: "Cancel",
        severity: "secondary"
      },
      acceptProps: {
        label: "Create"
      },
      accept: async () => {
        await tournamentStore.createTournamentRound();
        roundNr.value = tournamentData.value.currentRound;
      }
    })
  }
}

/**
 * Beginnt, wenn möglich, eine neue Runde, nach Bestätigen eines Dialogs und wählt die neue Runde direkt aus
 */
async function startRound() {
  if (tournamentData.value.currentRoundState === "created") {
    confirm.require({
      message: "Are you sure you want to start the tournament round? You won't be able to change matchups afterwards.",
      header: "START ROUND",
      rejectProps: {
        label: "Cancel",
        severity: "secondary"
      },
      acceptProps: {
        label: "Start"
      },
      accept: async () => {
        await tournamentStore.startTournamentRound();
        roundNr.value = tournamentData.value.currentRound;
      }
    })
  }
}

/**
 * Öffnet den Dialog zum Wechseln eines Spielers mit einem anderen
 */
function openSwapDialog(player, game) {
  player1.value = player;
  gameForSwap.value = game;
  dialogVisible.value = true;
}

/**
 * Speichert die ausgetauschten Spieler
 */
async function swapPlayers() {
  const games = tournamentData.value.games;
  const game2Id = games.find((game) => game.player1Id === player2.value || game.player2Id === player2.value).id;

  if (game2Id !== gameForSwap.value.id) {
    await tournamentStore.swapPlayers(gameForSwap.value.id, game2Id, player1.value, player2.value);
  }
  dialogVisible.value = false;
}

/**
 * Wählt eine Turnierrunde aus, die angezeigt werden soll
 */
async function selectRound(round) {
  roundNr.value = round;
  await tournamentStore.loadTournamentRound(roundNr.value);
}

/**
 * Beendet ein Turnier nach Bestätigen eines Dialogs und kehrt direkt zur Turnierübersicht zurück
 */
async function endTournament() {
  confirm.require({
    message: "Are you sure you want to end the tournament and generate rankings? You won't be able to undo this.",
    header: "END TOURNEY",
    rejectProps: {
      label: "Cancel",
      severity: "secondary"
    },
    acceptProps: {
      label: "END"
    },
    accept: async () => {
      await tournamentStore.endTournament(tournamentId);
      await router.push({name: 'Tournament', params: {id: tournamentId}});
    }
  })
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <span class="pi pi-chevron-left icon-button back-button"
            v-on:click="router.push({name: 'Tournament', params: {id: tournamentId}})"></span>
      <img src="./../../assets/images/logo.svg">
      <div class="mb-3">
        <h1 class="form-header m-0 text-center">{{ tournamentData.name }}</h1>
        <span class="sub-header text-center">{{
            new Date(tournamentData.date).toLocaleString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          }} | {{ tournamentData.state }}</span>
      </div>
      <span class="sub-header">Matches</span>
      <ul class="card-list w-100">
        <li class="card-container" v-for="game of tournamentData.games ? tournamentData.games : []">
          <div class="card">
            <div class="table-number">{{ game.tableNr }}</div>
            <div class="card-text-container text-truncate">
              <div class="text-truncate w-100 d-flex p-1"
                   :class="[{'winner': game.winnerId === game.player1Id && game.ended}, {'draw': game.winnerId === null && game.ended}, {'loser': game.winnerId === game.player2Id && game.ended}]">
                <span class="card-title">{{ game.player1Name }}</span>
                <span class="pi pi-crown winner-crown dark ms-1"
                      v-if="game.winnerId === game.player1Id && game.ended"></span>
                <span class="ms-auto card-title"
                      v-if="game.ended || tournamentData.currentRoundState !== 'ongoing'">{{ game.score1 }}</span>
                <input class="ms-auto minimal-input" type="number" v-else v-model="game.score1"
                       v-on:blur="saveGame(game)">
              </div>
              <hr class="m-0">
              <div class="text-truncate w-100 d-flex p-1"
                   :class="[{'winner': game.winnerId === game.player2Id && game.ended}, {'draw': game.winnerId === null && game.ended}, {'loser': game.winnerId === game.player1Id && game.ended}, ]">
                <span class="card-title">{{ game.player2Name }}</span>
                <span class="pi pi-crown winner-crown dark ms-1"
                      v-if="game.winnerId === game.player2Id && game.ended"></span>
                <span class="ms-auto card-title"
                      v-if="game.ended || tournamentData.currentRoundState !== 'ongoing' || !game.player2Id">{{ game.score2 }}</span>
                <input class="ms-auto minimal-input" type="number" v-else v-model="game.score2"
                       v-on:blur="saveGame(game)">
              </div>
            </div>
          </div>
          <div
              v-if="!tournamentData.ended && tournamentData.currentRound === roundNr && tournamentData.currentRoundState !== 'ended'">
            <div v-if="tournamentData.currentRoundState === 'ongoing'">
              <button class="icon-button" v-if="!game.ended" v-on:click="endGame(game)">
                <span class="pi pi-check-circle fs-4"></span>
              </button>
              <button class="icon-button" v-else v-on:click="reopenGame(game.id)">
                <span class="pi pi-pen-to-square fs-4"></span>
              </button>
            </div>
            <div v-else>
              <button v-on:click="openSwapDialog(game.player1Id, game)" class="icon-button">
                <span class="pi pi-arrow-right-arrow-left fs-4"></span>
              </button>
              <button v-on:click="openSwapDialog(game.player2Id, game)" class="icon-button mt-3">
                <span class="pi pi-arrow-right-arrow-left fs-4"></span>
              </button>
            </div>
          </div>
        </li>
      </ul>
      <div class="round-select">
        <span class="pi pi-angle-left" v-on:click="selectRound(roundNr - 1)" :class="[{'disabled': roundNr <= 1}]"
              :disabled="roundNr <= 1"></span>
        <span v-for="index in tournamentData.currentRound" :class="[{'active': index === roundNr}]"
              v-on:click="selectRound(index)">{{ index }}</span>
        <span v-if="tournamentData.currentRoundState === 'ended' && tournamentData.state === 'ongoing'"
              class="new-round"
              v-on:click="createNewRound()">{{
            tournamentData.currentRound + 1
          }}</span>
        <span class="pi pi-angle-right" v-on:click="selectRound(roundNr + 1)"
              :class="[{'disabled': roundNr >= tournamentData.currentRound}]"
              :disabled="roundNr >= tournamentData.currentRound"></span>
      </div>
      <div class="button-container">
        <button v-on:click="router.push({name: 'Tournament', params: {id: tournamentId}})">Overview
        </button>
        <button v-if="tournamentData.currentRoundState === 'ongoing'"
                :class="[{'disabled': !tournamentData.canEndRound}]"
                :disabled="!tournamentData.canEndRound" v-on:click="endRound()">End Round
        </button>
        <button v-else-if="tournamentData.currentRoundState === 'created'" v-on:click="startRound()">Start Round
        </button>
        <button v-else-if="tournamentData.state === 'ongoing' && tournamentData.currentRoundState === 'ended'"
                v-on:click="endTournament()">End Tourney
        </button>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="dialogVisible" modal header="SWAP PLAYERS" :style="{ width: '15rem' }" :closable="false">
    <form v-if="tournamentData.players">
      <div class="form-field">
        <label for="player1" class="form-label">Player 1</label>
        <span class="select-icon pi pi-angle-down"></span>
        <select v-model="player1" id="faction" name="player1" class="form-control disabled">
          <option v-for="player of tournamentData.players.filter((p) => p.id === player1)" :value="player.id">
            {{ player.username }}
          </option>
        </select>
      </div>
      <div class="form-field">
        <label for="player2" class="form-label">Player 2</label>
        <span class="select-icon pi pi-angle-down"></span>
        <select v-model="player2" id="faction" name="player2" class="form-control">
          <option
              v-for="player of tournamentData.players.filter((p) => p.id !== gameForSwap.player1Id && p.id !== gameForSwap.player2Id)"
              :value="player.id">
            {{ player.username }}
          </option>
        </select>
      </div>
    </form>
    <template #footer>
      <div class="button-container">
        <button v-on:click="swapPlayers()">Save</button>
        <button v-on:click="dialogVisible=false">Close</button>
      </div>
    </template>
  </Dialog>
  <ConfirmDialog></ConfirmDialog>
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

        .card {
          padding: 0;

          .table-number {
            font-size: 1.5rem;
            font-weight: 800;
            margin: auto 1rem auto 0.5rem;
          }

          .draw {
            background-color: var(--color-warning-15);
          }

          .winner {
            background-color: var(--color-success-20);
          }

          .loser {
            background-color: var(--color-error-15);
          }

          .winner-crown {
            font-size: 0.75rem;
            display: flex;
            align-items: center;
          }
        }
      }
    }

    .round-select {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > span {
        font-size: 1.25rem;
        font-weight: 600;

        &.active {
          color: var(--color-active);
        }

        &.new-round {
          color: var(--color-text-disabled)
        }
      }
    }

    .button-container {
      margin: 0.5rem 1.5rem 0 1.5rem;
    }
  }
}
</style>