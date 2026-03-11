import { createBrowserClient, createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Database } from "../types/database.types";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Supabase env missing");
}

// Browser client for client-side components (Vue)
// On server-side (imported in Astro pages), we provide dummy cookie handlers to avoid errors
export const supabase = createBrowserClient<Database>(url, key, {
  cookies: typeof document === "undefined"
    ? {
        getAll() { return [] },
        setAll() {},
      }
    : undefined,
});

// Helper for server-side clients in Astro pages/API routes
export const getServerSupabase = (context: { cookies: any, request: Request }) => {
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.request.headers.get("Cookie") ?? "").map(c => ({
          name: c.name,
          value: c.value ?? ""
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          context.cookies.set(name, value, options)
        );
      },
    },
  });
};
