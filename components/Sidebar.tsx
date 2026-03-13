"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: { label: string; href: string; icon: React.ReactNode }[];
}

export default function Sidebar({ isOpen, onClose, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile and desktop when open */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-800 z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 w-64 shadow-xl md:shadow-none"
            : "-translate-x-full md:translate-x-0 md:w-20 shadow-none"
        }`}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* Header/Logo */}
          <div className="flex items-center justify-between mb-4 px-2">
            <Link href="/" className="flex items-center gap-3 group py-6">
              <div className="transition-transform group-hover:scale-110">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/megaloblastos.png"
                  alt="Megaloblastos Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-bold text-xl tracking-tight transition-all duration-300 ${!isOpen && "md:hidden opacity-0"}`}
              >
                Megaloblastos
              </h2>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-4">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-100"
                  }`}
                >
                  <span
                    className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && "md:hidden opacity-0"}`}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed mode */}
                  {!isOpen && (
                    <div className="hidden md:group-hover:block absolute left-full ml-4 px-3 py-1 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer area */}
          <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div
              className={`transition-all duration-300 ${!isOpen && "md:hidden opacity-0"}`}
            >
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider px-2">
                © 2026 Megaloblastos
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
