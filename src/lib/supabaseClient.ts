// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client, used only for uploading photos to Storage.
// Uses the public anon key, which is safe to expose in the browser.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
