"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createDrill } from "./actions";

export function CreateDrillForm() {
  const [state, formAction, pending] = useActionState(createDrill, {} as any);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if ((state as any)?.ok) {
      formRef.current?.reset();
      setLocalError(null);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 border p-4 rounded-md">
      <div className="font-medium">Create Drill</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-sm">Title</label>
          <input name="title" required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Location</label>
          <input name="location" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="block text-sm">Description</label>
          <textarea name="description" className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Start date</label>
          <input name="start_date" type="date" required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">End date</label>
          <input name="end_date" type="date" required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="is_mandatory" name="is_mandatory" type="checkbox" className="size-4" defaultChecked />
          <label htmlFor="is_mandatory" className="text-sm">Mandatory</label>
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Minimum days required</label>
          <input name="minimum_days_required" type="number" min={0} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Reminder days</label>
          <input name="reminder_days" type="number" min={0} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      {(state as any)?.error && (
        <div className="text-sm text-red-600">{(state as any).error}</div>
      )}
      {localError && <div className="text-sm text-red-600">{localError}</div>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create drill"}
        </button>
      </div>
    </form>
  );
}

