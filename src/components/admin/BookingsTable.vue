<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../../utils/supabase";
import * as XLSX from "xlsx-js-style";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  attendees: any[];
  profile: {
    first_name: string;
    last_name: string;
    student_code: string;
  };
}

const bookings = ref<Booking[]>([]);
const isLoading = ref(false);
const page = ref(1);
const limit = 10;
const totalCount = ref(0);

const fetchBookings = async () => {
  isLoading.value = true;
  try {
    const { data, error, count } = await supabase
      .from("study_room_bookings")
      .select(`
        *,
        profile:profiles(first_name, last_name, student_code)
      `, { count: 'exact' })
      .order("booking_date", { ascending: false })
      .range((page.value - 1) * limit, page.value * limit - 1);

    if (error) throw error;
    bookings.value = data || [];
    totalCount.value = count || 0;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const cancelBooking = async (id: string) => {
    if(!confirm("¿Cancelar esta reserva?")) return;
    const { error } = await supabase.from("study_room_bookings").update({ status: 'cancelled' }).eq('id', id);
    if(error) alert("Error");
    else fetchBookings();
}

const exportToExcel = () => {
  const statusMap: Record<string, string> = {
    'confirmed': 'Confirmado',
    'cancelled': 'Cancelado',
    'pending': 'Pendiente'
  };

  const data = bookings.value.map(b => ({
    "Estudiante": `${b.profile?.first_name} ${b.profile?.last_name}`,
    "Código": b.profile?.student_code,
    "Fecha": b.booking_date,
    "Inicio": b.start_time.slice(0, 5),
    "Fin": b.end_time.slice(0, 5),
    "Cant. Personas": b.attendees?.length || 1,
    "Estado": statusMap[b.status] || b.status
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Style header
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "D97706" } }, // Amber-600
    alignment: { horizontal: "center" }
  };

  const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    ws[address].s = headerStyle;
  }
  
  // Column widths
  ws['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Reservas");
  XLSX.writeFile(wb, `Reservas_${new Date().toISOString().slice(0,10)}.xlsx`);
};

onMounted(fetchBookings);
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
    <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg dark:text-neutral-200">Reservas de Sala</h3>
        <button 
           @click="exportToExcel"
           class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold"
        >
           <i class="ri-file-excel-2-line"></i> Exportar Excel
        </button>
    </div>
    
    <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[700px]">
        <thead class="bg-gray-100 dark:bg-neutral-700 uppercase text-xs">
            <tr>
                <th class="p-4">Reservado Por</th>
                <th class="p-4">Fecha/Hora</th>
                <th class="p-4">Asistentes</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-right">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="isLoading"><td colspan="5" class="p-4 text-center">Cargando...</td></tr>
            <tr v-for="item in bookings" :key="item.id" class="border-b dark:border-neutral-700">
                <td class="p-4">
                    <p class="font-bold">{{ item.profile?.first_name }} {{ item.profile?.last_name }}</p>
                    <p class="text-xs text-neutral-500">{{ item.profile?.student_code }}</p>
                </td>
                <td class="p-4">
                    <p>{{ item.booking_date }}</p>
                    <p class="text-xs">{{ item.start_time.slice(0,5) }} - {{ item.end_time.slice(0,5) }}</p>
                </td>
                <td class="p-4">
                    <span class="text-xs bg-gray-100 dark:bg-neutral-600 px-2 py-1 rounded">{{ item.attendees?.length || 1 }} Personas</span>
                    <div class="text-xs text-neutral-500 mt-1 max-h-20 overflow-y-auto">
                        <div v-for="att in item.attendees" :key="att.code">{{ att.name }}</div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs uppercase"
                    :class="{
                        'bg-green-100 text-green-800': item.status === 'confirmed',
                        'bg-red-100 text-red-800': item.status === 'cancelled'
                    }">
                        {{ 
                             item.status === 'confirmed' ? 'Confirmado' : 
                             item.status === 'cancelled' ? 'Cancelado' : item.status
                        }}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <button v-if="item.status === 'confirmed'" @click="cancelBooking(item.id)" class="text-red-600 hover:text-red-800 font-bold text-xs border border-red-600 px-2 py-1 rounded">Cancelar</button>
                </td>
            </tr>
        </tbody>
        </table>
    </div>
    
    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4 pt-4 border-t dark:border-neutral-700">
      <span class="text-sm text-neutral-600 dark:text-neutral-400">
        Página {{ page }} de {{ Math.ceil(totalCount / limit) || 1 }}
      </span>
      <div class="flex gap-2">
        <button 
          @click="page > 1 && (page--, fetchBookings())" 
          class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded disabled:opacity-50"
          :disabled="page === 1"
        >
          Anterior
        </button>
        <button 
          @click="page < Math.ceil(totalCount / limit) && (page++, fetchBookings())" 
          class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded disabled:opacity-50"
          :disabled="page >= Math.ceil(totalCount / limit)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
