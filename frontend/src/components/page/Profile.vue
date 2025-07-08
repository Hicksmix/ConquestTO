<script setup>
import router from "@/router";

import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';

const authStore = useAuthStore();
const email = ref('');
const username = ref('');
const pbwPin = ref('');
const password = ref('');
const editModeOn = ref(false)
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false);

onMounted(() => {
  if (!isAuthenticated.value) router.push({name: 'Login'});
  loadData();
})

async function loadData() {
  await authStore.loadUser();
  email.value = authStore.currentUser.email;
  username.value = authStore.currentUser.username;
  pbwPin.value = authStore.currentUser.pbwPin;
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

/**
 * Überprüft die Gültigkeit des Benutzernamens.
 * Setzt Fehlermeldung auf das Eingabefeld, falls eine Bedingung nicht erfüllt ist.
 * @param e
 */
function checkUsernameValidity(e) {
  if (username.value.length < 3 || username.value.length > 30) {
    e.target.setCustomValidity("Der Username muss zwischen 3 und 30 Zeichen lang sein");
  } else {
    e.target.setCustomValidity("")
  }
}

function logout() {
  authStore.logout();
  router.push({name: 'Login'});
}

async function editProfile() {
  await authStore.editUser(username.value, password.value, pbwPin.value);
  password.value = '';
  editModeOn.value = false;
}

async function cancelEditProfile() {
  await loadData();
  password.value = '';
  editModeOn.value = false;
}

function checkFormValid() {
  return (username.value.length >= 3 && username.value.length <= 30 && password.value.length > 0);
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
      <img src="./../../assets/images/logo.svg">
      <form class="my-3">
        <h1 class="form-header text-center">Profile</h1>
        <div class="form-field">
          <label for="email" class="form-label">Email address*</label>
          <input v-model.trim="email" id="email" type="email" class="form-control disabled" :disabled>
        </div>
        <div class="form-field">
          <label for="username" class="form-label">Username*</label>
          <input v-model.trim="username" id="username" type="text" class="form-control" @input="checkUsernameValidity"
                 :class="{ ['disabled']: !editModeOn }" :disabled="!editModeOn">
        </div>
        <div class="form-field">
          <label for="pbwPin" class="form-label">PBW Pin</label>
          <input v-model.trim="pbwPin" id="pbwPin" type="text" class="form-control"
                 :class="{ ['disabled']: !editModeOn }" :disabled="!editModeOn">
        </div>
        <div class="form-field">
          <label for="password" class="form-label">Password*</label>
          <input v-model.trim="password" id="password" type="password" class="form-control"
                 @input="checkValidity" :class="{ ['disabled']: !editModeOn }" :disabled="!editModeOn">
        </div>

        <div class="button-container mt-4">
          <button type="submit" v-if="!editModeOn" v-on:click="editModeOn = true"
                  :class="{ ['button-loading']: isLoading }">Edit Profile
          </button>
          <button type="button" v-else
                  v-on:click="editProfile()"
                  :class="{ 'button-loading': isLoading, 'disabled': !checkFormValid() }">Save
          </button>
          <button type="button" v-if="editModeOn" class="secondary"
                  v-on:click="cancelEditProfile()">Cancel
          </button>
          <button type="button" class="secondary disabled" v-if="!editModeOn"
                  v-on:click="">Change Password
          </button>
        </div>
        <div class="button-container mt-2">
          <button type="button" class="secondary"
                  v-on:click="logout">Logout
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>