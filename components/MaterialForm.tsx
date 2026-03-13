"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { SUBJECTS } from "@/consts/SUBJECTS";
import { Material } from "@/types/material";
import { saveMaterialAction } from "@/actions/materials";

const schema = z.object({
  type: z.string().min(1),
  url: z.string().url("URL inválida"),
  year: z.string().min(1),
  subject: z.string().min(1),
  teacher: z.string().optional(),
  partial: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  material?: Material | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function MaterialForm({ material, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    // setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: material
      ? {
          ...material,
          year: String(material.year),
        }
      : {
          type: "",
          url: "",
          year: "",
          subject: "",
          teacher: "",
          partial: "",
        },
  });

  const year = watch("year");
  const subject = watch("subject");
  const teacher = watch("teacher");

  /* ---------------- materias por año ---------------- */

  const subjectsByYear = useMemo(() => {
    return SUBJECTS.filter((s) => s.year === parseInt(year));
  }, [year]);

  /* ---------------- docentes por materia ---------------- */

  const teachers = useMemo(() => {
    const selected = SUBJECTS.find((s) => s.name === subject);

    if (!selected) return [];

    if (selected.name === "Cirugía 2") {
      return [{ name: "Viruez Soleto Erwin" }];
    }

    if (selected.name === "Cirugía 3") {
      return [{ name: "Jorge Fernando Aparicio" }];
    }

    return selected.teachers ?? [];
  }, [subject]);

  /* ---------------- multigrupo ---------------- */

  const isMultigrupo = useMemo(() => {
    const materia = SUBJECTS.find((s) => s.name === subject);

    const special = [
      { materia: "Cirugía 2", docente: "Viruez Soleto Erwin" },
      { materia: "Cirugía 3", docente: "Jorge Fernando Aparicio" },
    ];

    return (
      materia?.multigrupo &&
      special.some(
        (item) => item.materia === subject && item.docente === teacher,
      )
    );
  }, [subject, teacher]);

  /* ---------------- submit ---------------- */

  const onSubmit = async (data: FormValues) => {
    if (loading) return;

    setLoading(true);

    try {
      await saveMaterialAction(material?.id ?? null, data);

      alert("Material guardado correctamente");

      onSuccess?.();
    } catch (e) {
      if (e instanceof Error) alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* tipo */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Tipo
          </label>
          <select
            {...register("type")}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Seleccionar tipo</option>
            <option>Material de apoyo</option>
            <option>Bancos de preguntas</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.type.message}
            </p>
          )}
        </div>

        {/* año */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Año
          </label>
          <select
            {...register("year")}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Seleccionar año</option>
            <option value="1">1ro</option>
            <option value="2">2do</option>
            <option value="3">3ro</option>
            <option value="4">4to</option>
            <option value="5">5to</option>
          </select>
          {errors.year && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.year.message}
            </p>
          )}
        </div>

        {/* materia */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Materia
          </label>
          <select
            {...register("subject")}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Seleccionar materia</option>
            {subjectsByYear.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* docente */}
        {!isMultigrupo && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Docente
            </label>
            <select
              {...register("teacher")}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Seleccionar docente</option>
              {teachers.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* parcial */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Parcial
          </label>
          <select
            {...register("partial")}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
          >
            <option value="1">1er Parcial</option>
            <option value="2">2do Parcial</option>
            <option value="3">3er Parcial</option>
            <option value="final">Final</option>
            <option value="2da">2da Instancia</option>
          </select>
        </div>

        {/* url */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Enlace (Drive, PDF, etc.)
          </label>
          <input
            {...register("url")}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400"
            placeholder="https://drive.google.com/..."
          />
          {errors.url && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.url.message}
            </p>
          )}
        </div>
      </div>

      {/* botones */}
      <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : (
            "Guardar Material"
          )}
        </button>
      </div>
    </form>
  );
}
