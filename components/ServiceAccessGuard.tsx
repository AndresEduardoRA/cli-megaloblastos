"use client";

import React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getProfileAction } from "@/actions/profiles";
import LoginWithGoogleButton from "./LoginWithGoogleButton";
import CompleteProfileForm from "./CompleteProfileForm";
import { type User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/user-profile";

interface ServiceAccessGuardProps {
  children: React.ReactElement<{ user: UserProfile | null }>;
  serviceName: string;
}
export default function ServiceAccessGuard({
  children,
  serviceName,
}: ServiceAccessGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const data = await getProfileAction(userId);
      setProfile(data);
    } catch {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      setUser(user);

      if (user) {
        await fetchProfile(user.id);
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 p-8 rounded-2xl border text-center space-y-6">
        <h2 className="text-2xl font-bold">Inicia sesión para continuar</h2>

        <p>Necesitas una cuenta para acceder al servicio de {serviceName}.</p>

        <LoginWithGoogleButton className="w-full justify-center" />
      </div>
    );
  }

  const isProfileComplete =
    profile?.username &&
    profile?.student_code &&
    profile?.phone &&
    profile?.carnet_number;

  if (!isProfileComplete) {
    return (
      <CompleteProfileForm
        userId={user.id}
        onComplete={() => fetchProfile(user.id)}
      />
    );
  }

  if (!profile) return null;

  return React.cloneElement(children, { user: profile });
}
