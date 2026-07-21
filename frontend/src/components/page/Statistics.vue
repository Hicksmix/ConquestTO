<script setup>
import {computed, onMounted, ref} from 'vue';
import {useStatisticsStore} from '@/store/statistics';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {filename} from "pathe/utils";
import Dialog from "primevue/dialog";

const statisticsStore = useStatisticsStore();
const statistics = computed(() => statisticsStore.statistics);
const dialogVisible = ref(false);
const glob = import.meta.glob('@/assets/images/faction-icons/*.png', {eager: true});
const factionIcons = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value.default])
);
const fromDate = ref();
const toDate = ref();
const isLoading = ref(false);

onMounted(async () => {
  await loadFilters();
});

function getLossCount(faction) {
  return faction.gameCount -
      faction.gameWinCount -
      faction.gameDrawCount;
}

function getGameWinPercentage(faction) {
  if (!faction.gameCount) {
    return 0;
  }

  return Math.round(
      (faction.gameWinCount / faction.gameCount) * 100
  );
}

function getTournamentWinPercentage(faction) {
  if (!faction.tournamentEntries) {
    return 0;
  }

  return Math.round(
      (faction.tournamentWins / faction.tournamentEntries) * 100
  );
}

/**
 * Speichert die gesetzten Filter
 * @returns {Promise<void>}
 */
async function saveFilters() {
  try {
    isLoading.value = true;
    let filters = JSON.parse(localStorage.getItem('cto_filters'));
    if (!filters) filters = {statistics: {}, tournaments: {}};

    await statisticsStore.loadAllStatisticsForTimeframe(fromDate.value, toDate.value);

    filters.statistics.fromDate = fromDate.value;
    filters.statistics.toDate = toDate.value;
    localStorage.setItem('cto_filters', JSON.stringify(filters));

    dialogVisible.value = false;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Setzt die Filter zurück
 * @returns {Promise<void>}
 */
async function resetFilters() {
  fromDate.value = null;
  toDate.value = null;

  try {
    isLoading.value = true;
    let filters = JSON.parse(localStorage.getItem('cto_filters'));
    if (!filters) filters = {statistics: {}, tournaments: {}};

    await statisticsStore.loadAllStatisticsForTimeframe();

    filters.statistics = {};
    localStorage.setItem('cto_filters', JSON.stringify(filters));
    dialogVisible.value = false;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Lädt die zuvor gesetzten Filter
 * @returns {Promise<void>}
 */
async function loadFilters() {
  try {
    isLoading.value = true;
    let filters = JSON.parse(localStorage.getItem('cto_filters'));
    if (!filters?.statistics) filters = {statistics: {}};
    else {
      fromDate.value = filters.statistics.fromDate;
      toDate.value = filters.statistics.toDate;
    }

    await statisticsStore.loadAllStatisticsForTimeframe(fromDate.value, toDate.value);

    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <img src="./../../assets/images/logo.svg">
      <h1 class="form-header text-center mb-0">STATISTICS</h1>
      <div class="sub-header text-center ms-1 mb-3">
        <div class="d-inline-flex gap-1 text-center align-items-center" v-on:click="dialogVisible = true">
          <span class="pi pi-sliders-h"></span>
          <span>Filters</span>
        </div>
      </div>

      <DataTable
          :value="statistics"
          data-key="faction"
          class="statistics-table"
          table-class="statistics-table-element"
          :pt="{
            root: {
                style: {
                    border: '1px solid var(--color-text)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }
            },
            tableContainer: {
                style: {
                    borderRadius: '4px',
                    overflow: 'hidden'
                }
            },
            table: {
                style: {
                    width: '100%',
                    borderSpacing: '0',
                    borderCollapse: 'separate'
                }
            }
          }"
      >
        <!-- Faction icon -->
        <Column class="faction-column">
          <template #body="{ data }">
            <div class="faction-icon-container">
              <img
                  class="faction-icon"
                  :src="factionIcons[data.faction]"
              >
            </div>
          </template>
        </Column>

        <!-- Games / tournaments -->
        <Column>
          <template #header>
            <div class="two-line-cell header-cell">
              <span>Games</span>
              <span>TEs</span>
            </div>
          </template>

          <template #body="{ data }">
            <div class="two-line-cell">
              <span>{{ data.gameCount }}</span>
              <span>{{ data.tournamentEntries }}</span>
            </div>
          </template>
        </Column>

        <!-- W/L/D / tournament wins and podiums -->
        <Column>
          <template #header>
            <div class="two-line-cell header-cell">
              <span>W/L/D</span>
              <span>Wins/Podium</span>
            </div>
          </template>

          <template #body="{ data }">
            <div class="two-line-cell">
              <span>
                {{ data.gameWinCount }}/{{ getLossCount(data) }}/{{ data.gameDrawCount }}
              </span>

              <span>
                {{ data.tournamentWins }}/{{ data.tournamentPodiums }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Win percentage -->
        <Column>
          <template #header>
            <div class="header-cell">
              <span>Win %</span>
            </div>
          </template>

          <template #body="{ data }">
            <div class="two-line-cell">
              <span>{{ getGameWinPercentage(data) }}%</span>
              <span>{{ getTournamentWinPercentage(data) }}%</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="dialogVisible" modal header="FILTERS" :style="{ width: '15rem' }" :closable="false"
          :pt="{
            footer: {
              style: {
                justifyContent: 'center'
              }
            }
          }
  ">
    <form class="m-auto mb-3 w-75">
      <div class="form-field">
        <label for="from-date" class="form-label">From</label>
        <input v-model.trim="fromDate" id="from-date" type="date" class="form-control">
      </div>
      <div class="form-field">
        <label for="to-date" class="form-label">To</label>
        <input v-model.trim="toDate" id="to-date" type="date" class="form-control">
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
  overflow: hidden;
  display: block;

  .container-with-background {
    height: 100%;

    .statistics-table {
      width: 100%;

      .two-line-cell {
        display: grid;
        grid-template-rows: repeat(2, 1.25rem);
        align-items: center;
        white-space: nowrap;
        justify-items: center;
      }

      .header-cell {
        > * {
          font-weight: 600;
        }
      }

      .faction-icon-container {
        width: 2rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;

        .faction-icon {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }
      }
    }
  }
}
</style>