"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RegistrierenPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setNeedsConfirmation(true);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Fast geschafft!</h1>
        <p className="text-black/70 dark:text-white/70">
          Wir haben dir eine E-Mail geschickt. Bitte bestätige deine
          Adresse, dann kannst du dich einloggen.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Registrieren</h1>
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
          E-Mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </label>
        <label className="text-sm font-medium">
          Passwort
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Konto erstellen"}
        </button>
      </form>
      <p className="text-sm text-black/60 dark:text-white/60 mt-4">
        Schon ein Konto?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
