<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../../utils/supabase";
import * as XLSX from "xlsx-js-style";

interface Rental {
  id: string;
  user_id: string;
  gown_type: string;
  status: string;
  expected_return_date: string;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    student_code: string;
  };
}

const rentals = ref<Rental[]>([]);
const isLoading = ref(false);
const page = ref(1);
const limit = 10;
const totalCount = ref(0);
const currentUserRole = ref<string>("");

const getCurrentUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      currentUserRole.value = (profile as any).role || "user";
    }
  }
};

const fetchRentals = async () => {
  isLoading.value = true;
  try {
    const { data, error, count } = await supabase
      .from("rentals")
      .select(
        `
        *,
        profile:profiles(first_name, last_name, student_code)
      `,
       { count: 'exact' }
      )
      .order("created_at", { ascending: false })
      .range((page.value - 1) * limit, page.value * limit - 1);

    if (error) throw error;
    rentals.value = data || [];
    totalCount.value = count || 0;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (id: string, status: string) => {
  if(!confirm("¿Actualizar estado?")) return;
  const { error } = await supabase
    .from("rentals")
    .update({ status: status })
    .eq("id", id);

  if (error) alert("Error al actualizar");
  else fetchRentals();
};

const exportToExcel = () => {
    const statusMap: Record<string, string> = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'returned': 'Devuelto',
        'rejected': 'Rechazado'
    };
  const data = rentals.value.map((r) => ({
    Estudiante: `${r.profile?.first_name} ${r.profile?.last_name}`,
    Código: r.profile?.student_code,
    "Tipo Bata": r.gown_type,
    Estado: statusMap[r.status] || r.status,
    "Fecha Solicitud": new Date(r.created_at).toLocaleDateString(),
    "Devolución Esperada": new Date(
      r.expected_return_date,
    ).toLocaleDateString(),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Style header
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "D97706" } }, // Amber-600
    alignment: { horizontal: "center" },
  };

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    ws[address].s = headerStyle;
  }

  // Column widths
  ws["!cols"] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Alquileres");
  XLSX.writeFile(
    wb,
    `Alquileres_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

onMounted(async () => {
    await getCurrentUserRole();
    fetchRentals();
});
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg dark:text-neutral-200">
        Alquileres de Batas
      </h3>
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
                <th class="p-4">Estudiante</th>
                <th class="p-4">Bata</th>
                <th class="p-4">Estado</th>
                <th class="p-4">Fecha Solicitud</th>
                <th v-if="currentUserRole === 'super_admin'" class="p-4 text-right">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="isLoading"><td colspan="5" class="p-4 text-center">Cargando...</td></tr>
            <tr v-for="item in rentals" :key="item.id" class="border-b dark:border-neutral-700">
                <td class="p-4">
                    <p class="font-bold">{{ item.profile?.first_name }} {{ item.profile?.last_name }}</p>
                    <p class="text-xs text-neutral-500">{{ item.profile?.student_code }}</p>
                </td>
                <td class="p-4 capitalize">{{ item.gown_type }}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs uppercase"
                    :class="{
                        'bg-yellow-100 text-yellow-800': item.status === 'pending',
                        'bg-green-100 text-green-800': item.status === 'approved' || item.status === 'returned',
                        'bg-red-100 text-red-800': item.status === 'rejected'
                    }">
                        {{ 
                            item.status === 'pending' ? 'Pendiente' : 
                            item.status === 'approved' ? 'Aprobado' : 
                            item.status === 'returned' ? 'Devuelto' : 
                            item.status === 'rejected' ? 'Rechazado' : item.status 
                        }}
                    </span>
                </td>
                <td class="p-4 text-sm">{{ new Date(item.created_at).toLocaleDateString() }}</td>
                <td v-if="currentUserRole === 'super_admin'" class="p-4 text-right space-x-2 space-y-2">
                    <button v-if="item.status === 'pending'" @click="updateStatus(item.id, 'approved')" class="text-green-600 hover:text-green-800 font-bold text-xs border border-green-600 px-2 py-1 rounded">Aprobar</button>
                    <button v-if="item.status === 'pending'" @click="updateStatus(item.id, 'rejected')" class="text-red-600 hover:text-red-800 font-bold text-xs border border-red-600 px-2 py-1 rounded">Rechazar</button>
                    <button v-if="item.status === 'approved'" @click="updateStatus(item.id, 'returned')" class="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-600 px-2 py-1 rounded">Marcar Devuelto</button>
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
          @click="page > 1 && (page--, fetchRentals())" 
          class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded disabled:opacity-50"
          :disabled="page === 1"
        >
          Anterior
        </button>
        <button 
          @click="page < Math.ceil(totalCount / limit) && (page++, fetchRentals())" 
          class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded disabled:opacity-50"
          :disabled="page >= Math.ceil(totalCount / limit)"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>
