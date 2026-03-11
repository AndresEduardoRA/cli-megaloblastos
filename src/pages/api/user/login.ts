import { type APIRoute } from "astro";
import { res } from "@/utils";
import { getServerSupabase } from "@/utils/supabase";

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const supabase = getServerSupabase(context);
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password.trim()
    ) {
      return res("error", 400, "Correo o contraseña incorrectos");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session || !data.user) {
      return res("error", 400, "Correo o contraseña incorrectos");
    }

    return new Response(
      JSON.stringify({
        user: {
          email: data.user.email,
          username: data.user.user_metadata?.username,
        },
        token: data.session.access_token,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return res("error", 500, "Error al iniciar sesión");
  }
};
