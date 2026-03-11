import type { APIRoute } from "astro";
import { getServerSupabase } from "@/utils/supabase";

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const supabase = getServerSupabase(context);
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      student_code, 
      carnet_number, 
      phone 
    } = body;

    // Server-side validation (Basic)
    if (!email || !password || !first_name || !last_name || !student_code || !carnet_number) {
      return new Response(JSON.stringify({ message: "Faltan datos obligatorios" }), { status: 400 });
    }

    // Check Uniqueness (Best Effort)
    // Note: This relies on "profiles" table being readable or having unique constraints that error out.
    // If RLS prevents reading, this check might be skipped, but we'll try.
    
    // Check Email (Auth handles this usually, but good to check)
    // Check Student Code
    const { count: codeCount, error: codeError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("student_code", student_code);

    if (!codeError && codeCount && codeCount > 0) {
       return new Response(JSON.stringify({ message: "El código de estudiante ya está registrado." }), { status: 400 });
    }

    // Check Carnet
    const { count: carnetCount, error: carnetError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("carnet_number", carnet_number);

     if (!carnetError && carnetCount && carnetCount > 0) {
       return new Response(JSON.stringify({ message: "El número de carnet ya está registrado." }), { status: 400 });
    }

    // Create User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          student_code,
          carnet_number,
          phone,
          role: "student" // Default role
        }
      }
    });

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 400 });
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return new Response(JSON.stringify({ message: "Este correo ya está registrado." }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Usuario creado exitosamente", user: data.user }), {
      status: 200,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ message: "Error interno del servidor: " + err.message }), { status: 500 });
  }
};
