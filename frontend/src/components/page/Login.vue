<script setup>
import router from "@/router";

import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false);

/**
 * Überprüft, ob Nutzer authentifiziert ist.
 * Wenn der Nutzer bereits eingeloggt ist -> Weiterleitung Profilseite.
 * Ruft checkValidity auf -> Überprüfung der Gültigkeit der Eingaben
 */
onMounted(() => {
  if (isAuthenticated.value) router.push({ name: 'Profile' });
  checkValidity({target: document.getElementById('email')});
  checkValidity({target: document.getElementById('password')});
})

/**
 * Versucht Nutzer mit den eingegebenen Werten einzuloggen.
 * Bei Erfolg -> Weiterleitung zur Startseite
 * Fängt Fehler beim Login ab und gibt diese in der Konsole aus.
 */
async function handleLogin() {
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    isLoading.value = false;
    router.push({name: 'Landing Page'})
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Kontrolliert, ob der "einloggen"-Button aktiviert oder deaktiviert ist.
 */
function disableSubmit() {
  return !email.value || !password.value;
}

/**
 * Überprüft, ob das übergebene Eingabefeld (email, password) einen gültigen Wert enthält.
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
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <img src="./../../assets/images/logo.svg">
      <form class="login-form my-3" @submit.prevent="handleLogin">
        <h1 class="form-header text-center">LOGIN</h1>
        <div class="form-field">
          <label for="email" class="form-label">Email address</label>
          <input v-model.trim="email" id="email" type="text" class="form-control" @input="checkValidity">
        </div>
        <div class="form-field">
          <label for="password" class="form-label">Password</label>
          <input v-model.trim="password" id="password" type="password" class="form-control" @input="checkValidity">
        </div>

        <div class="button-container mt-4">
          <button type="submit" :disabled="disableSubmit()"
                  :class="{ ['button-loading']: isLoading }">Log in
          </button>
          <button type="button" class="secondary"
                  v-on:click="router.push({ name: 'Register' })">Sign up
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>