"use client";

import { useEffect, useState } from "react";
import {
  getAllRentalsAction,
  updateRentalStatusAction,
} from "@/actions/rentals";
import { Rental } from "@/services/rentals";
import {
  Search,
  Check,
  X,
  RotateCcw,
  Download,
  TrendingUp,
  Shirt,
  Calendar,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PrivateRobeRentalPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      const { data, count } = await getAllRentalsAction(page, limit);
      setRentals(data);
      setCount(count);
      setLoading(false);
    };

    fetchRentals();
  }, [page]);

  const updateStatus = async (id: string, newStatus: Rental["status"]) => {
    await updateRentalStatusAction(id, newStatus);
    setRentals(
      rentals.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
  };

  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch =
      `${rental.profiles.username}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rental.profiles.student_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || rental.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalEarnings =
    rentals.filter((r) => r.status === "approved" || r.status === "returned")
      .length * 5;

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Estudiante",
      "Codigo",
      "Tipo",
      "Estado",
      "Fecha Pedido",
      "Fecha Devolucion",
    ];
    const rows = filteredRentals.map((r) => [
      r.id,
      `${r.profiles.username}`,
      r.profiles.student_code,
      r.gown_type,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
      new Date(r.expected_return_date).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rentals_${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Alquiler de Batas
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gestiona las solicitudes de alquiler y devoluciones.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm font-medium"
        >
          <Download size={18} />
          Exportar Datos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
            <Shirt size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Pendientes</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {rentals.filter((r) => r.status === "pending").length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
            <RotateCcw size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">En Alquiler</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {rentals.filter((r) => r.status === "approved").length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Ganado</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {totalEarnings} Bs.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-amber-500 w-full md:w-48"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="returned">Devueltos</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-sm uppercase font-semibold">
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Fechas</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredRentals.map((rental) => (
                <tr
                  key={rental.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-white">
                          {rental.profiles.username}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Cód: {rental.profiles.student_code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        rental.gown_type === "quirurgica"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {rental.gown_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <p className="text-neutral-500 flex items-center gap-1">
                        <Calendar size={12} /> Solicitado:{" "}
                        {new Date(rental.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-neutral-500 flex items-center gap-1">
                        <RotateCcw size={12} /> Devolución:{" "}
                        {new Date(
                          rental.expected_return_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rental.status === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : rental.status === "approved"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : rental.status === "returned"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {rental.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {rental.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(rental.id, "approved")}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => updateStatus(rental.id, "rejected")}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {rental.status === "approved" && (
                        <button
                          onClick={() => updateStatus(rental.id, "returned")}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Marcar como devuelto"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <p className="text-sm text-neutral-500">
          Mostrando <span className="font-medium text-neutral-800 dark:text-white">{filteredRentals.length}</span> de <span className="font-medium text-neutral-800 dark:text-white">{count}</span> resultados
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium px-4">
            Página {page} de {Math.ceil(count / limit) || 1}
          </span>
          <button
            disabled={page >= Math.ceil(count / limit) || loading}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
