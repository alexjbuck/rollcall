import { createBrowserClient } from "@supabase/ssr";
import { getEnv } from "@/env/client";

export function createClient() {
  console.log("start createClient");
  const env = getEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
}
