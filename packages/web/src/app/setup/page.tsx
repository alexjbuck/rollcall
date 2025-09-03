"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a full flow, we'd check invitations and existing profile/org
  }, []);

  const onCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("Not authenticated");

      const { data, error: insertErr } = await supabase
        .from("organizations")
        .insert({ name: orgName, created_by: userRes.user.id })
        .select("id")
        .single();
      if (insertErr) throw insertErr;

      const orgId = data.id as string;
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ organization_id: orgId, role: "admin" })
        .eq("id", userRes.user.id);
      if (profileErr) throw profileErr;

      router.push("/dashboard");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your organization</h1>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Organization name"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
      />
      <button
        onClick={onCreate}
        disabled={!orgName || loading}
        className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        type="button"
      >
        {loading ? "Creating..." : "Create organization"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
