<script setup lang="ts">
import { ref, computed } from "vue";
import { supabase } from "../../utils/supabase";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  student_code: string;
  phone: string;
  carnet_number: string;
  email?: string;
  avatar_url?: string;
}

const props = defineProps<{
  user: UserProfile | null;
}>();

const isModalOpen = ref(false);
const selectedGownType = ref<"quirurgica" | "clinica" | null>(null);
const isLoading = ref(false);
const message = ref("");

// Mock data for information
const rentalInfo = {
  price: "5 Bs.",
  deliveryDate: "Inmediata", // Today
  returnDate: "24 horas", // Tomorrow
  extraDay: "+5 Bs.",
};

const openModal = async (type: "quirurgica" | "clinica") => {
  if (!props.user) {
    // Should ideally show the login message or redirect, but dependent on page logic.
    // Assuming the button is disabled or handles this in parent if user is null.
    alert("Debes iniciar sesión para realizar un pedido.");
    return;
  }
  
  // Check for active rentals
  isLoading.value = true;
  try {
    const { data: activeRentals, error } = await supabase
      .from("rentals")
      .select("id")
      .eq("user_id", props.user.id)
      .in("status", ["pending", "approved"]);
      
    if (error) throw error;
    
    if (activeRentals && activeRentals.length > 0) {
      alert("No puedes solicitar otra bata porque ya tienes una solicitud activa o aprobada.");
      isLoading.value = false;
      return;
    }

    selectedGownType.value = type;
    isModalOpen.value = true;
  } catch (e: any) {
    alert("Error al verificar estado: " + e.message);
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedGownType.value = null;
  message.value = "";
};

const termAccepted = ref(false);

const submitRequest = async () => {
  if (!props.user || !selectedGownType.value) return;
  if (!termAccepted.value) {
    message.value = "Debes confirmar que los datos son correctos.";
    return; 
  }

  isLoading.value = true;
  message.value = "";

  const expectedReturn = new Date();
  expectedReturn.setDate(expectedReturn.getDate() + 1); // +1 day

  try {
    // Double check active rentals
    const { data: activeRentals, error: checkError } = await supabase
      .from("rentals")
      .select("id")
      .eq("user_id", props.user.id)
      .in("status", ["pending", "approved"]);
      
    if (checkError) throw checkError;
    
    if (activeRentals && activeRentals.length > 0) {
      message.value = "Ya tienes una solicitud activa o aprobada.";
      isLoading.value = false;
      return;
    }

    const { error } = await supabase.from("rentals").insert({
      user_id: props.user.id,
      gown_type: selectedGownType.value,
      expected_return_date: expectedReturn.toISOString(),
      status: "pending",
    });

    if (error) throw error;

    message.value = "Solicitud enviada correctamente.";
    closeModal();
  } catch (e: any) {
    message.value = "Error al enviar solicitud: " + e.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
    <!-- Card Quirurgica -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group cursor-pointer border border-neutral-200 dark:border-neutral-700"
      @click="openModal('quirurgica')"
    >
      <div class="h-64 overflow-hidden bg-gray-200">
        <!-- Placeholder Image -->
         <!-- <Image src={{ bataQuirigicaImg }} alt="Bata Quirurgica" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> -->
        <img
          src="/images/bata-quirurgica.jpg"
          alt="Bata Quirurgica"
          class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div class="p-6">
        <h3 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Bata Quirúrgica
        </h3>
        <p class="text-neutral-600 dark:text-neutral-400 mt-2">
          Para anfiteatro o quirofano.
        </p>
      </div>
    </div>

    <!-- Card Clinica -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group cursor-pointer border border-neutral-200 dark:border-neutral-700"
      @click="openModal('clinica')"
    >
      <div class="h-64 overflow-hidden bg-gray-200">
        <!-- Placeholder Image -->
        <img
          src="/images/bata-clinica.jpg"
          alt="Bata Clinica"
          class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div class="p-6">
        <h3 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Bata Clínica
        </h3>
        <p class="text-neutral-600 dark:text-neutral-400 mt-2">
          Para laboratorio.
        </p>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
    >
      <div class="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h3 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Solicitud de Alquiler:
          {{
            selectedGownType === "quirurgica"
              ? "Bata Quirúrgica"
              : "Bata Clínica"
          }}
        </h3>
      </div>

      <div class="p-6 space-y-6">
        <!-- Info Previa -->
        <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <ul class="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Precio:</strong> {{ rentalInfo.price }}</li>
            <li>
              <strong>Fecha Entrega:</strong> {{ rentalInfo.deliveryDate }}
            </li>
            <li><strong>Devolución:</strong> {{ rentalInfo.returnDate }}</li>
            <li><strong>Cada día extra:</strong> {{ rentalInfo.extraDay }}</li>
          </ul>
        </div>

        <p class="p-2 bg-slate-200 rounded-md dark:bg-slate-50">Una vez solicitado, ve al centro interno de medicina para recogerla</p>

        <!-- User Info -->
        <div v-if="props.user" class="space-y-4">
          <h4
            class="font-semibold text-lg text-neutral-800 dark:text-neutral-200"
          >
            Datos del Solicitante
          </h4>
          <div class="flex items-center gap-4">
            <!-- <img
              :src="
                props.user.avatar_url ||
                'https://via.placeholder.com/100?text=User'
              "
              class="w-16 h-16 rounded-full object-cover border-2 border-amber-500"
            /> -->
            <div>
              <p class="font-bold text-neutral-900 dark:text-white">
                {{ props.user.first_name }} {{ props.user.last_name }}
              </p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">
                {{ props.user.student_code }}
              </p>
            </div>
          </div>
          <div
            class="grid grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <div>
              <span class="font-semibold">Celular:</span> {{ props.user.phone }}
            </div>
            <div>
              <span class="font-semibold">Carnet:</span>
              {{ props.user.carnet_number }}
            </div>
            <div>
              <span class="font-semibold">Email:</span> {{ props.user.email }}
            </div>
          </div>
        </div>

        <!-- Feedback -->
        <div
          v-if="message"
          :class="`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`"
        >
          {{ message }}
        </div>
        <!-- Terms Check -->
        <div class="flex items-center gap-2">
          <input type="checkbox" id="term" v-model="termAccepted" class="w-4 h-4 text-amber-600 rounded">
          <label for="term" class="text-sm text-neutral-700 dark:text-neutral-300">Confirmo que los datos son correctos.</label>
        </div>
      </div>

      <div
        class="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3"
      >
        <button
          @click="closeModal"
          class="px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
        >
          Cancelar
        </button>
        <button
          @click="submitRequest"
          :disabled="isLoading"
          class="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ isLoading ? "Enviando..." : "Enviar Solicitud" }}
        </button>
      </div>
    </div>
  </div>
</template>
