import Link from "next/link";
import { Post } from "@/lib/types";

export default function PostCard({
  post,
  distanceKm,
}: {
  post: Post;
  distanceKm?: number | null;
}) {
  const isRequest = post.type === "request";

  return (
    <Link
      href={`/beitrag/${post.id}`}
      className="block rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-blue-400 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isRequest
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
          }`}
        >
          {isRequest ? "Sucht Hilfe" : "Bietet Hilfe"}
        </span>
        <span className="text-xs text-black/50 dark:text-white/50">
          {post.category}
        </span>
      </div>
      <h3 className="font-semibold mb-1">{post.title}</h3>
      <p className="text-sm text-black/70 dark:text-white/70 line-clamp-2 mb-2">
        {post.description}
      </p>
      <div className="text-xs text-black/50 dark:text-white/50">
        {post.authorName} · {post.location}
        {distanceKm != null && ` · ${distanceKm.toFixed(1)} km entfernt`}
      </div>
    </Link>
  );
}
