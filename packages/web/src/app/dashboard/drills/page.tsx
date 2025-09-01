import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DrillsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Drill Events</h1>
      <p className="text-sm text-gray-600">List of drills will appear here.</p>
    </div>
  );
}

