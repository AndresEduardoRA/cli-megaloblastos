import { GetMaterialsParams } from "@/types/material";
import { createClient } from "@/utils/supabase/server";

export async function getMaterials(params: GetMaterialsParams) {
  const supabase = await createClient();

  let query = supabase.from("materials").select("*", { count: "exact" });

  if (params.search) query = query.ilike("title", `%${params.search}%`);
  if (params.type) query = query.eq("type", params.type);
  if (params.year) query = query.eq("year", params.year);
  if (params.subject) query = query.eq("subject", params.subject);

  const { data, count, error } = await query
    .range((params.page - 1) * params.limit, params.page * params.limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return { data: data ?? [], count: count ?? 0 };
}

export async function createMaterial(data: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .insert(data);

  if (error) throw error;
}

export async function updateMaterial(id: string, data: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function searchMaterials(query: string, limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select("id,title,type,subject,url")
    .ilike("title", `%${query}%`)
    .limit(limit);

  if (error) throw error;

  return data ?? [];
}
