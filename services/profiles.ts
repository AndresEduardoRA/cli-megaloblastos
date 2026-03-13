import { UserProfile } from "@/types/user-profile";
import { createClient } from "@/utils/supabase/server";

export async function getProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

export async function upsertProfile(profile: UserProfile) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .upsert(profile);

  if (error) throw error;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function updateProfile(userId: string, data: Partial<UserProfile>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
}
