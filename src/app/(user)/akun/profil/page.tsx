import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/user/ProfileForm";
import { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>
      <ProfileForm profile={profile as Profile | null} />
    </div>
  );
}
