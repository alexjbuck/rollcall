import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/dashboard";

  // If no session yet, let the client-side recover
  if (!user) {
    return NextResponse.redirect(new URL("/signin", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

