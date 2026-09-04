import FeedClient from "@/components/FeedClient";
import { createClient } from "@/utils/supabase/server";
import { Post } from "@/lib/types";

export default async function Feed() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, type, category, title, description, location, postal_code, lat, lng, created_at, profiles(display_name)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const posts: Post[] = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      type: row.type,
      category: row.category,
      title: row.title,
      description: row.description,
      location: row.location,
      postalCode: row.postal_code,
      lat: row.lat,
      lng: row.lng,
      authorName: profile?.display_name ?? "Jemand",
      createdAt: row.created_at,
    };
  });

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Aktuelle Beiträge</h2>
      <FeedClient posts={posts} />
    </section>
  );
}
