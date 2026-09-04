"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { geocodePLZ } from "@/lib/geocode";
import { CATEGORIES } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  Umzug: "📦",
  Reparatur: "🔧",
  Transport: "🚗",
  "Garten & Haushalt": "🧹",
  Kinderbetreuung: "🧸",
  Sonstiges: "✨",
};

export default function HilfeSuchenPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !category) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const plz = String(formData.get("postalCode") ?? "");

    const geo = await geocodePLZ(plz);
    if (!geo) {
      setSubmitting(false);
      setError("Postleitzahl nicht gefunden. Bitte prüfen und nochmal versuchen.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      type: "request",
      category,
      title: formData.get("title"),
      description: formData.get("description"),
      location: geo.placeName,
      postal_code: plz,
      lat: geo.lat,
      lng: geo.lng,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (checkingAuth) return null;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Bitte zuerst anmelden</h1>
        <p className="text-black/70 dark:text-white/70 mb-4">
          Um Hilfe zu suchen, musst du eingeloggt sein.
        </p>
        <Link href="/login" className="text-blue-600 underline">
          Zum Login
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
          Wobei brauchst du Hilfe?
        </h1>
        <p className="text-black/60 dark:text-white/60 mb-6">
          Wähl ein Thema, das am besten passt.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="rounded-xl border-2 border-blue-100 dark:border-blue-900/50 p-5 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <div className="text-3xl mb-2">{CATEGORY_ICONS[c]}</div>
              <div className="text-sm font-medium">{c}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button
        type="button"
        onClick={() => setCategory(null)}
        className="text-sm text-blue-600 underline mb-4"
      >
        ← Anderes Thema wählen
      </button>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1">
        {CATEGORY_ICONS[category]} {category}
      </h1>
      <p className="text-black/60 dark:text-white/60 mb-6">
        Erzähl kurz, was du brauchst.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium">
          Titel
          <input
            name="title"
            required
            type="text"
            placeholder="Kurz und knapp, worum geht's?"
            className="mt-1 w-full border border-blue-200 dark:border-blue-900/60 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </label>

        <label className="text-sm font-medium">
          Beschreibung
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Mehr Details..."
            className="mt-1 w-full border border-blue-200 dark:border-blue-900/60 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </label>

        <label className="text-sm font-medium">
          Postleitzahl
          <input
            name="postalCode"
            required
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="z.B. 10115"
            className="mt-1 w-full border border-blue-200 dark:border-blue-900/60 rounded-md px-3 py-2 text-sm bg-transparent"
          />
          <span className="block text-xs text-black/50 dark:text-white/50 mt-1 font-normal">
            Damit Leute in deiner Nähe dich finden können.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-2"
        >
          {submitting ? "..." : "Hilfe-Gesuch veröffentlichen"}
        </button>
      </form>
    </div>
  );
}
