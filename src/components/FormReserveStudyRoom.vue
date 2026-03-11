<script setup>
import Cookie from "js-cookie";

const submitHandlerLogin = async ({ email, password }) => {
  const result = await fetch("/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
  if (!result.ok) {
    return alert("Error al iniciar sesión");
  }

  // set cookie
  const { token, user } = await result.json();
  Cookie.set("user", JSON.stringify({ token, ...user }), { expires: 1 });

  // redirect to profile
  window.location.href = "/admin/profile";
};
</script>

<template>
  <FormKit
    id="form_robe_rental"
    @submit="submitHandlerLogin"
    type="form"
    submit-label="Solicitar Alquiler"
    incomplete-message="Error, revisa lo que estás enviando al formulario"
  >
  foto de su rostro

  </FormKit>
</template>

<style scoped>
.formkit-outer {
  max-width: 100%;
}
</style>
