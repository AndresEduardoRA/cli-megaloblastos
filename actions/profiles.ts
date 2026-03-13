"use server";

import {
  getProfile,
  upsertProfile,
  getAllProfiles,
  updateProfile,
} from "@/services/profiles";
import { getCurrentUser } from "@/services/auth";
import { UserProfile } from "@/types/user-profile";

export async function getCurrentUserAction() {
  return await getCurrentUser();
}

export async function getProfileAction(userId: string) {
  return await getProfile(userId);
}

export async function upsertProfileAction(profile: UserProfile) {
  return await upsertProfile(profile);
}

export async function getAllProfilesAction() {
  return await getAllProfiles();
}

export async function updateProfileAction(
  userId: string,
  data: Partial<UserProfile>,
) {
  return await updateProfile(userId, data);
}
