import { createClient } from "@/utils/supabase/server";

export interface Rental {
  id: string;
  user_id: string;
  gown_type: "quirurgica" | "clinica";
  status: "pending" | "approved" | "rejected" | "returned";
  expected_return_date: string;
  created_at: string;
  profiles: {
    username: string;
    student_code: string;
    phone: string;
  };
}

export async function getAllRentals(
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Rental[]; count: number }> {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("rentals")
    .select("*, profiles(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return { data: data ?? [], count: count ?? 0 };
}

export async function getUserActiveRentals(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rentals")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["pending", "approved"]);

  if (error) throw error;

  return data ?? [];
}

export async function createRental(rental: {
  user_id: string;
  gown_type: "quirurgica" | "clinica";
  expected_return_date: string;
  status: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("rentals").insert(rental);

  if (error) throw error;
}

export async function updateRentalStatus(
  id: string,
  status: Rental["status"],
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rentals")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}
