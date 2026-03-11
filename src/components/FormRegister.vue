<script setup>
import { ref } from "vue";

const errorMessage = ref("");

const submitHandlerRegister = async (formData) => {
  errorMessage.value = "";
  
  try {
    const result = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await result.json();

    if (!result.ok) {
      errorMessage.value = data.message || "Error al registrar usuario";
      return;
    }

    // Redirect on success
    alert("Usuario registrado exitosamente");
    window.location.href = "/auth/login";
  } catch (e) {
    errorMessage.value = "Error de conexión";
  }
};
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
    <h2 class="text-2xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">Registro de Usuario</h2>
    
    <FormKit
      type="form"
      submit-label="Registrar Usuario"
      @submit="submitHandlerRegister"
      incomplete-message="Por favor completa todos los campos correctamente."
    >
      <FormKit
        type="text"
        name="first_name"
        label="Nombres"
        validation="required|length:2"
        placeholder="Juan"
      />

      <FormKit
        type="text"
        name="last_name"
        label="Apellidos"
        validation="required|length:2"
        placeholder="Pérez"
      />

      <FormKit
        type="text"
        name="student_code"
        label="Código de Estudiante"
        validation="required|matches:/^[0-9]+$/|length:5"
        validation-visibility="live"
        :validation-messages="{
          matches: 'Solo se permiten números',
          length: 'Debe tener al menos 5 dígitos' 
        }"
        placeholder="12345"
        help="Solo números"
      />

      <FormKit
        type="text"
        name="carnet_number"
        label="Número de Carnet"
        validation="required|matches:/^[0-9]+$/"
        validation-visibility="live"
        :validation-messages="{
          matches: 'Solo se permiten números' 
        }"
        placeholder="87654321"
      />

      <FormKit
        type="text"
        name="phone"
        label="Número de Celular"
        validation="required|matches:/^[0-9]+$/|length:8"
        validation-visibility="live"
        :validation-messages="{
          matches: 'Solo se permiten números',
          length: 'Debe tener al menos 8 dígitos'
        }"
        placeholder="70000000"
      />

      <FormKit
        type="email"
        name="email"
        label="Correo Electrónico"
        validation="required|email"
        placeholder="juan@ejemplo.com"
      />

      <FormKit
        type="password"
        name="password"
        label="Contraseña"
        validation="required|length:6"
        placeholder="••••••"
      />

      <FormKit
        type="password"
        name="password_confirm"
        label="Confirmar Contraseña"
        validation="required|confirm"
        placeholder="••••••"
        help="Repite tu contraseña"
      />

      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
        {{ errorMessage }}
      </div>

    </FormKit>
    
    <div class="mt-4 text-center text-sm text-neutral-500">
      ¿Ya tienes cuenta? <a href="/auth/login" class="text-amber-600 hover:underline">Inicia Sesión</a>
    </div>
  </div>
</template>

<style scoped>
.formkit-outer {
  margin-bottom: 1rem;
}
</style>
