<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { supabase } from "../../utils/supabase";
import _ from "lodash";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  student_code: string;
  carnet_number: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
}

const profiles = ref<UserProfile[]>([]);
const isLoading = ref(false);
const message = ref("");
const currentUserRole = ref<string>("");
const currentUserId = ref<string>("");

// Search and Pagination
const searchTerm = ref("");
const page = ref(1);
const limit = 10;
const totalCount = ref(0);

// Computed properties for permissions
const isSuperAdmin = computed(() => currentUserRole.value === "super_admin");
const isAdmin = computed(() => currentUserRole.value === "admin");
const canEditAdmins = computed(() => isSuperAdmin.value);
const canCreateAdmins = computed(() => isSuperAdmin.value);

// Function to check if current user can edit a specific user
const canEditUser = (user: UserProfile) => {
  // Can't edit yourself
  if (user.id === currentUserId.value) return false;
  
  // Can't edit super admins
  if (user.role === "super_admin") return false;
  
  // Only super admin can edit admins
  if (user.role === "admin" && !isSuperAdmin.value) return false;
  
  // Super admin and admin can edit regular users
  return isSuperAdmin.value || isAdmin.value;
};

// Get current user role
const getCurrentUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUserId.value = user.id;
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

// Pagination could be added but let's stick to basic list for now or match other tables
const fetchProfiles = async () => {
  isLoading.value = true;
  try {
    let query = supabase.from("profiles").select("*", { count: "exact" });

    if (searchTerm.value) {
      query = query.or(`first_name.ilike.%${searchTerm.value}%,last_name.ilike.%${searchTerm.value}%,student_code.ilike.%${searchTerm.value}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page.value - 1) * limit, page.value * limit - 1);

    if (error) {
      console.error(error);
    } else {
      profiles.value = data || [];
      totalCount.value = count || 0;
    }
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = _.debounce(fetchProfiles, 500);

import { watch } from "vue";
watch(searchTerm, () => {
  page.value = 1;
  debouncedFetch();
});

watch(page, fetchProfiles);

// Modal Logic
const isEditModalOpen = ref(false);
const editingUser = ref<UserProfile | null>(null);
const editForm = ref({
  first_name: "",
  last_name: "",
  student_code: "",
  carnet_number: "",
  phone: "",
  role: "",
});

const openEditModal = (user: UserProfile) => {
  // Super admin can edit anyone except themselves
  // Admin can only edit users (not other admins or super admins)
  if (user.id === currentUserId.value) {
    alert("No puedes editarte a ti mismo.");
    return;
  }

  if (user.role === "super_admin") {
    alert("No se pueden editar super administradores.");
    return;
  }

  if (user.role === "admin" && !isSuperAdmin.value) {
    alert("Solo los super administradores pueden editar administradores.");
    return;
  }

  editingUser.value = user;
  editForm.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    student_code: user.student_code,
    carnet_number: user.carnet_number,
    phone: user.phone || "",
    role: user.role || "user",
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingUser.value = null;
  message.value = "";
};

const isSaving = ref(false);

const saveUser = async () => {
  if (!editingUser.value) return;

  isSaving.value = true;
  message.value = "";

  try {
    const { error } = await supabase
      .from("profiles")
      // @ts-ignore
      .update({
        first_name: editForm.value.first_name,
        last_name: editForm.value.last_name,
        student_code: editForm.value.student_code,
        carnet_number: editForm.value.carnet_number,
        phone: editForm.value.phone,
        role: editForm.value.role,
      })
      .eq("id", editingUser.value.id);

    if (error) throw error;

    message.value = "Usuario actualizado correctamente.";
    // Refresh list locally
    const index = profiles.value.findIndex(
      (p) => p.id === editingUser.value?.id,
    );
    if (index !== -1) {
      profiles.value[index] = { ...profiles.value[index], ...editForm.value };
    }

    setTimeout(() => {
      closeEditModal();
      fetchProfiles(); // Full refresh to be safe
    }, 1000);
  } catch (e: any) {
    message.value = "Error al actualizar: " + e.message;
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await getCurrentUserRole();
  fetchProfiles();
});
</script>

<template>
  <div>
    <div v-if="isLoading && profiles.length === 0" class="p-8 text-center text-neutral-500">
      Cargando usuarios...
    </div>

    <div v-else>
      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
            <i class="ri-search-line"></i>
          </span>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por nombre, apellido o código..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-amber-500 outline-none transition"
          />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700"
          >
            <tr>
              <th
                class="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Usuario
              </th>
              <th
                class="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Código / Carnet
              </th>
              <th
                class="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Rol
              </th>
              <th
                class="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Registro
              </th>
              <th
                class="px-6 py-4 font-semibold text-neutral-600 dark:text-neutral-300 text-right"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <tr
              v-for="profile in profiles"
              :key="profile.id"
              class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-500 font-bold"
                  >
                    {{ profile.first_name?.[0] }}{{ profile.last_name?.[0] }}
                  </div>
                  <div>
                    <div
                      class="font-medium text-neutral-900 dark:text-neutral-100"
                    >
                      {{ profile.first_name }} {{ profile.last_name }}
                    </div>
                    <!-- We don't have email in profiles table usually, showing ID or nothing -->
                    <div
                      class="text-xs text-neutral-500 truncate max-w-[150px]"
                      title="ID de Usuario"
                    >
                      {{ profile.id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                <div class="flex flex-col">
                  <span class="font-medium"
                    >Est: {{ profile.student_code }}</span
                  >
                  <span class="text-xs">CI: {{ profile.carnet_number }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize"
                  :class="{
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': profile.role === 'super_admin',
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300': profile.role === 'admin',
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': profile.role === 'user' || !profile.role
                  }"
                >
                  {{ 
                    profile.role === 'super_admin' ? 'Super Admin' :
                    profile.role === 'admin' ? 'Administrador' :
                    'Estudiante'
                  }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
              >
                {{ new Date(profile.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="canEditUser(profile)"
                  @click="openEditModal(profile)"
                  class="text-neutral-400 hover:text-amber-600 dark:hover:text-amber-500 transition mr-2"
                  title="Editar"
                >
                  <i class="ri-pencil-line text-lg"></i>
                </button>
                <span 
                  v-else-if="profile.role === 'super_admin' || (profile.role === 'admin' && !isSuperAdmin) || profile.id === currentUserId"
                  class="text-xs text-neutral-400 italic"
                >
                  {{ profile.id === currentUserId ? 'Tú mismo' : 'Solo lectura' }}
                </span>
              </td>
            </tr>
            <tr v-if="profiles.length === 0">
              <td
                colspan="5"
                class="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400"
              >
                No se encontraron usuarios.
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
    </div>

    <!-- Edit Modal -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in"
      >
        <div
          class="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center"
        >
          <h3 class="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            Editar Usuario
          </h3>
          <button
            @click="closeEditModal"
            class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                >Nombres</label
              >
              <input
                v-model="editForm.first_name"
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                >Apellidos</label
              >
              <input
                v-model="editForm.last_name"
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >Código Estudiante</label
            >
            <input
              v-model="editForm.student_code"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >Carnet de Identidad</label
            >
            <input
              v-model="editForm.carnet_number"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >Teléfono</label
            >
            <input
              v-model="editForm.phone"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >Rol</label
            >
            <select
              v-model="editForm.role"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="user">Estudiante</option>
              <option v-if="canCreateAdmins" value="admin">Administrador</option>
              <!-- Hidden super_admin option to prevent promotion -->
              <option v-if="isSuperAdmin && editingUser?.role === 'super_admin'" value="super_admin">Super Administrador</option>
            </select>
          </div>

          <div
            v-if="message"
            :class="`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`"
          >
            {{ message }}
          </div>
        </div>

        <div
          class="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-800/50"
        >
          <button
            @click="closeEditModal"
            class="px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition"
            :disabled="isSaving"
          >
            Cancelar
          </button>
          <button
            @click="saveUser"
            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition shadow disabled:opacity-50"
            :disabled="isSaving"
          >
            {{ isSaving ? "Guardando..." : "Guardar Cambios" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
