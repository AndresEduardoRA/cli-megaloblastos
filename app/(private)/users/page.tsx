"use client";

import { useEffect, useState } from "react";
import { getAllProfilesAction, getCurrentUserAction, updateProfileAction } from "@/actions/profiles";
import {
  Search,
  User as UserIcon,
  Lock,
  Unlock,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { UserProfile } from "@/types/user-profile";
import { useRouter } from "next/navigation";

export default function PrivateUsersPage() {
    const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

 useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getCurrentUserAction();
      if (currentUser?.role !== "super_admin") {
        router.replace("/"); // redirige fuera si no es super_admin
        return;
      }

      const profiles = await getAllProfilesAction();
      setUsers(profiles);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleToggleBlock = async (user: UserProfile) => {
    await updateProfileAction(user.id, { is_blocked: !user.is_blocked });
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u,
      ),
    );
  };

  const handleRoleChange = async (
    userId: string,
    newRole: UserProfile["role"],
  ) => {
    await updateProfileAction(userId, { role: newRole });
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const startEditing = (user: UserProfile) => {
    setEditingId(user.id);
    setEditForm(user);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    await updateProfileAction(editingId, editForm);
    setUsers(
      users.map((u) =>
        u.id === editingId ? ({ ...u, ...editForm } as UserProfile) : u,
      ),
    );
    setEditingId(null);
  };

  const filteredUsers = users.filter((user) =>
    `${user.username} ${user.student_code} ${user.carnet_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Administra roles, bloqueos y datos de los estudiantes.
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, código o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-80 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-sm uppercase font-semibold">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Código / CI</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Usuario */}
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <input
                        className="w-full px-2 py-1 text-sm border rounded bg-transparent"
                        value={editForm.username ?? ""}
                        placeholder="nombre completo"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            username: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                          <UserIcon size={20} />
                        </div>

                        <div>
                          <p className="font-semibold text-neutral-800 dark:text-white">
                            {user.username}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Código */}
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <div className="space-y-2">
                        <input
                          className="w-full px-2 py-1 text-sm border rounded bg-transparent"
                          value={editForm.student_code ?? ""}
                          placeholder="código de estudiante"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              student_code: e.target.value,
                            })
                          }
                        />

                        <input
                          className="w-full px-2 py-1 text-sm border rounded bg-transparent"
                          value={editForm.carnet_number ?? ""}
                          placeholder="CI"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              carnet_number: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p className="font-medium">{user.student_code}</p>
                        <p className="text-neutral-500">
                          CI: {user.carnet_number}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Teléfono */}
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <input
                        className="w-full px-2 py-1 text-sm border rounded bg-transparent"
                        value={editForm.phone ?? ""}
                        placeholder="teléfono"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {user.phone}
                      </p>
                    )}
                  </td>

                  {/* Rol */}
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as UserProfile["role"],
                        )
                      }
                      className="text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2 py-1"
                    >
                      <option value="student">Estudiante</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_blocked
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {user.is_blocked ? (
                        <Lock size={12} />
                      ) : (
                        <Unlock size={12} />
                      )}
                      {user.is_blocked ? "Bloqueado" : "Activo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Check size={18} />
                          </button>

                          <button
                            onClick={cancelEditing}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(user)}
                            className="p-2 hover:bg-neutral-100 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`p-2 rounded-lg ${
                              user.is_blocked
                                ? "text-green-600 hover:bg-green-50"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {user.is_blocked ? (
                              <Unlock size={18} />
                            ) : (
                              <Lock size={18} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
