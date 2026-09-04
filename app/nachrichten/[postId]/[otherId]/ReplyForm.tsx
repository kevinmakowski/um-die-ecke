"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ReplyForm({
  postId,
  recipientId,
}: {
  postId: string;
  recipientId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
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
      body,
    });
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Antwort schreiben..."
        className="flex-1 border border-black/15 dark:border-white/15 rounded-md px-3 py-2 text-sm bg-transparent"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? "..." : "Senden"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
