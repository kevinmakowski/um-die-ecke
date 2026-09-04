import Link from "next/link";
import Feed from "@/components/Feed";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <section className="text-center mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold text-blue-700 dark:text-blue-300 mb-3">
          Hilfe in deiner Nachbarschaft
        </h1>
        <p className="text-black/70 dark:text-white/70 max-w-xl mx-auto">
          Manchmal ist die Person, die dir helfen kann, näher als du denkst —
          der Nachbar, jemand zwei Straßen weiter.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 mb-14">
        <Link
          href="/hilfe-suchen"
          className="group rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 p-8 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
        >
          <div className="text-4xl mb-3">🙋</div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Ich brauche Hilfe
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Sag uns kurz, worum's geht — wir zeigen es Leuten in deiner Nähe.
          </p>
        </Link>

        <Link
          href="/hilfe-anbieten"
          className="group rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 bg-white dark:bg-blue-950/10 p-8 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
        >
          <div className="text-4xl mb-3">🤝</div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Ich biete Hilfe
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Wähl aus, bei welchen Themen du grundsätzlich helfen kannst.
          </p>
        </Link>
      </section>

      <Feed />
    </div>
  );
}
