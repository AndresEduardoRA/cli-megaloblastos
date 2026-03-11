<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { supabase } from "../../utils/supabase";
import _ from "lodash";
import FormSupportAdd from "../FormSupportAdd.vue";
import FormSupportUpdate from "../FormSupportUpdate.vue";
import { materias } from "@/consts/db";

interface Material {
  id: string;
  title: string;
  type: string;
  year: string;
  subject: string;
  teacher: string | null;
  partial: string | null;
  url: string;
}

// Filters
const searchTerm = ref("");
const filterType = ref("");
const filterYear = ref("");
const filterSubject = ref("");

// Data
const materials = ref<Material[]>([]);
const isLoading = ref(false);
const totalCount = ref(0);
const page = ref(1);
const limit = 10;

// Modal State
const isModalOpen = ref(false);
const isEditing = ref(false);
const selectedMaterial = ref<Material | null>(null);

// Delete Modal State
const deleteModalOpen = ref(false);
const materialToDelete = ref<string | null>(null);

// Fetch Data with Debounce
const fetchMaterials = async () => {
  isLoading.value = true;
  try {
    let query = supabase.from("materials").select("*", { count: "exact" });

    if (searchTerm.value) {
      query = query.ilike("title", `%${searchTerm.value}%`);
    }
    if (filterType.value) {
      query = query.eq("type", filterType.value);
    }
    if (filterYear.value) {
      query = query.eq("year", filterYear.value);
    }
    if (filterSubject.value) {
      query = query.eq("subject", filterSubject.value);
    }

    const { data, error, count } = await query
      .range((page.value - 1) * limit, page.value * limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;
    materials.value = data || [];
    totalCount.value = count || 0;
  } catch (e: any) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = _.debounce(fetchMaterials, 500);

watch([searchTerm, filterType, filterYear, filterSubject], () => {
  page.value = 1;
  debouncedFetch();
});

watch(page, fetchMaterials);

onMounted(fetchMaterials);

// CRUD
const openCreateModal = () => {
  isEditing.value = false;
  selectedMaterial.value = null;
  isModalOpen.value = true;
};

const openEditModal = (item: Material) => {
  isEditing.value = true;
  selectedMaterial.value = item;
  isModalOpen.value = true;
};

const promptDelete = (id: string) => {
   materialToDelete.value = id;
   deleteModalOpen.value = true;
}

const confirmDelete = async () => {
  if (!materialToDelete.value) return;
  const { error } = await supabase.from("materials").delete().eq("id", materialToDelete.value);
  if (error) alert("Error al eliminar");
  else fetchMaterials();
  deleteModalOpen.value = false;
};

const handleSuccess = () => {
    isModalOpen.value = false;
    fetchMaterials();
}
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
    <!-- Header: Search & Buttons -->
    <div
      class="flex flex-col md:flex-row gap-4 justify-between items-center mb-6"
    >
      <div class="w-full md:w-1/3">
        <input
          v-model="searchTerm"
          placeholder="Buscar material..."
          class="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <button
        @click="openCreateModal"
        class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
      >
        <i class="ri-add-line"></i> Nuevo Material
      </button>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <select
        v-model="filterType"
        class="px-3 py-2 rounded border dark:bg-neutral-700 dark:border-neutral-600"
      >
        <option value="">Todos los Tipos</option>
        <option value="Material de apoyo">Material de apoyo</option>
        <option value="Bancos de preguntas">Banco de preguntas</option>
      </select>
      <select
        v-model="filterYear"
        class="px-3 py-2 rounded border dark:bg-neutral-700 dark:border-neutral-600"
      >
        <option value="">Todos los Años</option>
        <option value="1">1ro</option>
        <option value="2">2do</option>
        <option value="3">3ro</option>
        <option value="4">4to</option>
        <option value="5">5to</option>
      </select>
      <select
        v-model="filterSubject"
        class="px-3 py-2 rounded border dark:bg-neutral-700 dark:border-neutral-600"
      >
        <option value="">Todas las materias</option>
        <option v-for="subject in materias" :key="subject.name" :value="subject.name">{{ subject.name }}</option>
        <!-- Add more subjects dynamically if needed -->
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead
          class="bg-gray-100 dark:bg-neutral-700 uppercase text-xs text-neutral-600 dark:text-neutral-300"
        >
          <tr>
            <th class="p-3">Título</th>
            <th class="p-3">Tipo</th>
            <th class="p-3">Materia</th>
            <th class="p-3">Año</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody
          class="text-sm divide-y divide-neutral-200 dark:divide-neutral-700"
        >
          <tr v-if="isLoading">
            <td colspan="5" class="p-4 text-center">Cargando...</td>
          </tr>
          <tr v-else-if="materials.length === 0">
            <td colspan="5" class="p-4 text-center">
              No hay materiales encontrados.
            </td>
          </tr>
          <tr
            v-for="item in materials"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
          >
            <td class="p-3 font-medium">{{ item.title }}</td>
            <td class="p-3">
              <span
                class="px-2 py-1 rounded text-xs"
                :class="{
                  'bg-blue-100 text-blue-800': item.type === 'Libro',
                  'bg-purple-100 text-purple-800': item.type === 'Guia',
                  'bg-green-100 text-green-800': item.type === 'Diapositiva',
                }"
                >{{ item.type }}</span
              >
            </td>
            <td class="p-3">{{ item.subject }}</td>
            <td class="p-3">{{ item.year }}</td>
            <td class="p-3 text-right space-x-2">
              <button
                @click="openEditModal(item)"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="ri-edit-line text-lg"></i>
              </button>
              <button
                @click="promptDelete(item.id)"
                class="text-red-600 hover:text-red-800"
              >
                <i class="ri-delete-bin-line text-lg"></i>
              </button>
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
          @click="page > 1 && (page--)" 
          class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded disabled:opacity-50"
          :disabled="page === 1"
        >
          Anterior
        </button>
        <button 
          @click="page < Math.ceil(totalCount / limit) && (page++)" 
          class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded disabled:opacity-50"
          :disabled="page >= Math.ceil(totalCount / limit)"
        >
          Siguiente
        </button>
      </div>
    </div>



    <!-- Modal Form -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-lg p-6 my-8"
      >
        <div class="flex justify-between items-center mb-4">
           <h3 class="text-xl font-bold dark:text-gray-200">
             {{ isEditing ? "Editar Material" : "Nuevo Material" }}
           </h3>
           <button @click="isModalOpen = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
             <i class="ri-close-line text-2xl"></i>
           </button>
        </div>

        <FormSupportUpdate 
          v-if="isEditing && selectedMaterial" 
          :material="selectedMaterial" 
          @success="handleSuccess"
          @cancel="isModalOpen = false"
        />
        <FormSupportAdd 
          v-else 
          @success="handleSuccess"
          @cancel="isModalOpen = false"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
     <div
      v-if="deleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-neutral-200 dark:border-neutral-700">
        <h3 class="text-xl font-bold dark:text-white mb-2">¿Eliminar Material?</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este material?</p>
        
        <div class="flex justify-end gap-3">
           <button @click="deleteModalOpen = false" class="px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">Cancelar</button>
           <button @click="confirmDelete" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">Eliminar</button>
        </div>
      </div>
    </div>

  </div>
</template>
