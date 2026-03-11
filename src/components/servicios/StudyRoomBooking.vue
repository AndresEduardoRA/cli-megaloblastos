<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { supabase } from "../../utils/supabase";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  student_code: string;
}

const props = defineProps<{
  user: UserProfile | null;
}>();

const availableSlots = ref<string[]>([]);
const selectedSlot = ref<string | null>(null);
const attendeeCount = ref(1);
const attendees = ref<{ name: string; code: string }[]>([
  { name: "", code: "" },
]);
const isModalOpen = ref(false);
const isLoading = ref(false);
const message = ref("");

// Generate slots for the day (8:00 to 20:00, 1.5 hour booking)
const generateSlots = () => {
  const slots = [];
  let startTime = 8 * 60; // 8:00 in minutes
  const endTime = 20 * 60; // 20:00 in minutes
  const interval = 90; // 1.5 hours in minutes

  while (startTime + interval <= endTime) {
    const startH = Math.floor(startTime / 60);
    const startM = startTime % 60;
    const endTotal = startTime + interval;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const format = (h: number, m: number) =>
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

    slots.push(`${format(startH, startM)} - ${format(endH, endM)}`);
    startTime += interval;
  }
  return slots;
};

// Check availability (Mocked vs Real DB check)
// ideally we fetch bookings for today and remove taken slots
const checkAvailability = async () => {
  isLoading.value = true; // Start loading
  try {
    const allSlots = generateSlots();
    // Fetch from Supabase
    const today = new Date().toISOString().split("T")[0];
    const { data: bookings } = await supabase
      .from("study_room_bookings")
      .select("start_time, end_time")
      .eq("booking_date", today)
      .eq("status", "confirmed");

    if (!bookings) {
      availableSlots.value = allSlots;
      return;
    }

    // Filter logic
    // We compare strict string matches for simplicity or check ranges
    // DB stores HH:MM:SS. We need "HH:MM"
    const takenStarts = bookings.map((b) => b.start_time.slice(0, 5));

    availableSlots.value = allSlots.filter((slot) => {
      const startHour = slot.split(" - ")[0]; // "08:00"
      return !takenStarts.includes(startHour);
    });
  } finally {
    isLoading.value = false; // End loading
  }
};

const disableBooking = ref(false);
const activeBookingMessage = ref("");

onMounted(async () => {
  await checkAvailability(); // await to ensure loading finishes
  if (props.user) {
    const today = new Date().toISOString().split("T")[0];
    const { data: existingBookings, error } = await supabase
      .from("study_room_bookings")
      .select("id, booking_date, start_time, end_time")
      .eq("user_id", props.user.id)
      .eq("status", "confirmed")
      .gte("booking_date", today);

    if (existingBookings && existingBookings.length > 0) {
      const booking = existingBookings[0];
      const date = new Date(booking.booking_date).toLocaleDateString();
      const start = booking.start_time.slice(0, 5);
      const end = booking.end_time.slice(0, 5);
      
      disableBooking.value = true;
      activeBookingMessage.value =
        `Ya tienes una reserva vigente para el ${date} de ${start} a ${end}. No puedes realizar nuevas reservas por ahora.`;
    }
  }
});

const openModal = (slot: string) => {
  if (!props.user) {
    alert("Debes iniciar sesión para reservar.");
    return;
  }
  selectedSlot.value = slot;
  // Initialize first attendee as the user
  attendees.value = [
    {
      name: `${props.user.first_name} ${props.user.last_name}`,
      code: props.user.student_code,
    },
  ];
  attendeeCount.value = 1;
  isModalOpen.value = true;
};

const updateAttendeesCount = () => {
  const count = attendeeCount.value;
  if (count > attendees.value.length) {
    for (let i = attendees.value.length; i < count; i++) {
      attendees.value.push({ name: "", code: "" });
    }
  } else if (count < attendees.value.length) {
    attendees.value = attendees.value.slice(0, count);
  }
};

const submitBooking = async () => {
  if (!selectedSlot.value || !props.user) return;

  // Validation: Check attendees
  const invalidAttendees = attendees.value.filter(
    (a) => !a.name.trim() || !a.code.trim(),
  );
  if (invalidAttendees.length > 0) {
    message.value =
      "Error: Por favor completa los datos de todos los asistentes.";
    return;
  }

  // Pre-check availability again just in case (optional but good practice)
  // But we rely on backend mainly. Front end check:
  if (!availableSlots.value.includes(selectedSlot.value)) {
    message.value = "Error: Este horario ya no está disponible.";
    return;
  }

  isLoading.value = true;
  message.value = "";

  const [startStr, endStr] = selectedSlot.value.split(" - ");
  // Format to HH:MM:SS
  const startTime = startStr.trim() + ":00";
  const endTime = endStr.trim() + ":00";
  const today = new Date().toISOString().split("T")[0];

  try {
    const { error } = await supabase.from("study_room_bookings").insert({
      user_id: props.user.id,
      booking_date: today,
      start_time: startTime,
      end_time: endTime,
      attendees: attendees.value,
      status: "confirmed",
    });

    if (error) throw error;

    message.value = "Reserva confirmada exitosamente.";
    isModalOpen.value = false;
    await checkAvailability(); // Refresh slots
    message.value = "";
  } catch (e: any) {
    message.value = "Error al reservar: " + e.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div
      v-if="disableBooking"
      class="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"
      role="alert"
    >
      <p class="font-bold">Aviso</p>
      <p>{{ activeBookingMessage }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"
      ></div>
    </div>

    <!-- Data State -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      :class="{ 'opacity-50 pointer-events-none': disableBooking }"
    >
      <button
        v-for="slot in availableSlots"
        :key="slot"
        @click="openModal(slot)"
        class="p-4 rounded-lg border-2 border-amber-500 bg-white dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-neutral-700 transition font-bold text-amber-600 dark:text-amber-500"
      >
        {{ slot }}
      </button>
      <div
        v-if="availableSlots.length === 0"
        class="col-span-full text-center p-8 text-neutral-500 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg"
      >
        <i class="ri-calendar-close-line text-4xl mb-2 block"></i>
        <span class="text-lg font-medium"
          >No hay horarios disponibles para hoy.</span
        >
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
    >
      <div class="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h3 class="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          Reservar Sala: {{ selectedSlot }}
        </h3>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Cantidad de Personas
          </label>
          <select
            v-model="attendeeCount"
            @change="updateAttendeesCount"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option :value="1">1 Persona</option>
            <option :value="2">2 Personas</option>
            <option :value="3">3 Personas</option>
            <option :value="4">4 Personas</option>
            <option :value="5">5 Personas</option>
          </select>
        </div>

        <div class="space-y-3">
          <h4
            class="font-medium text-neutral-800 dark:text-neutral-200 border-b pb-1"
          >
            Asistentes
          </h4>
          <div
            v-for="(attendee, index) in attendees"
            :key="index"
            class="space-y-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
          >
            <p class="text-xs font-bold text-neutral-500 uppercase">
              Persona {{ index + 1 }}
            </p>
            <input
              v-model="attendee.name"
              placeholder="Nombre Completo"
              class="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm dark:text-neutral-100"
            />
            <input
              v-model="attendee.code"
              placeholder="Código Estudiante"
              class="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm dark:text-neutral-100"
            />
          </div>
        </div>

        <!-- Feedback -->
        <div
          v-if="message"
          :class="`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`"
        >
          {{ message }}
        </div>
      </div>

      <div
        class="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3"
      >
        <button
          @click="isModalOpen = false"
          class="px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
        >
          Cancelar
        </button>
        <button
          @click="submitBooking"
          :disabled="isLoading"
          class="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ isLoading ? "Confirmando..." : "Confirmar Reserva" }}
        </button>
      </div>
    </div>
  </div>
</template>
