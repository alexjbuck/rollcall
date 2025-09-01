"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateDrillState = {
  error?: string | null;
  ok?: boolean;
};

export async function createDrill(
  _prevState: CreateDrillState,
  formData: FormData,
): Promise<CreateDrillState> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, organization_id, role")
      .eq("id", user.id)
      .single();
    if (profileErr) {
      return { error: profileErr.message };
    }
    if (!profile?.organization_id) {
      return { error: "No organization found. Complete setup first." };
    }
    if (profile.role !== "admin") {
      return { error: "Only admins can create drills." };
    }

    const title = String(formData.get("title") || "").trim();
    const description =
      String(formData.get("description") || "").trim() || null;
    const location = String(formData.get("location") || "").trim() || null;
    const startDateStr = String(formData.get("start_date") || "");
    const endDateStr = String(formData.get("end_date") || "");
    const isMandatory = formData.get("is_mandatory") === "on";
    const minDaysRaw = String(
      formData.get("minimum_days_required") || "",
    ).trim();
    const reminderDaysRaw = String(formData.get("reminder_days") || "").trim();

    if (!title) return { error: "Title is required" };
    if (!startDateStr || !endDateStr)
      return { error: "Start and end dates are required" };

    const minimumDaysRequired = minDaysRaw === "" ? null : Number(minDaysRaw);
    const reminderDays =
      reminderDaysRaw === "" ? null : Number(reminderDaysRaw);

    if (minimumDaysRequired !== null && Number.isNaN(minimumDaysRequired)) {
      return { error: "Minimum days required must be a number" };
    }
    if (reminderDays !== null && Number.isNaN(reminderDays)) {
      return { error: "Reminder days must be a number" };
    }

    const { error: insertErr } = await supabase.from("drill_events").insert({
      organization_id: profile.organization_id,
      title,
      description,
      location,
      start_date: startDateStr,
      end_date: endDateStr,
      is_mandatory: isMandatory,
      minimum_days_required: minimumDaysRequired,
      reminder_days: reminderDays ?? undefined,
      created_by: profile.id,
    });
    if (insertErr) {
      return { error: insertErr.message };
    }

    revalidatePath("/dashboard/drills");
    return { ok: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}
