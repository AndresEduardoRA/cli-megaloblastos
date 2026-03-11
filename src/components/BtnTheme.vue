<script setup lang="ts">
import { ref, onMounted } from "vue";

// Reactive variable to track dark mode state
const isDark = ref(false);

// Function to toggle the theme
const toggleTheme = () => {
  const html = document.documentElement;
  html.classList.toggle("dark");
  isDark.value = !isDark.value;

  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

// Sync the state with the current theme on mount
onMounted(() => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    isDark.value = true;
  } else {
    document.documentElement.classList.remove("dark");
    isDark.value = false;
  }
});
</script>

<template>
  <button @click="toggleTheme">
    <i
      v-if="!isDark"
      class="ri-sun-line text-2xl text-primary dark:text-neutral-50"
    ></i>
    <i
      v-if="isDark"
      class="ri-moon-line text-2xl text-primary dark:text-neutral-50"
    ></i>
  </button>
</template>

<style scoped></style>
