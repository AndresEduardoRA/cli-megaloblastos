"use server";

import {
  getMaterials,
  deleteMaterial,
  createMaterial,
  updateMaterial,
  searchMaterials,
} from "@/services/materials";
import { GetMaterialsParams } from "@/types/material";

export async function getMaterialsAction(params: GetMaterialsParams) {
  return await getMaterials(params);
}

export async function deleteMaterialAction(id: string) {
  return await deleteMaterial(id);
}

export async function saveMaterialAction(id: string | null, data: any) {
  if (id) {
    return await updateMaterial(id, data);
  }

  return await createMaterial(data);
}

export async function searchMaterialsAction(query: string) {
  return await searchMaterials(query);
}
