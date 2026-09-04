import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    displayName = profile?.display_name ?? user.email ?? null;
  }

  return (
    <header className="border-b border-blue-100 dark:border-blue-900/40 sticky top-0 bg-(--background)/90 backdrop-blur z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-blue-600 dark:text-blue-400">
            Um die Ecke
          </span>
          <span className="font-[family-name:var(--font-display)] text-xs text-blue-500/70 dark:text-blue-300/70">
            ...oder zwei Straßen weiter
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Start
          </Link>
          {user ? (
            <>
              <Link
                href="/nachrichten"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Nachrichten
              </Link>
              <Link
                href="/profil"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {displayName}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-black/60 dark:text-white/60 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400">
                Anmelden
              </Link>
              <Link
                href="/registrieren"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
              >
                Registrieren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
