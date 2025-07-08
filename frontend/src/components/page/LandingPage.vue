<script setup>
import router from './../../router';
</script>

<template>
  <div class="content container-with-background">
    <img src="./../../assets/images/logo.svg">
    <div class="button-container mt-4 mx-auto">
      <button v-on:click="router.push({ name: 'My Tournaments' })">My Tournaments</button>
      <button>Joined Tournaments</button>
      <button v-on:click="router.push({ name: 'Create Tournament' })">Create Tournament</button>
      <button>Enter Tournaments</button>
    </div>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 205px;
}
</style>