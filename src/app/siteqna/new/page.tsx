import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AcademyPostForm from "./academy-post-form";

export default async function NewAcademyPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return <AcademyPostForm isAdmin={profile?.is_admin ?? false} />;
}
