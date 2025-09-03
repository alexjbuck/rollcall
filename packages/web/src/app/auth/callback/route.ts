import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

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
