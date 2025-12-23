<script setup>
import router from './../../router';
import {useAuthStore} from "@/store/auth";
import {computed} from "vue";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <div class="content container-with-background">
    <img src="./../../assets/images/logo.svg">
    <div class="button-container mt-4 mx-auto">
      <button v-on:click="router.push({ name: 'Tournaments' })">All Tournaments</button>
      <button :disabled="!isAuthenticated" :class="{disabled: !isAuthenticated}" v-on:click="router.push({ name: 'My Tournaments' })">My Tournaments</button>
      <button :disabled="!isAuthenticated" :class="{disabled: !isAuthenticated}" v-on:click="router.push({ name: 'Joined Tournaments' })">Joined Tournaments</button>
      <button :disabled="!isAuthenticated" :class="{disabled: !isAuthenticated}" v-on:click="router.push({ name: 'Create Tournament' })">Create Tournament</button>
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