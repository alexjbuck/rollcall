import { createServerClient } from "@supabase/ssr";
import type { SerializeOptions } from "cookie";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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
