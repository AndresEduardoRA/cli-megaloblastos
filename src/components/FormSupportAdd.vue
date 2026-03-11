<script setup lang="ts">
import { ref, computed } from "vue";
import { materias } from "@/consts/db";
import Cookie from "js-cookie";
import { supabase } from "@/utils/supabase";

const theSupportMaterial = ref({
  title: "",
  type: "",
  url: "",
  year: "",
  materia: "",
  docente: "",
  partial: "",
});

// filtrar materia según año seleccionado
const materiasFiltradasByYear = computed(() => {
  return materias.filter(
    (m) =>
      m.year ==
      theSupportMaterial.value.year
        .toString()
        .replace("ro", "")
        .replace("do", "")
        .replace("to", ""),
  ); // simple hack to match 1 vs 1ro if needed, but options are 1ro..
  // Wait, the options in template are "1ro", "2do", etc.
  // In `db.ts` usually years are numbers?
  // Let's check `db.ts` if possible, but assuming standard logic:
  // If db has numbers:
  // return materias.filter((m) => m.year == parseInt(theSupportMaterial.value.year));
  // If current options are ['1ro'...], parseInt("1ro") -> 1.
  return materias.filter(
    (m) => m.year == parseInt(theSupportMaterial.value.year as any),
  );
});

// filtrar docente segun la materia y el año seleccionados
const docentesFiltrados = computed(() => {
  const materiaSeleccionada = theSupportMaterial.value.materia
    ? materias.find(
        (materia) => `${materia.name}` == theSupportMaterial.value.materia,
      )
    : null;

  if (materiaSeleccionada?.name == "Cirugía 2") {
    return [{ name: "Viruez Soleto Erwin" }];
  }

  if (materiaSeleccionada?.name == "Cirugía 3") {
    return [{ name: "Jorge Fernando Aparicio" }];
  }

  return materiaSeleccionada ? materiaSeleccionada.docentes : [];
});

const isMultigrupo = computed(() => {
  const materiaIsMultigrupo = materiasFiltradasByYear.value.find(
    (materia) => `${materia.name}` == theSupportMaterial.value.materia,
  )?.multigrupo;
  const materiaAndDocenteNoMultigrupo = [
    { materia: "Cirugía 2", docente: "Viruez Soleto Erwin" },
    { materia: "Cirugía 3", docente: "Jorge Fernando Aparicio" },
  ];
  return (
    materiaIsMultigrupo &&
    materiaAndDocenteNoMultigrupo.some(
      (item) =>
        item.materia === theSupportMaterial.value.materia &&
        item.docente === theSupportMaterial.value.docente,
    )
  );
});

const emit = defineEmits(["success", "cancel"]);
const isLoading = ref(false);

const session = Cookie.get("user");
const user = session ? JSON.parse(session) : null;

const handleSubmit = async (formData: any) => {
  if (isLoading.value) return;
  isLoading.value = true;
  // formData comes from FormKit
  try {
    const { title, type, url, year, subject, teacher, partial } = formData;

    const { error } = await supabase.from("materials").insert({
      title,
      type,
      url,
      year, // Form options are already "1ro", "2do"... which matches DB constraint probably
      subject,
      teacher,
      partial, // Form options are "1er Parcial"... matches DB text likely.
    });

    if (error) throw error;

    alert("Material creado correctamente");
    emit("success");
  } catch (e: any) {
    alert("Error: " + e.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <FormKit
    id="form_Support_Add"
    @submit="handleSubmit"
    type="form"
    submit-label="Guardar Material"
    incomplete-message="Revise los campos requeridos"
    :actions="false"
  >
    <!-- Custom validation summary or messages could go here -->

    <FormKit
      type="text"
      label="Título"
      name="title"
      placeholder="Ej. Anatomía de Grey"
      v-model="theSupportMaterial.title"
      validation="required"
    />

    <FormKit
      type="select"
      label="Tipo"
      name="type"
      placeholder="Selecciona tipo"
      v-model="theSupportMaterial.type"
      :options="['Material de apoyo', 'Bancos de preguntas']"
      validation="required"
    />

    <FormKit
      type="text"
      label="URL del Recurso"
      name="url"
      v-model="theSupportMaterial.url"
      validation="required|url"
    />

    <FormKit
      type="select"
      label="Año"
      name="year"
      v-model="theSupportMaterial.year"
      :options="['1ro', '2do', '3ro', '4to', '5to']"
      validation="required"
    />

    <FormKit
      type="select"
      label="Materia"
      name="subject"
      v-model="theSupportMaterial.materia"
      :options="materiasFiltradasByYear.map((m) => m.name)"
      validation="required"
    />

    <FormKit
      v-if="!isMultigrupo"
      type="select"
      label="Docente"
      name="teacher"
      v-model="theSupportMaterial.docente"
      :options="docentesFiltrados.map((d) => d.name)"
    />

    <FormKit
      type="select"
      label="Parcial"
      name="partial"
      v-model="theSupportMaterial.partial"
      :options="[
        '1er Parcial',
        '2do Parcial',
        '3er Parcial',
        'Final',
        '2da Instancia',
      ]"
      validation="required"
    />

    <div class="mt-4 flex justify-end gap-2">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-neutral-600 hover:bg-gray-100 rounded"
        :disabled="isLoading"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading"
      >
        {{ isLoading ? "Cargando..." : "Guardar" }}
      </button>
    </div>
  </FormKit>

  <!-- <div
    class="py-6 px-8 bg-white dark:bg-neutral-800 shadow-md rounded-md w-full"
  >
    <h3
      class="text-center text-ellipsis overflow-hidden text-nowrap capitalize text-2xl text-neutral-800 dark:text-neutral-200"
    >
      {{ theSupportMaterial.type == "" ? "Tipo" : theSupportMaterial.type }}
    </h3>
    <div class="flex justify-center py-3">
      <a
        :href="theSupportMaterial.url == '' ? '#' : theSupportMaterial.url"
        :class="
          theSupportMaterial.url == ''
            ? 'cursor-not-allowed bg-neutral-500'
            : 'bg-primary hover:bg-orange-500'
        "
        class="py-2 px-6 rounded-md font-medium text-neutral-200 text-center inline-block inset-x-auto"
        :target="theSupportMaterial.url == '' ? '_self' : '_blank'"
        rel="noopener noreferrer"
      >
        Ver Recursos
      </a>
    </div>
  </div> -->
</template>

<style scoped>
.formkit-outer {
  max-width: 100%;
}
</style>
