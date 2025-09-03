import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Attendance Reports</h1>
      <p className="text-sm text-gray-600">
        Analytics and exports will go here.
      </p>
    </div>
  );
}
