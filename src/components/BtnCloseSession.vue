<script setup lang="ts">
import Cookie from "js-cookie";

const closeSession = () => {
  Cookie.remove("user");
  window.location.reload();
};
</script>

<template>
  <button
    @click="closeSession"
    class="hover:underline text-red-500 leading-none hover:text-red-600"
  >
    Cerrar sesión
  </button>
</template>

<style scoped></style>
