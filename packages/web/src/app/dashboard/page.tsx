import { redirect } from "next/navigation";
import { AvailabilityCalendar } from "@/components/availability/AvailabilityCalendar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Your Availability</h1>
        <p className="text-sm text-gray-600">
          Click days to mark when you can attend.
        </p>
      </div>
      <AvailabilityCalendar />
    </div>
  );
}
