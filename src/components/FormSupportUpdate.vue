<script setup lang="ts">
import { ref, computed } from "vue";
import { materias } from "@/consts/db";
import { supabase } from "@/utils/supabase";

// props
const props = defineProps({
  material: Object,
});

const theSupportMaterial = ref({
  title: props.material?.title || "",
  type: props.material?.type || "",
  url: props.material?.url || "",
  year: props.material?.year
    ? props.material.year.replace("ro", "").replace("do", "").replace("to", "")
    : "", // Clean "1ro" -> "1"
  materia: props.material?.subject || "",
  docente: props.material?.teacher || "",
  partial: props.material?.partial || "",
});
// Reuse computed logic from Add form or keeping existing logic if it works.
// The existing logic used `materias` import.
// filtering logic...

// We need to keep the computed logic for materiasFiltradasByYear etc.
const materiasFiltradasByYear = computed(() => {
  return materias.filter((m) => m.year == theSupportMaterial.value.year);
});

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

const handleSubmit = async (formData: any) => {
  if(isLoading.value) return;
  isLoading.value = true;
  try {
    const { title, type, url, year, subject, teacher, partial } = formData;

    const { error } = await supabase
      .from("materials")
      .update({
        title,
        type,
        url,
        year: year + "ro", // Re-add suffix if needed, or better, standardize on just strings in DB?
        // MaterialsTable shows "1ro".
        subject,
        teacher,
        partial, // This might need " Parcial" suffix or be consistent.
      })
      .eq("id", props.material.id);

    if (error) throw error;

    alert("Material actualizado correctamente");
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
    id="form_Support_Update"
    @submit="handleSubmit"
    type="form"
    submit-label="Actualizar"
    incomplete-message="Error, revisa lo que estás enviando al formulario"
    :actions="false"
  >
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
      label="Selecciona el tipo"
      name="type"
      v-model="theSupportMaterial.type"
      :options="['Material de apoyo', 'Bancos de preguntas']"
      validation="required"
    />
    <FormKit
      type="text"
      label="Url"
      name="url"
      v-model="theSupportMaterial.url"
      validation="required|url"
    />

    <FormKit
      type="select"
      label="Año"
      name="year"
      v-model="theSupportMaterial.year"
      :options="['1', '2', '3', '4', '5']"
      validation="required"
    />

    <FormKit
      type="select"
      label="Materia"
      name="subject"
      v-model="theSupportMaterial.materia"
      :options="materiasFiltradasByYear.map((materia) => materia.name)"
      validation="required"
    />
    <FormKit
      v-if="!isMultigrupo"
      type="select"
      label="Docente"
      name="teacher"
      v-model="theSupportMaterial.docente"
      :options="docentesFiltrados.map((docente) => docente.name)"
    />
    <FormKit
      type="select"
      label="Parcial"
      name="partial"
      v-model="theSupportMaterial.partial"
      :options="[
        '1',
        '2',
        '3',
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
        {{ isLoading ? "Cargando..." : "Actualizar" }}
      </button>
    </div>
  </FormKit>
</template>

<style scoped>
.formkit-outer {
  max-width: 100%;
}
</style>
