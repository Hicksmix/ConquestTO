<script setup>
import router from "@/router";

import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/auth';
import Dialog from "primevue/dialog";
import ConfirmDialog from 'primevue/confirmdialog';
import {useConfirm} from "primevue/useconfirm";

const confirm = useConfirm();
const authStore = useAuthStore();
const email = ref('');
const username = ref('');
const pbwPin = ref('');
const password = ref('');
const editModeOn = ref(false)
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoading = ref(false);
const dialogVisible = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const repeatNewPassword = ref('');

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
    e.target.setCustomValidity("The username must contain between 3 and 30 characters");
  } else {
    e.target.setCustomValidity("")
  }
}

function logout() {
  confirm.require({
    message: "Are you sure you want to log out?",
    header: "LOGOUT",
    rejectProps: {
      label: "Cancel",
      severity: "secondary"
    },
    acceptProps: {
      label: "Logout"
    },
    accept: () => {
      authStore.logout();
      router.push({name: 'Login'});
    }
  })
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

function openChangePasswordDialog() {
  oldPassword.value = "";
  newPassword.value = "";
  repeatNewPassword.value = "";
  dialogVisible.value = true;
}

async function changePassword() {
  console.log('test')
  try {
    await authStore.editUserPassword(oldPassword.value, newPassword.value);
    oldPassword.value = "";
    newPassword.value = "";
    repeatNewPassword.value = "";
    dialogVisible.value = false;
  } catch (e) {}
}

/**
 * Überprüft die Gültigkeit des Passworts.
 * Setzt Fehlermeldung auf das Eingabefeld, falls eine Bedingung nicht erfüllt ist.
 * Ruft checkRepeatPasswordValidity auf.
 * @param e
 */
function checkPasswordValidity(e) {
  let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?€§=&])[A-Za-z\d@.#$!€=§%*?&]{8,30}$/;
  if (newPassword.value.length < 8 || newPassword.value.length > 30) {
    e.target.setCustomValidity("The password must contain between 8 and 30 characters");
  } else if (!regex.test(newPassword.value)) {
    e.target.setCustomValidity("The password must contain at least one lower case and one upper case letter, as well a a number and a special character");
  } else {
    e.target.setCustomValidity("")
  }

  checkRepeatPasswordValidity({target: document.getElementById('repeat-new-password')});
}

/**
 * Überprüft Übereinstimmung der Passwörter und setzt ggf. eine Fehlermeldung.
 * @param e
 */
function checkRepeatPasswordValidity(e) {
  if (repeatNewPassword.value !== newPassword.value) {
    e.target.setCustomValidity("The passwords do not match");
  } else {
    e.target.setCustomValidity("")
  }
}

function checkPasswordFormValid() {
  return (oldPassword.value.length > 0 && repeatNewPassword.value);
}
</script>

<template>
  <div class="content m-auto">
    <div class="container-with-background">
    <span class="pi pi-chevron-left icon-button back-button" v-on:click="router.back()"></span>
      <img src="./../../assets/images/logo.svg">
      <form class="my-3">
        <h1 class="form-header text-center">Profile</h1>
        <div class="form-field">
          <label for="email" class="form-label">Email address*</label>
          <input v-model.trim="email" id="email" type="email" class="form-control disabled" :disabled="true">
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
          <button type="button" class="secondary" v-if="!editModeOn"
                  v-on:click="openChangePasswordDialog()">Change Password
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


  <Dialog v-model:visible="dialogVisible" modal header="CHANGE PASSWORD" :style="{ width: '15rem' }" :closable="false">

    <form class="my-3" @submit.prevent="changePassword()" id="password-form">
      <div class="form-field">
        <label for="old-password" class="form-label">Old Password*</label>
        <input v-model.trim="oldPassword" id="old-password" type="password" class="form-control">
      </div>
      <div class="form-field">
        <label for="new-password" class="form-label">New Password*</label>
        <input v-model.trim="newPassword" id="new-password" type="password" class="form-control"
               @input="checkPasswordValidity">
      </div>
      <div class="form-field">
        <label for="repeat-new-password" class="form-label">Old Password*</label>
        <input v-model.trim="repeatNewPassword" id="repeat-new-password" type="password" class="form-control"
               @input="checkRepeatPasswordValidity">
      </div>
    </form>

    <template #footer>
      <div class="button-container">
        <button form="password-form" type="submit" :disabled="!checkPasswordFormValid()"
                :class="{ 'button-loading': isLoading, 'disabled': !checkPasswordFormValid() }">Save</button>
        <button type="button" v-on:click="dialogVisible=false" class="secondary">Close</button>
      </div>
    </template>
  </Dialog>

  <ConfirmDialog></ConfirmDialog>
</template>

<style scoped>
</style>