/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
import type { User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      user: User;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly DATABASE_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
