"use client";

import { useEffect, useState } from "react";
import {
  getBookingsByDateAction,
  cancelBookingAction,
} from "@/actions/study-room";
import {
  Calendar,
  Clock,
  Users,
  XCircle,
  Search,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled";
  attendees: { name: string; code: string }[];
  profiles: {
    username: string;
    student_code: string;
  };
}

export default function PrivateStudyRoomAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, count } = await getBookingsByDateAction(
        selectedDate,
        page,
        limit,
      );
      setBookings(data);
      setCount(count);
      setLoading(false);
    };

    fetchBookings();
  }, [selectedDate, page]);

  const cancelBooking = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

    await cancelBookingAction(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.profiles.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.profiles.student_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.attendees.some((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
        <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Gestión de Sala de Estudio
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Monitorea y administra las reservas de la sala.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-transparent outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por estudiante o asistente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className={`group bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-all ${
              booking.status === "cancelled" ? "opacity-60 grayscale-[0.5]" : ""
            }`}
          >
            <div
              className={`h-2 w-full ${
                booking.status === "cancelled" ? "bg-red-500" : "bg-amber-500"
              }`}
            />

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 dark:text-white">
                      {booking.profiles.username}
                    </p>
                    <p className="text-xs text-neutral-500">Responsable</p>
                  </div>
                </div>

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Cancelar Reserva"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 py-3 border-y border-neutral-50 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Clock size={16} className="text-amber-600" />
                  {booking.start_time.slice(0, 5)} -{" "}
                  {booking.end_time.slice(0, 5)}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Users size={16} className="text-amber-600" />
                  {booking.attendees.length} Asistentes
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Asistentes
                </p>

                <div className="space-y-1">
                  {booking.attendees.map((attendee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300 truncate max-w-37.5">
                        {attendee.name}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        {attendee.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {booking.status === "cancelled" && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-widest">
                    Cancelado
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Calendar size={32} />
            </div>

            <div className="space-y-1">
              <p className="text-xl font-bold text-neutral-800 dark:text-white">
                No hay reservas
              </p>
              <p className="text-neutral-500">
                No se encontraron reservas para este día o con esos criterios.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {count > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <p className="text-sm text-neutral-500">
            Mostrando <span className="font-medium text-neutral-800 dark:text-white">{filteredBookings.length}</span> de <span className="font-medium text-neutral-800 dark:text-white">{count}</span> reservas
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
      )}
    </div>
  );
}
