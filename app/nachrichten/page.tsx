import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function NachrichtenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-2">Bitte zuerst anmelden</h1>
        <Link href="/login" className="text-blue-600 underline">
          Zum Login
        </Link>
      </div>
    );
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, post_id, sender_id, recipient_id, body, created_at, posts(title)")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const otherIds = Array.from(
    new Set(
      (messages ?? []).map((m) =>
        m.sender_id === user.id ? m.recipient_id : m.sender_id,
      ),
    ),
  );

  const { data: profiles } = otherIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", otherIds)
    : { data: [] as { id: string; display_name: string }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  type Conversation = {
    postId: string;
    otherId: string;
    postTitle: string;
    otherName: string;
    lastMessage: string;
    lastTime: string;
  };

  const conversations = new Map<string, Conversation>();
  for (const m of messages ?? []) {
    const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    const key = `${m.post_id}:${otherId}`;
    if (conversations.has(key)) continue;
    const post = Array.isArray(m.posts) ? m.posts[0] : m.posts;
    conversations.set(key, {
      postId: m.post_id,
      otherId,
      postTitle: post?.title ?? "Beitrag",
      otherName: nameById.get(otherId) ?? "Jemand",
      lastMessage: m.body,
      lastTime: m.created_at,
    });
  }

  const list = Array.from(conversations.values());

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meine Nachrichten</h1>

      {list.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          Noch keine Nachrichten. Schreib jemandem über einen Beitrag!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => (
            <Link
              key={`${c.postId}:${c.otherId}`}
              href={`/nachrichten/${c.postId}/${c.otherId}`}
              className="block rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{c.otherName}</span>
                <span className="text-xs text-black/50 dark:text-white/50">
                  {new Date(c.lastTime).toLocaleString("de-DE")}
                </span>
              </div>
              <div className="text-xs text-black/50 dark:text-white/50 mb-2">
                zu: {c.postTitle}
              </div>
              <p className="text-sm text-black/70 dark:text-white/70 line-clamp-2">
                {c.lastMessage}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
