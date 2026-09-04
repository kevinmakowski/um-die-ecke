"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProfileForm({
  initialDisplayName,
  initialLocation,
  initialBio,
}: {
  initialDisplayName: string;
  initialLocation: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [location, setLocation] = useState(initialLocation);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, location, bio })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm font-medium">
        Name
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
        />
      </label>
      <label className="text-sm font-medium">
        Ort / Stadtteil
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="z.B. Altstadt"
          className="mt-1 w-full border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
        />
      </label>
      <label className="text-sm font-medium">
        Über mich
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 w-full border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-teal-600">Gespeichert!</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 self-start"
      >
        {saving ? "..." : "Speichern"}
      </button>
    </form>
  );
}
