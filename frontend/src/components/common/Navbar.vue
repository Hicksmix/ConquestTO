<script setup>
import {computed, onMounted} from 'vue';
import {useAuthStore} from '@/store/auth';
import router from './../../router';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.currentUser.username)

onMounted(() => {
  // Laden der aktuellen User Daten, damit das Initial des Users statt dem Account Icon angezeigt werden kann
  authStore.loadUser();
})
</script>

<template>
  <div class="content">
    <div style="width: 24px">
    </div>
    <div>
      <span class="pi pi-home icon-button" style="font-size: 1.5rem" v-on:click="router.push({ name: 'Landing Page'})"></span>
    </div>
    <div>
      <div class="rounded-circle profile-circle icon-button">
        <span v-if="!isAuthenticated" class="pi pi-user dark" v-on:click="router.push({ name: 'Login' })"></span>
        <span class="dark fs-6 fw-bold im-fell-english-regular profile-initial" v-on:click="router.push({ name: 'Profile' })">{{username?.charAt(0)}}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  background: var(--color-background-dark);
  width: 100%;
  height: 3rem;
  display: flex;
  padding: 0.75rem;
  flex-direction: row;
  justify-content: space-between;

  .profile-circle {
    width: 24px;
    height: 24px;
    display: flex;
    background: var(--color-background-soft);
    align-items: center;
    justify-content: center;

    .profile-initial {
      align-self: baseline;
    }
  }
}
</style>