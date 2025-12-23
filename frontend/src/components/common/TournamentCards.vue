<script setup>
defineProps({
  tournaments: {},
})

</script>

<template>
  <ul class="tournament-cards card-list w-100 mt-3">
    <li class="card" v-for="tournament of tournaments" v-on:click="$emit('openTournament', tournament)">
      <div class="card-text-container">
        <span class="card-title">{{ tournament.name }}</span>
        <div class="d-flex">
                <span>{{
                    new Date(tournament.date).toLocaleString('en-US', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric'
                    })
                  }}, {{ tournament.city }} {{ tournament.country }}</span>
          <span class="ms-auto me-1">{{ tournament.state }}</span>
        </div>
      </div>
      <span class="pi pi-arrow-right dark card-icon"></span>
    </li>
  </ul>
</template>

<style scoped>

</style>