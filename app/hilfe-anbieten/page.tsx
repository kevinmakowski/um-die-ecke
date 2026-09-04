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

export default function HilfeAnbietenPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, []);

  function toggle(category: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const plz = String(formData.get("postalCode") ?? "");
    const note = String(formData.get("note") ?? "");

    const geo = await geocodePLZ(plz);
    if (!geo) {
      setSubmitting(false);
      setError("Postleitzahl nicht gefunden. Bitte prüfen und nochmal versuchen.");
      return;
    }

    const supabase = createClient();
    const rows = Array.from(selected).map((category) => ({
      user_id: user.id,
      type: "offer" as const,
      category,
      title: `Bietet Hilfe: ${category}`,
      description: note || `Ich kann bei "${category}" helfen.`,
      location: geo.placeName,
      postal_code: plz,
      lat: geo.lat,
      lng: geo.lng,
    }));

    const { error } = await supabase.from("posts").insert(rows);
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
          Um Hilfe anzubieten, musst du eingeloggt sein.
        </p>
        <Link href="/login" className="text-blue-600 underline">
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
        Wobei kannst du helfen?
      </h1>
      <p className="text-black/60 dark:text-white/60 mb-6">
        Wähl ein oder mehrere Themen aus.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const isSelected = selected.has(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                aria-pressed={isSelected}
                className={`rounded-xl border-2 p-5 text-center transition-colors ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50"
                    : "border-blue-100 dark:border-blue-900/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                }`}
              >
                <div className="text-3xl mb-2">{CATEGORY_ICONS[c]}</div>
                <div className="text-sm font-medium">{c}</div>
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <>
            <label className="text-sm font-medium">
              Kurze Notiz (optional)
              <textarea
                name="note"
                rows={3}
                placeholder="z.B. verfügbare Zeiten, Erfahrung, ..."
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
              className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 self-start"
            >
              {submitting
                ? "..."
                : `${selected.size} Angebot${selected.size > 1 ? "e" : ""} veröffentlichen`}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
