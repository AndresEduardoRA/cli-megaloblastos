"use client";

import { useCallback, useEffect, useState } from "react";
import MaterialForm from "./MaterialForm";
import { SUBJECTS } from "@/consts/SUBJECTS";
import { Material } from "@/types/material";
import { deleteMaterialAction, getMaterialsAction } from "@/actions/materials";
import {
  Search,
  Plus,
  BookOpen,
  HelpCircle,
  FileText,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function MaterialsTable({
  initialMaterials,
  total,
}: {
  initialMaterials: Material[];
  total: number;
}) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [count, setCount] = useState(total);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);

  const fetchMaterials = useCallback(async () => {
    const res = await getMaterialsAction({
      search,
      type,
      year: Number(year),
      subject,
      page,
      limit,
    });

    setMaterials(res.data);
    setCount(res.count);
  }, [search, type, year, subject, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchMaterials, 500);
    return () => clearTimeout(timeout);
  }, [fetchMaterials]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar material?")) return;

    await deleteMaterialAction(id);
    fetchMaterials();
  };

  const totalSupport = materials.filter(
    (m) => m.type === "Material de apoyo",
  ).length;
  const totalQuestions = materials.filter(
    (m) => m.type === "Bancos de preguntas",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Materiales Académicos
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gestiona los bancos de preguntas y materiales de apoyo.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-sm font-medium"
        >
          <Plus size={18} />
          Nuevo Material
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Materiales</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {count}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Material de Apoyo</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {totalSupport}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <HelpCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Bancos de Preguntas</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {totalQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 w-full rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="">Todos los tipos</option>
            <option>Material de apoyo</option>
            <option>Bancos de preguntas</option>
          </select>

          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="">Todos los años</option>
            <option value="1">1ro</option>
            <option value="2">2do</option>
            <option value="3">3ro</option>
            <option value="4">4to</option>
            <option value="5">5to</option>
          </select>

          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-amber-500 text-sm max-w-[200px]"
          >
            <option value="">Todas las materias</option>
            {SUBJECTS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-sm uppercase font-semibold">
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Año / Materia</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-neutral-500">
                    No se encontraron materiales.
                  </td>
                </tr>
              ) : (
                materials.map((item: Material) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600">
                          {item.type === "Material de apoyo" ? (
                            <BookOpen size={20} className="text-purple-600" />
                          ) : (
                            <HelpCircle size={20} className="text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-800 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Parcial: {item.partial}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          item.type === "Material de apoyo"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                          {item.subject}
                        </p>
                        <p className="text-neutral-500">{item.year}º Año</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(item);
                            setModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Página <span className="font-medium text-neutral-800 dark:text-white">{page}</span> de{" "}
            <span className="font-medium text-neutral-800 dark:text-white">
              {Math.ceil(count / limit) || 1}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 hover:bg-white dark:hover:bg-neutral-800 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page >= Math.ceil(count / limit)}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 hover:bg-white dark:hover:bg-neutral-800 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl w-full max-w-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
                {editing ? "Editar Material" : "Nuevo Material"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <MaterialForm
              material={editing}
              onSuccess={() => {
                setModalOpen(false);
                fetchMaterials();
              }}
              onCancel={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
