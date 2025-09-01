"use client";

import { useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (signInError) throw signInError;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-semibold">Sign in to RollCall</h1>
        <button
          className="w-full rounded-md bg-black text-white py-2 px-4 disabled:opacity-50"
          disabled={loading}
          onClick={signInWithGoogle}
          type="button"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
