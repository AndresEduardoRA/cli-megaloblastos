import { supabase } from "./supabase";

export async function verifyToken(token: string) {
  if (!token) throw new Error("Token no proporcionado");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw new Error("Token no válido o expirado");
  return data.user;
}
