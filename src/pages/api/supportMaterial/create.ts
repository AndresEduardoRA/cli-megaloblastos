import { res } from "@/utils";
import { verifyToken } from "@/utils/auth";
import type { APIRoute } from "astro";
import { uid } from "uid";
import { supabase } from "@/utils/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Traer y desestructurar datos
    const { type, url, year, subject, teacher, partial, token } =
      await request.json();
    // Validar datos
    if (
      typeof type !== "string" ||
      typeof url !== "string" ||
      typeof year !== "string" ||
      typeof subject !== "string" ||
      typeof teacher !== "string" ||
      typeof partial !== "string"
    ) {
      return res("error", 400, "Datos incorrectas");
    }

    try {
      await verifyToken(token);
    } catch (e: any) {
      return res("error", 403, e.message);
    }

    // @ts-ignore
    const { error } = await supabase.from("materials").insert([
      {
        id: uid(16),
        type,
        url,
        year,
        submit: subject,
        teacher,
        partial,
      },
    ]);
    if (error) {
      console.error("DB error:", error);
      return res("error", 500, "No se pudo crear el material");
    }

    return new Response(JSON.stringify({ message: "Éxito" }), { status: 200 });
  } catch (err) {
    console.error("Error en el servidor: ", err);
    return res("error", 500, "Error interno del servidor");
  }
};
