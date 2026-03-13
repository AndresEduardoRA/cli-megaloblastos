"use client";

import { useEffect, useState } from "react";
import {
  getProfileAction,
  updateProfileAction,
  getCurrentUserAction,
} from "@/actions/profiles";
import { type User } from "@supabase/supabase-js";
import { Save, User as UserIcon, Phone, CreditCard, Hash } from "lucide-react";

export default function PrivateSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({
    username: "",
    student_code: "",
    phone: "",
    carnet_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = await getCurrentUserAction();
      setUser(currentUser);
      if (currentUser) {
        try {
          const data = await getProfileAction(currentUser.id);
          if (data) {
            setProfile({
              username: data.username || "",
              student_code: data.student_code || "",
              phone: data.phone || "",
              carnet_number: data.carnet_number || "",
            });
          }
        } catch {
          // profile may not exist yet
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfileAction(user!.id, {
        ...profile,
      });
      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });
    } catch (e) {
      if (e instanceof Error)
        setMessage({
          type: "error",
          text: e.message || "Error al actualizar.",
        });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
        <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
          Ajustes
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Gestiona tu información personal.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Información del Perfil
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nombre completo
            </label>
            <div className="relative">
              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="w-full pl-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Hash size={14} /> Código de Estudiante
              </label>
              <input
                type="text"
                value={profile.student_code}
                onChange={(e) =>
                  setProfile({ ...profile, student_code: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <Phone size={14} /> Teléfono
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <CreditCard size={14} /> Número de Carnet (CI)
            </label>
            <input
              type="text"
              value={profile.carnet_number}
              onChange={(e) =>
                setProfile({ ...profile, carnet_number: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {message.text && (
              <p
                className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {message.text}
              </p>
            )}
            <button
              disabled={saving}
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 ml-auto"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={20} />
              )}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
