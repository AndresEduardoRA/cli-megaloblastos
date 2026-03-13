"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/hooks/useSidebar";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/services/auth-client";
import { User as TypeUser } from "@supabase/supabase-js";
import { UserProfile } from "@/types/user-profile";
import {
  BookOpen,
  Boxes,
  LayoutDashboard,
  Settings,
  Shirt,
  Users,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["student"],
  },
  {
    label: "Materiales",
    href: "/materials",
    icon: <Boxes size={20} />,
    roles: ["admin", "super_admin"],
  },
  {
    label: "Alquiler de batas",
    href: "/robe-rental",
    icon: <Shirt size={20} />,
    roles: ["admin", "super_admin"],
  },
  {
    label: "Sala de estudio",
    href: "/study-room",
    icon: <BookOpen size={20} />,
    roles: ["admin", "super_admin"],
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: <Users size={20} />,
    roles: ["super_admin"],
  },
  {
    label: "Ajustes",
    href: "/settings",
    icon: <Settings size={20} />,
    roles: ["student", "admin", "super_admin"],
  },
];

export default function PrivateLayoutClient({
  children,
  user,
  profile,
}: {
  children: React.ReactNode;
  user: TypeUser;
  profile: UserProfile;
}) {
  const { isOpen, toggle, close } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(profile.role),
  );

  return (
    <div className="min-h-screen flex flex-col bg-white  dark:bg-neutral-900/50">
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={isOpen} onClose={close} items={filteredMenuItems} />

        <div
          className={`flex-1 transition-all duration-300 ${
            isOpen ? "md:ml-64" : "md:ml-20"
          }`}
        >
          <Header
            onToggleSidebar={toggle}
            user={user}
            onLogin={() => {}}
            onLogout={handleLogout}
          />

          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div
              key={pathname}
              className="max-w-7xl mx-auto pb-20 page-transition"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
