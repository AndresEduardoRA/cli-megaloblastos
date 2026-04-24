import { createClient } from "@/utils/supabase/server";

export async function getSubjectSupportMaterials(params: {
  year: string;
  subject: string;
  partial: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select("id, title, type, url")
    .eq("year", params.year)
    .eq("subject", params.subject)
    .eq("partial", params.partial);

  if (error) throw error;

  return data ?? [];
}

export async function getSubjectSupportMaterialsByTeacher(params: {
  year: string;
  subject: string;
  teacher: string;
  partial: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select("id, title, type, url")
    .eq("year", params.year)
    .eq("subject", params.subject)
    .eq("teacher", params.teacher)
    .eq("partial", params.partial);

  if (error) throw error;

  return data ?? [];
}
