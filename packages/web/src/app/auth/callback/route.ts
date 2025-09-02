import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

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
        set(name: string, value: string, options: Parameters<typeof cookieStore.set>[0]) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: Parameters<typeof cookieStore.set>[0]) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = url.searchParams.get("next") ?? "/dashboard";
  if (!user) {
    return NextResponse.redirect(new URL("/signin", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
