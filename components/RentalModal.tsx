"use client";

import { useState } from "react";
import {
  getUserActiveRentalsAction,
  createRentalAction,
} from "@/actions/rentals";

interface UserProfile {
  id: string;
  username: string;
  student_code: string;
  phone: string;
  carnet_number: string;
  email?: string;
  avatar_url?: string;
}

export default function RentalModal({ user }: { user?: UserProfile | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGownType, setSelectedGownType] = useState<
    "quirurgica" | "clinica" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [termAccepted, setTermAccepted] = useState(false);

  const rentalInfo = {
    price: "5 Bs.",
    deliveryDate: "Inmediata",
    returnDate: "24 horas",
    extraDay: "+5 Bs.",
  };

  const openModal = async (type: "quirurgica" | "clinica") => {
    if (!user) {
      alert("Debes iniciar sesión para realizar un pedido.");
      return;
    }

    setIsLoading(true);

    try {
      const activeRentals = await getUserActiveRentalsAction(user.id);

      if (activeRentals && activeRentals.length > 0) {
        alert(
          "No puedes solicitar otra bata porque ya tienes una solicitud activa o aprobada.",
        );
        setIsLoading(false);
        return;
      }

      setSelectedGownType(type);
      setIsModalOpen(true);
    } catch (e) {
      if (e instanceof Error) alert("Error al verificar estado: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGownType(null);
    setMessage("");
  };

  const submitRequest = async () => {
    if (!user || !selectedGownType) return;

    if (!termAccepted) {
      setMessage("Debes confirmar que los datos son correctos.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const expectedReturn = new Date();
    expectedReturn.setDate(expectedReturn.getDate() + 1);

    try {
      const activeRentals = await getUserActiveRentalsAction(user.id);

      if (activeRentals && activeRentals.length > 0) {
        setMessage("Ya tienes una solicitud activa o aprobada.");
        setIsLoading(false);
        return;
      }

      await createRentalAction({
        user_id: user.id,
        gown_type: selectedGownType,
        expected_return_date: expectedReturn.toISOString(),
        status: "pending",
      });

      setMessage("Solicitud enviada correctamente.");
      closeModal();
    } catch (e) {
      if (e instanceof Error)
        setMessage("Error al enviar solicitud: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <div
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group cursor-pointer border border-neutral-200 dark:border-neutral-700"
          onClick={() => openModal("quirurgica")}
        >
          <div className="h-64 overflow-hidden bg-gray-200 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bata-quirurgica.jpg"
              alt="Bata Quirurgica"
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              Bata Quirúrgica
            </h3>

            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Para anfiteatro o quirofano.
            </p>
          </div>
        </div>

        <div
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group cursor-pointer border border-neutral-200 dark:border-neutral-700"
          onClick={() => openModal("clinica")}
        >
          <div className="h-64 overflow-hidden bg-gray-200 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/bata-clinica.jpg"
              alt="Bata Clinica"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              Bata Clínica
            </h3>

            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Para laboratorio.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-2xl font-bold">
                Solicitud de Alquiler:{" "}
                {selectedGownType === "quirurgica"
                  ? "Bata Quirúrgica"
                  : "Bata Clínica"}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Precio:</strong> {rentalInfo.price}
                  </li>
                  <li>
                    <strong>Fecha Entrega:</strong> {rentalInfo.deliveryDate}
                  </li>
                  <li>
                    <strong>Devolución:</strong> {rentalInfo.returnDate}
                  </li>
                  <li>
                    <strong>Cada día extra:</strong> {rentalInfo.extraDay}
                  </li>
                </ul>
              </div>

              {user && (
                <div>
                  <p className="font-bold">{user.username}</p>
                  <p className="text-sm">{user.student_code}</p>
                </div>
              )}

              {message && (
                <div className="p-3 rounded text-sm bg-green-100 text-green-700">
                  {message}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={termAccepted}
                  onChange={(e) => setTermAccepted(e.target.checked)}
                />

                <label className="text-sm">
                  Confirmo que los datos son correctos.
                </label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={closeModal}>Cancelar</button>

              <button
                onClick={submitRequest}
                disabled={isLoading}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg"
              >
                {isLoading ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
