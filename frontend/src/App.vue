<script setup>
import Navbar from "@/components/common/Navbar.vue";
import Toast from 'primevue/toast';
import { useToastStore } from '@/store/toast';

useToastStore();
</script>

<template>
  <Navbar></Navbar>
  <Toast></Toast>
  <main>
    <router-view></router-view>
  </main>
</template>

<style>
</style>
