"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ContactForm({
  postId,
  recipientId,
  authorName,
  isLoggedIn,
}: {
  postId: string;
  recipientId: string;
  authorName: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm">
        <Link href="/login" className="text-blue-600 underline">
          Melde dich an
        </Link>{" "}
        um {authorName} eine Nachricht zu schreiben.
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800 p-4 text-sm">
        Nachricht gesendet! Du findest die Unterhaltung unter{" "}
        <Link href="/nachrichten" className="underline">
          Nachrichten
        </Link>
        .
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      post_id: postId,
      sender_id: user.id,
      recipient_id: recipientId,
      body: message,
    });
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-black/10 dark:border-white/10 p-4"
    >
      <h2 className="font-semibold mb-3">Nachricht an {authorName}</h2>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hi, ich kann dir dabei helfen..."
        rows={4}
        className="w-full border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent mb-3"
      />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {sending ? "..." : "Nachricht senden"}
      </button>
    </form>
  );
}
