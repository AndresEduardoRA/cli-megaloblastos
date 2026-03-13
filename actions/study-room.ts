"use server";

import {
  getAvailableSlotsByDate,
  getUserActiveBookings,
  createBooking,
  cancelBooking,
  getBookingsByDate,
} from "@/services/study-room";

export async function getBookingsByDateAction(
  date: string,
  page: number = 1,
  limit: number = 10,
) {
  return await getBookingsByDate(date, page, limit);
}

export async function getAvailableSlotsAction(date: string) {
  return await getAvailableSlotsByDate(date);
}

export async function getUserActiveBookingsAction(userId: string, fromDate: string) {
  return await getUserActiveBookings(userId, fromDate);
}

export async function createBookingAction(booking: {
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  attendees: { name: string; code: string }[];
  status: string;
}) {
  return await createBooking(booking);
}

export async function cancelBookingAction(id: string) {
  return await cancelBooking(id);
}
