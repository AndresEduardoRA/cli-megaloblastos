import { defineMiddleware } from "astro:middleware";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Database } from "./types/database.types";

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, redirect, request, locals } = context;

  const supabase = createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "").map(c => ({
            name: c.name,
            value: c.value ?? ""
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set user for use in pages
  locals.user = user;

  const url = new URL(request.url);
  const isProtectedPath =
    url.pathname.startsWith("/servicios-cem") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/profile");

  if (!isProtectedPath) {
    return next();
  }

  if (!user) {
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/profile")) {
      return redirect("/auth/login");
    }
    // For /servicios-cem, we allow access without session, 
    // but the page itself will handle showing "Register/Login" message.
    return next();
  }

  // Check Admin/SuperAdmin Role for /admin/*
  if (url.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as any)?.role;
    if (!profile || (role !== "admin" && role !== "super_admin")) {
      return redirect("/");
    }
  }

  return next();
});
