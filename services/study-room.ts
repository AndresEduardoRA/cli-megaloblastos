import { createClient } from "@/utils/supabase/server";

export interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled";
  attendees: { name: string; code: string }[];
  profiles: {
    username: string;
    student_code: string;
  };
}

export async function getBookingsByDate(
  date: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Booking[]; count: number }> {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("study_room_bookings")
    .select("*, profiles(*)", { count: "exact" })
    .eq("booking_date", date)
    .order("start_time", { ascending: true })
    .range(from, to);

  if (error) throw error;

  return { data: data ?? [], count: count ?? 0 };
}

export async function getAvailableSlotsByDate(date: string): Promise<{ start_time: string; end_time: string }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("study_room_bookings")
    .select("start_time,end_time")
    .eq("booking_date", date)
    .eq("status", "confirmed");

  if (error) throw error;

  return data ?? [];
}

export async function getUserActiveBookings(userId: string, fromDate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("study_room_bookings")
    .select("booking_date,start_time,end_time")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .gte("booking_date", fromDate);

  if (error) throw error;

  return data ?? [];
}

export async function createBooking(booking: {
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  attendees: { name: string; code: string }[];
  status: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("study_room_bookings").insert(booking);

  if (error) throw error;
}

export async function cancelBooking(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("study_room_bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) throw error;
}
