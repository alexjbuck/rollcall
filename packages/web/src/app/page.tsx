import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold">RollCall</h1>
        <p className="text-gray-600">Decoupled, query-time drill attendance</p>
        {user ? (
          <Link className="underline" href="/dashboard">
            Go to dashboard
          </Link>
        ) : (
          <Link className="underline" href="/signin">
            Sign in with Google
          </Link>
        )}
      </div>
    </div>
  );
}
