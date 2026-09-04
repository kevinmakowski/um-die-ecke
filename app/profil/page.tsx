import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function ProfilPage() {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, location, bio")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mein Profil</h1>
      <ProfileForm
        initialDisplayName={profile?.display_name ?? ""}
        initialLocation={profile?.location ?? ""}
        initialBio={profile?.bio ?? ""}
      />
    </div>
  );
}
