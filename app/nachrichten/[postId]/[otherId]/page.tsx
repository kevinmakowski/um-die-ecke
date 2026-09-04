import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReplyForm from "./ReplyForm";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ postId: string; otherId: string }>;
}) {
  const { postId, otherId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post } = await supabase
    .from("posts")
    .select("title")
    .eq("id", postId)
    .single();

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", otherId)
    .single();

  if (!post || !otherProfile) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("post_id", postId)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">{otherProfile.display_name}</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          zu: {post.title}
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {(messages ?? []).map((m) => {
          const isMe = m.sender_id === user.id;
          return (
            <div
              key={m.id}
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                isMe
                  ? "self-end bg-blue-600 text-white"
                  : "self-start bg-black/5 dark:bg-white/10"
              }`}
            >
              <p>{m.body}</p>
              <p
                className={`text-[10px] mt-1 ${
                  isMe ? "text-white/70" : "text-black/50 dark:text-white/50"
                }`}
              >
                {new Date(m.created_at).toLocaleString("de-DE")}
              </p>
            </div>
          );
        })}
      </div>

      <ReplyForm postId={postId} recipientId={otherId} />
    </div>
  );
}
