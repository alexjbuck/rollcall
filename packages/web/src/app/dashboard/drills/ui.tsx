"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { type CreateDrillState, createDrill } from "./actions";

export function CreateDrillForm() {
  const [state, formAction, pending] = useActionState<
    CreateDrillState,
    FormData
  >(createDrill, {});
  const formRef = useRef<HTMLFormElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setLocalError(null);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 border p-4 rounded-md"
    >
      <div className="font-medium">Create Drill</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="location" className="block text-sm">
            Location
          </label>
          <input
            id="location"
            name="location"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="description" className="block text-sm">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="start_date" className="block text-sm">
            Start date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="end_date" className="block text-sm">
            End date
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="is_mandatory"
            name="is_mandatory"
            type="checkbox"
            className="size-4"
            defaultChecked
          />
          <label htmlFor="is_mandatory" className="text-sm">
            Mandatory
          </label>
        </div>
        <div className="space-y-1">
          <label htmlFor="minimum_days_required" className="block text-sm">
            Minimum days required
          </label>
          <input
            id="minimum_days_required"
            name="minimum_days_required"
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="reminder_days" className="block text-sm">
            Reminder days
          </label>
          <input
            id="reminder_days"
            name="reminder_days"
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      {state?.error && (
        <div className="text-sm text-red-600">{state.error}</div>
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
