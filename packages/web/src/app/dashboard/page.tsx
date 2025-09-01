import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Your Availability</h1>
      <p className="text-sm text-gray-600">
        Calendar will go here. Mark any days you can attend.
      </p>
    </div>
  );
}
