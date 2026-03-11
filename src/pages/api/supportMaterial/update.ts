import { res } from "@/utils";
import { verifyToken } from "@/utils/auth";
import type { APIRoute } from "astro";
import { supabase } from "@/utils/supabase";

export const PUT: APIRoute = async ({ request }) => {
  try {
    // Traer y desestructurar datos
    const { id, type, url, year, subject, teacher, partial, token } =
      await request.json();

    // Validar datos
    if (!id || typeof id !== "string") {
      return res("error", 400, "ID no proporcionado o inválido");
    }
    if (
      typeof type !== "string" ||
      typeof url !== "string" ||
      typeof year !== "string" ||
      typeof subject !== "string" ||
      typeof teacher !== "string" ||
      typeof partial !== "string"
    ) {
      return res("error", 400, "Datos incorrectos");
    }

    try {
      await verifyToken(token);
    } catch (e: any) {
      return res("error", 403, e.message);
    }

    const { data, error } = await supabase
      .from("materials")
      // @ts-ignore
      .update({ type, url, year, submit: subject, teacher, partial })
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("DB error:", error);
      return res("error", 500, "No se pudo actualizar el material");
    }
    if (!data || !data.length) {
      return res("error", 404, "Material de apoyo no encontrado");
    }

    return new Response(JSON.stringify({ message: "Actualización exitosa" }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error en el servidor: ", err);
    return res("error", 500, "Error interno del servidor");
  }
};
