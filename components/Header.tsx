"use client";

import { Menu, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import SearchModal from "./SearchModal";

interface HeaderProps {
  onToggleSidebar: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({
  onToggleSidebar,
  user,
  onLogin,
  onLogout,
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 sticky top-0 z-40 transition-colors">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Middle: Search Bar */}
      <div className="flex-1 w-full max-w-xl mx-4">
        <SearchModal />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    user.email?.[0].toUpperCase()
                  )}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer:">
                  <Link href="/dashboard">Panel de control</Link>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Iniciar con Google</span>
          </button>
        )}
      </div>
    </header>
  );
}
