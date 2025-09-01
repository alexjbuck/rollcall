import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateDrillForm } from "./ui";

export default async function DrillsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id, role")
    .eq("id", user.id)
    .single();

  const { data: drills } = await supabase
    .from("drill_events")
    .select("id, title, start_date, end_date, location")
    .order("start_date", { ascending: true });

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Drill Events</h1>
        <p className="text-sm text-gray-600">
          Create and manage organization drill events.
        </p>
      </div>

      {isAdmin && <CreateDrillForm />}

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Upcoming</h2>
        <ul className="divide-y">
          {(drills ?? []).map((d) => (
            <li key={d.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(d.start_date as unknown as string).toLocaleDateString()} -
                  {" "}
                  {new Date(d.end_date as unknown as string).toLocaleDateString()}
                  {d.location ? ` • ${d.location}` : ""}
                </div>
              </div>
            </li>
          ))}
          {(!drills || drills.length === 0) && (
            <li className="py-6 text-sm text-gray-600">No drills yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
