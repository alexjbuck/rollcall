import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
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

