import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContactForm from "./ContactForm";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, type, category, title, description, location, user_id, profiles(display_name)",
    )
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const authorName = profile?.display_name ?? "Jemand";
  const isRequest = post.type === "request";
  const isOwnPost = user?.id === post.user_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isRequest
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            : "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
        }`}
      >
        {isRequest ? "Sucht Hilfe" : "Bietet Hilfe"}
      </span>

      <h1 className="text-2xl font-bold mt-3 mb-1">{post.title}</h1>
      <div className="text-sm text-black/50 dark:text-white/50 mb-6">
        {post.category} · {authorName} · {post.location}
      </div>

      <p className="text-black/80 dark:text-white/80 mb-8 whitespace-pre-line">
        {post.description}
      </p>

      {isOwnPost ? (
        <p className="text-sm text-black/50 dark:text-white/50">
          Das ist dein eigener Beitrag.
        </p>
      ) : (
        <ContactForm
          postId={post.id}
          recipientId={post.user_id}
          authorName={authorName}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
}
