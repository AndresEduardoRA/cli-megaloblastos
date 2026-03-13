"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { Shirt, BookOpen, Calendar, Clock } from "lucide-react";
import { UserProfile } from "@/types/user-profile";
import { createClient } from "@/utils/supabase/client";

type Rental = {
  id: string;
  gown_type: string;
  status: "pending" | "approved" | "returned" | "rejected";
  created_at: string;
};

type Booking = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled";
};

type DashboardStats = {
  rentals: Rental[];
  bookings: Booking[];
  usersCount?: number;
  earnings?: number;
  pendingRentals?: number;
  todayBookings?: number;
};

export default function PrivateDashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    rentals: [],
    bookings: [],
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData.role !== "student") {
        router.push("/materials");
        return;
      }

      setProfile(profileData);

      if (profileData.role === "student") {
        // Fetch student specific stats
        const { data: rentals } = await supabase
          .from("rentals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const { data: bookings } = await supabase
          .from("study_room_bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("booking_date", { ascending: false });

        setStats({
          rentals: rentals ?? [],
          bookings: bookings ?? [],
        });
      } else {
        // Fetch admin specific stats
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { data: allRentals } = await supabase
          .from("rentals")
          .select("status");

        const { count: todayBookings } = await supabase
          .from("study_room_bookings")
          .select("*", { count: "exact", head: true })
          .eq("booking_date", new Date().toISOString().split("T")[0])
          .eq("status", "confirmed");

        const earnings =
          (allRentals?.filter(
            (r) => r.status === "approved" || r.status === "returned",
          ).length || 0) * 5;
        const pendingRentals =
          allRentals?.filter((r) => r.status === "pending").length || 0;

        setStats({
          rentals: [],
          bookings: [],
          usersCount: usersCount ?? 0,
          earnings,
          pendingRentals,
          todayBookings: todayBookings ?? 0,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
            ></div>
          ))}
        </div>
      </div>
    );

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
          Bienvenido, {profile?.username}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Panel de control para{" "}
          {profile?.role === "super_admin"
            ? "Super Administrador"
            : profile?.role === "admin"
              ? "Administrador"
              : "Estudiante"}
          .
        </p>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Usuarios" value={stats?.usersCount} />
          <StatCard
            label="Ganancias Totales"
            value={`${stats?.earnings} Bs.`}
          />
          <StatCard label="Batas Pendientes" value={stats?.pendingRentals} />
          <StatCard label="Reservas Hoy" value={stats?.todayBookings} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student: My Rentals */}
          <div className="space-y-4">
            <h2 className="text-xl text-neutral-800 dark:text-neutral-50 font-bold flex items-center gap-2">
              <Shirt className="text-amber-600" /> Mis Alquileres de Batas
            </h2>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {stats.rentals?.length > 0 ? (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {stats.rentals.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-neutral-800 dark:text-neutral-200">
                          Bata {r.gown_type}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-neutral-500">
                  No tienes alquileres registrados.
                </p>
              )}
            </div>
          </div>

          {/* Student: My Bookings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="text-amber-600" /> Mis Reservas de Sala
            </h2>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {stats.bookings?.length > 0 ? (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {stats.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800 dark:text-neutral-200">
                            {new Date(b.booking_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Clock size={12} /> {b.start_time.slice(0, 5)} -{" "}
                            {b.end_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {b.status === "confirmed" ? "Confirmada" : "Cancelada"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-neutral-500">
                  No tienes reservas registradas.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number | undefined;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-neutral-800 dark:text-white mt-1">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    returned: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${styles[status]}`}
    >
      {status === "pending"
        ? "Pendiente"
        : status === "approved"
          ? "Aprobado"
          : status === "returned"
            ? "Devuelto"
            : "Rechazado"}
    </span>
  );
}
