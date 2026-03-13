import { createClient } from "@/utils/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentSession() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}
