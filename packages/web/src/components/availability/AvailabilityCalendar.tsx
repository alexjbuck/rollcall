"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AvailabilityRow = {
  id: string;
  available_date: string;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function AvailabilityCalendar() {
  const supabase = createSupabaseBrowserClient();
  const qc = useQueryClient();

  const [cursor, setCursor] = useState(() => new Date());
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const rangeKey = `${monthStart.toISOString().slice(0, 10)}_${monthEnd
    .toISOString()
    .slice(0, 10)}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability", rangeKey],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_availability")
        .select("id, available_date")
        .gte("available_date", monthStart.toISOString().slice(0, 10))
        .lte("available_date", monthEnd.toISOString().slice(0, 10));
      if (error) throw error;
      return (data ?? []) as AvailabilityRow[];
    },
  });

  const availableSet = useMemo(() => {
    const set = new Set<string>();
    for (const r of data ?? []) {
      set.add(r.available_date);
    }
    return set;
  }, [data]);

  const toggleMutation = useMutation({
    mutationFn: async (isoDate: string) => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("Not authenticated");

      const isSelected = availableSet.has(isoDate);
      if (isSelected) {
        const { error } = await supabase
          .from("user_availability")
          .delete()
          .eq("user_id", userRes.user.id)
          .eq("available_date", isoDate);
        if (error) throw error;
        return { isoDate, selected: false } as const;
      }
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userRes.user.id)
        .single();
      if (pErr) throw pErr;
      const { error } = await supabase.from("user_availability").insert({
        user_id: userRes.user.id,
        organization_id: profile?.organization_id,
        available_date: isoDate,
      });
      if (error) throw error;
      return { isoDate, selected: true } as const;
    },
    onMutate: async (isoDate: string) => {
      await qc.cancelQueries({ queryKey: ["availability", rangeKey] });
      const previous = qc.getQueryData<AvailabilityRow[]>([
        "availability",
        rangeKey,
      ]);
      const isSelected = availableSet.has(isoDate);
      const next = isSelected
        ? (previous ?? []).filter((r) => r.available_date !== isoDate)
        : [
            ...(previous ?? []),
            { id: `temp-${isoDate}`, available_date: isoDate },
          ];
      qc.setQueryData(["availability", rangeKey], next);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(["availability", rangeKey], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["availability", rangeKey] });
    },
  });

  const gridDays = useMemo(() => {
    const days: Date[] = [];
    const firstDay = new Date(monthStart);
    const leading = (firstDay.getDay() + 6) % 7; // make Monday=0
    for (let i = 0; i < leading; i++) {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - (leading - i));
      days.push(d);
    }
    const daysInMonth = monthEnd.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), i));
    }
    const trailing = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      const d = new Date(monthEnd);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [monthStart, monthEnd]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded"
            onClick={() =>
              setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
            type="button"
          >
            Prev
          </button>
          <button
            className="px-2 py-1 border rounded"
            onClick={() =>
              setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{String(error)}</div>}

      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-600">
            {d}
          </div>
        ))}
        {gridDays.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const inMonth = d.getMonth() === monthStart.getMonth();
          const selected = availableSet.has(iso);
          return (
            <button
              key={iso}
              onClick={() => toggleMutation.mutate(iso)}
              type="button"
              className={
                "aspect-square rounded border text-sm " +
                (inMonth ? "" : "opacity-40 ") +
                (selected ? "bg-black text-white" : "bg-white")
              }
              title={iso}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {isLoading && <div className="text-sm text-gray-600">Loading…</div>}
    </div>
  );
}
