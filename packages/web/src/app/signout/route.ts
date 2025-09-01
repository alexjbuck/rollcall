import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.signOut();
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.redirect(new URL("/signin", base));
}

