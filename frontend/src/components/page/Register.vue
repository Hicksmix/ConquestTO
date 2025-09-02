<script setup>

import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import router from "@/router";

const username = ref('');
const email = ref('');
const pbwPin = ref('');
const password = ref('');
const repeatPassword = ref('');
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false);

/**
 * Überprüft, ob der Benutzer bereits authentifiziert ist.
 * Falls ja, wird Nutzer zur Profilseite weitergeleitet.
 * Ruft Validierungsfunktionen für die initialen Formulareingaben auf.
 */
onMounted(() => {
  if (isAuthenticated.value) router.push({name: 'Profile'})
  checkEmailValidity({target: document.getElementById('email')});
  checkUsernameValidity({target: document.getElementById('username')});
  checkPasswordValidity({target: document.getElementById('password')});
})

/**
 * Führt den Registrierungsvorgang aus.
 * Ruft die register-Methode aus dem authStore auf, um die Benutzerdaten zu speichern.
 * Nach erfolgreicher Registrierung → Laden der Benutzerdaten und Weiterleitung zur Startseite
 */
async function handleRegister() {
  isLoading.value = true;
  try {
    await authStore.register(username.value, password.value, email.value, pbwPin.value);
    isLoading.value = false;
    await router.push({name: 'Landing Page'});
  } catch (error) {
    isLoading.value = false;
  }
}

/**
 * Kontrolliert Aktivierung des "Registrieren"-Buttons.
 */
function disableSubmit() {
  return !password.value || !repeatPassword.value || !username.value || !email.value || !password.value;
}

/**
 * Überprüft die Gültigkeit der E-Mail-Adresse.
 * Setzt Fehlermeldung auf das Eingabefeld, falls eine Bedingung nicht erfüllt ist.
 * @param e
 */
function checkEmailValidity(e) {
  if (email.value.length < 3 || email.value.length > 50) {
    e.target.setCustomValidity("The email must contain between 3 and 30 characters");
  } else if (email.value.indexOf("@") === -1 || email.value.indexOf(" ") !== -1) {
    e.target.setCustomValidity("Invalid email");
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
    e.target.setCustomValidity("The username must contain between 3 and 30 characters");
  } else {
    e.target.setCustomValidity("")
  }
}

/**
 * Überprüft die Gültigkeit der PBW Pin.
 * Setzt Fehlermeldung auf das Eingabefeld, falls eine Bedingung nicht erfüllt ist.
 * @param e
 */
function checkPBWPinValidity(e) {
  if (pbwPin.value && pbwPin.value.length !== 5) {
    e.target.setCustomValidity("The Pin must be exactly 5 characters long or empty");
  } else {
    e.target.setCustomValidity("")
  }
}

/**
 * Überprüft die Gültigkeit des Passworts.
 * Setzt Fehlermeldung auf das Eingabefeld, falls eine Bedingung nicht erfüllt ist.
 * Ruft checkRepeatPasswordValidity auf.
 * @param e
 */
function checkPasswordValidity(e) {
  let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?€§=&])[A-Za-z\d@.#$!€=§%*?&]{8,30}$/;
  if (password.value.length < 8 || password.value.length > 30) {
    e.target.setCustomValidity("The password must contain between 8 and 30 characters");
  } else if (!regex.test(password.value)) {
    e.target.setCustomValidity("The password must contain at least one lower case and one upper case letter, as well a a number and a special character");
  } else {
    e.target.setCustomValidity("")
  }

  checkRepeatPasswordValidity({target: document.getElementById('repeat-password')});
}

/**
 * Überprüft Übereinstimmung der Passwörter und setzt ggf. eine Fehlermeldung.
 * @param e
 */
function checkRepeatPasswordValidity(e) {
  if (repeatPassword.value !== password.value) {
    e.target.setCustomValidity("The passwords do not match");
  } else {
    e.target.setCustomValidity("")
  }
}

</script>

<template>
  <div class="container-with-background">
    <img src="./../../assets/images/logo.svg">
    <form class="register-form" @submit.prevent="handleRegister" id="register-form">
      <h1 class="form-header text-center">REGISTER</h1>
      <div class="form-field">
        <label for="email" class="form-label">Email address*</label>
        <input v-model.trim="email" id="email" type="email" class="form-control" @input="checkEmailValidity">
      </div>
      <div class="form-field">
        <label for="username" class="form-label">Username*</label>
        <input v-model.trim="username" id="username" type="text" class="form-control" @input="checkUsernameValidity">
      </div>
      <div class="form-field">
        <label for="pbwPin" class="form-label">PBW Pin</label>
        <input v-model.trim="pbwPin" id="pbwPin" type="text" class="form-control" @input="checkPBWPinValidity">
      </div>
      <div class="form-field">
        <label for="password" class="form-label">Password*</label>
        <input v-model.trim="password" id="password" type="password" class="form-control"
               @input="checkPasswordValidity">
      </div>
      <div class="form-field">
        <label for="repeat-password" class="form-label">Repeat password*</label>
        <input v-model.trim="repeatPassword" id="repeat-password" type="password" class="form-control"
               @input="checkRepeatPasswordValidity">
      </div>
      <div class="button-container mt-4">
        <button type="submit" :disabled="disableSubmit()"
                :class="{ ['button-loading']: isLoading, ['disabled']: disableSubmit() }">Register
        </button>
        <button type="button" class="secondary"
                v-on:click="router.go(-1)">Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>