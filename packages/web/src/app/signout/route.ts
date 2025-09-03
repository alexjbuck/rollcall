import { createServerClient } from "@supabase/ssr";
import type { SerializeOptions } from "cookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getEnv } from "@/env/server";

export async function POST() {
  const cookieStore = await cookies();
  const env = getEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(
          cookies: Array<{
            name: string;
            value: string;
            options: Partial<SerializeOptions>;
          }>,
        ) {
          cookies.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    },
  );
  await supabase.auth.signOut();
  const base = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/signin", base));
}
