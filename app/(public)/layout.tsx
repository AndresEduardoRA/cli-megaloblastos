"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Home, Info, Users, ClipboardList, Briefcase } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { createClient } from "@/utils/supabase/client";
import { signInWithGoogle, signOut } from "@/services/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { type User } from "@supabase/supabase-js";

const publicMenuItems = [
  { label: "Inicio", href: "/", icon: <Home size={20} /> },
  {
    label: "Plancha CEM",
    href: "/cem-iron",
    icon: <ClipboardList size={20} />,
  },
  { label: "Delegados ICU", href: "/icu-delegates", icon: <Users size={20} /> },
  {
    label: "Servicios CEM",
    href: "/cem-services",
    icon: <Briefcase size={20} />,
  },
  { label: "Acerca de", href: "/about", icon: <Info size={20} /> },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, toggle, close } = useSidebar();
  const [user, setUser] = useState<null | User>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900/50 transition-colors duration-300">
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={isOpen} onClose={close} items={publicMenuItems} />

        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${isOpen ? "md:ml-64" : "md:ml-20"}`}
        >
          <Header
            onToggleSidebar={toggle}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
          <main className="p-6 md:p-10 overflow-y-auto">
            <div key={pathname} className="max-w-7xl mx-auto page-transition pb-20">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
