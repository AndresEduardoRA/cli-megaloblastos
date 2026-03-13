"use server";

import {
  getAllRentals,
  getUserActiveRentals,
  createRental,
  updateRentalStatus,
  Rental,
} from "@/services/rentals";

export async function getAllRentalsAction(page: number = 1, limit: number = 10) {
  return await getAllRentals(page, limit);
}

export async function getUserActiveRentalsAction(userId: string) {
  return await getUserActiveRentals(userId);
}

export async function createRentalAction(rental: {
  user_id: string;
  gown_type: "quirurgica" | "clinica";
  expected_return_date: string;
  status: string;
}) {
  return await createRental(rental);
}

export async function updateRentalStatusAction(
  id: string,
  status: Rental["status"],
) {
  return await updateRentalStatus(id, status);
}
