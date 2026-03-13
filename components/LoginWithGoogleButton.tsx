"use client";

import { signInWithGoogle } from "@/services/auth-client";
import { LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginWithGoogleButton({
  className = "",
}: {
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm font-medium ${className} disabled:opacity-50`}
    >
      <LogIn />
      <span>{isLoading ? "Cargando..." : "Iniciar con Google"}</span>
    </button>
  );
}
