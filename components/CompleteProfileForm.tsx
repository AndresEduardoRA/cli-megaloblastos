"use client";

import { useState } from "react";
import { upsertProfileAction } from "@/actions/profiles";
import { useRouter } from "next/navigation";

interface CompleteProfileFormProps {
  userId: string;
  onComplete: () => void;
}

export default function CompleteProfileForm({
  userId,
  onComplete,
}: CompleteProfileFormProps) {
  const [userName, setUserName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [phone, setPhone] = useState("");
  const [carnetNumber, setCarnetNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await upsertProfileAction({
        id: userId,
        username: userName,
        student_code: studentCode,
        phone: phone,
        carnet_number: carnetNumber,
        role: "student",
        is_blocked: false,
      });

      onComplete();
      router.refresh();
    } catch (e) {
      if (e instanceof Error)
        setError(e.message || "Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2 text-center">
        Completa tu perfil
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center text-sm">
        Necesitamos algunos datos adicionales para que puedas acceder a nuestros
        servicios.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Nombre completo
          </label>
          <input
            required
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            placeholder="Ej. Juan"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Código de Estudiante
          </label>
          <input
            required
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            placeholder="Ej. 219000000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Teléfono / WhatsApp
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              placeholder="Ej. 70000000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nro. Carnet (CI)
            </label>
            <input
              required
              type="text"
              value={carnetNumber}
              onChange={(e) => setCarnetNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              placeholder="Ej. 1234567"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
            {error}
          </p>
        )}

        <button
          disabled={isLoading}
          type="submit"
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Guardando..." : "Guardar y Continuar"}
        </button>
      </form>
    </div>
  );
}
