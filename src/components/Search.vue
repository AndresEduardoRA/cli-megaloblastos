<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { supabase } from "../utils/supabase";
import _ from "lodash";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  subject: string;
  url: string;
}

const isModalOpen = ref(false);
const searchTerm = ref("");
const results = ref<SearchResult[]>([]);
const isLoading = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const openModal = async () => {
  isModalOpen.value = true;
  await nextTick();
  inputRef.value?.focus();
};

const closeModal = () => {
  isModalOpen.value = false;
  searchTerm.value = "";
  results.value = [];
};

const performSearch = async () => {
  if (!searchTerm.value || searchTerm.value.length < 2) {
    results.value = [];
    return;
  }

  isLoading.value = true;
  try {
    // using ilike for simple partial match on title.
    // For FTS, we would use .textSearch('title', searchTerm.value)
    const { data, error } = await supabase
      .from("materials")
      .select("id, title, type, subject, url")
      .ilike("title", `%${searchTerm.value}%`)
      .limit(10);

    if (error) throw error;
    results.value = data || [];
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const debouncedSearch = _.debounce(performSearch, 500);

watch(searchTerm, () => {
  if (searchTerm.value === "") {
    results.value = [];
    return;
  }
  debouncedSearch();
});

const handleResultClick = (url: string) => {
  window.open(url, "_blank");
  closeModal();
};

// Handle ESC key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};

window.addEventListener("keydown", handleKeydown);
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <button
      @click="openModal"
      class="flex items-center gap-2 pl-3 pr-12 py-2 rounded-full bg-neutral-200 dark:bg-neutral-100 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-600 transition"
    >
      <i class="ri-search-line text-xl"></i>
      <span class="hidden md:inline text-sm">Buscar...</span>
    </button>

    <!-- Modal Overlay -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm transition-opacity"
      @click.self="closeModal"
    >
      <div
        class="bg-white dark:bg-neutral-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden transform transition-all"
      >
        <!-- Search Header -->
        <div class="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
          <i class="ri-search-line text-xl text-neutral-400"></i>
          <input
            ref="inputRef"
            v-model="searchTerm"
            class="flex-1 bg-transparent border-none outline-none text-lg text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
            placeholder="Buscar materiales, libros, guías..."
            autocomplete="off"
          />
          <button
             v-if="searchTerm"
             @click="searchTerm = ''"
             class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
             <i class="ri-close-circle-fill"></i>
          </button>
          <button
             @click="closeModal"
             class="p-1 px-2 text-sm bg-neutral-100 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400"
          >
             ESC
          </button>
        </div>

        <!-- Results Body -->
        <div class="max-h-[60vh] overflow-y-auto">
          <!-- Loading -->
          <div v-if="isLoading" class="p-8 text-center text-neutral-500">
             <i class="ri-loader-4-line text-2xl animate-spin inline-block mb-2"></i>
             <p>Buscando...</p>
          </div>

          <!-- No Results -->
          <div v-else-if="searchTerm && !isLoading && results.length === 0" class="p-8 text-center text-neutral-500">
             <i class="ri-ghost-line text-4xl mb-2 inline-block"></i>
             <p>No encontramos resultados para "{{ searchTerm }}"</p>
          </div>

          <!-- Empty Init -->
          <div v-else-if="!searchTerm" class="p-8 text-center text-neutral-400">
             <p>Escribe para comenzar a buscar</p>
          </div>

          <!-- Results List -->
          <ul v-else class="divide-y divide-neutral-100 dark:divide-neutral-700/50">
             <li v-for="item in results" :key="item.id">
                <button
                   @click="handleResultClick(item.url)"
                   class="w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition flex items-center justify-between group"
                >
                   <div>
                      <h4 class="font-medium text-neutral-800 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                         {{ item.title }}
                      </h4>
                      <div class="text-xs text-neutral-500 mt-1 flex gap-2">
                         <span class="bg-gray-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">{{ item.type }}</span>
                         <span>{{ item.subject }}</span>
                      </div>
                   </div>
                   <i class="ri-arrow-right-line text-neutral-300 group-hover:text-amber-600 transition-colors"></i>
                </button>
             </li>
          </ul>
        </div>
        
        <!-- Footer Info -->
        <div class="p-2 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-xs text-center text-neutral-400">
           Presiona <kbd class="font-sans px-1 py-0.5 rounded border bg-white dark:bg-neutral-700 dark:border-neutral-600">Enter</kbd> para seleccionar
        </div>
      </div>
    </div>
  </div>
</template>
