"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAvailableSlotsAction,
  getUserActiveBookingsAction,
  createBookingAction,
} from "@/actions/study-room";
import { UserProfile } from "@/types/user-profile";
import { Clock, Users, Calendar, AlertCircle, CheckCircle2, X } from "lucide-react";

export default function StudyRoomBooking({
  user,
}: {
  user?: UserProfile | null;
}) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [attendees, setAttendees] = useState([{ name: "", code: "" }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [disableBooking, setDisableBooking] = useState(false);
  const [activeBookingMessage, setActiveBookingMessage] = useState("");

  // Generate slots
  const generateSlots = () => {
    const slots: string[] = [];
    let startTime = 8 * 60;
    const endTime = 20 * 60;
    const interval = 90;

    while (startTime + interval <= endTime) {
      const startH = Math.floor(startTime / 60);
      const startM = startTime % 60;

      const endTotal = startTime + interval;
      const endH = Math.floor(endTotal / 60);
      const endM = endTotal % 60;

      const format = (h: number, m: number) =>
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

      slots.push(`${format(startH, startM)} - ${format(endH, endM)}`);
      startTime += interval;
    }

    return slots;
  };

  // Check availability
  const checkAvailability = useCallback(async () => {
    setIsLoading(true);

    try {
      const allSlots = generateSlots();
      const today = new Date().toISOString().split("T")[0];

      const bookings = await getAvailableSlotsAction(today);

      const takenStarts = bookings.map((b) => b.start_time.slice(0, 5));

      setAvailableSlots(
        allSlots.filter((slot) => {
          const start = slot.split(" - ")[0];
          return !takenStarts.includes(start);
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check active booking
  const checkActiveBooking = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const data = await getUserActiveBookingsAction(user.id, today);

    if (data && data.length > 0) {
      const booking = data[0];
      const date = new Date(booking.booking_date).toLocaleDateString();
      const start = booking.start_time.slice(0, 5);
      const end = booking.end_time.slice(0, 5);

      setDisableBooking(true);
      setActiveBookingMessage(
        `Ya tienes una reserva vigente para el ${date} de ${start} a ${end}.`,
      );
    } else {
      setDisableBooking(false);
      setActiveBookingMessage("");
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      await checkAvailability();
      await checkActiveBooking();
    };

    init();
  }, [user, checkAvailability, checkActiveBooking]);

  const openModal = (slot: string) => {
    if (!user) {
      alert("Debes iniciar sesión para reservar.");
      return;
    }

    setSelectedSlot(slot);

    setAttendees([
      {
        name: user.username,
        code: user.student_code,
      },
    ]);

    setAttendeeCount(1);
    setIsModalOpen(true);
  };

  const updateAttendeesCount = (count: number) => {
    setAttendeeCount(count);

    setAttendees((prev) => {
      const newList = [...prev];

      if (count > newList.length) {
        for (let i = newList.length; i < count; i++) {
          newList.push({ name: "", code: "" });
        }
      } else {
        newList.splice(count);
      }

      return newList;
    });
  };

  const submitBooking = async () => {
    if (!selectedSlot || !user) return;

    const invalid = attendees.filter((a) => !a.name.trim() || !a.code.trim());

    if (invalid.length > 0) {
      setMessage("Error: completa los datos de todos los asistentes.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const [startStr, endStr] = selectedSlot.split(" - ");

    const startTime = `${startStr}:00`;
    const endTime = `${endStr}:00`;
    const today = new Date().toISOString().split("T")[0];

    try {
      await createBookingAction({
        user_id: user.id,
        booking_date: today,
        start_time: startTime,
        end_time: endTime,
        attendees,
        status: "confirmed",
      });

      setIsModalOpen(false);
      await checkAvailability();
      await checkActiveBooking();
    } catch (e) {
      if (e instanceof Error) setMessage("Error al reservar: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {disableBooking && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
              Reserva Activa
            </h3>
            <p className="text-amber-700 dark:text-amber-300">
              {activeBookingMessage}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-24 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${
            disableBooking ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {availableSlots.map((slot) => {
            const [start, end] = slot.split(" - ");
            return (
              <button
                key={slot}
                onClick={() => openModal(slot)}
                className="group p-5 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl text-left transition-all hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 active:scale-95"
              >
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 mb-3 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                  <Clock size={20} />
                </div>
                <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Horario
                </p>
                <p className="text-lg font-bold text-neutral-800 dark:text-white">
                  {start} - {end}
                </p>
              </button>
            );
          })}

          {availableSlots.length === 0 && (
            <div className="col-span-full py-20 text-center bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400 mb-4">
                <Calendar size={40} />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
                No hay horarios disponibles
              </h3>
              <p className="text-neutral-500 mt-2">
                Todos los turnos para hoy ya han sido reservados.
              </p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl w-full max-w-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">
                  Confirmar Reserva
                </h3>
                <p className="text-neutral-500 flex items-center gap-1.5 mt-1">
                  <Clock size={16} /> Turno: {selectedSlot}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <X size={24} className="text-neutral-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-amber-600" /> Número de Asistentes
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateAttendeesCount(n)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${
                        attendeeCount === n
                          ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20"
                          : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-amber-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {attendees.map((attendee, i) => (
                  <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-3">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                      Asistente {i + 1} {i === 0 && "(Tú)"}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        placeholder="Nombre completo"
                        value={attendee.name}
                        disabled={i === 0}
                        onChange={(e) => {
                          const updated = [...attendees];
                          updated[i].name = e.target.value;
                          setAttendees(updated);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-70"
                      />
                      <input
                        placeholder="Código de estudiante"
                        value={attendee.code}
                        disabled={i === 0}
                        onChange={(e) => {
                          const updated = [...attendees];
                          updated[i].code = e.target.value;
                          setAttendees(updated);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-70"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {message && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                  <AlertCircle size={18} />
                  {message}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitBooking}
                  disabled={isLoading}
                  className="flex-2 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-xl shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Confirmar Reserva
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
