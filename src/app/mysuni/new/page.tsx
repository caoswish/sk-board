import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MySuniPostForm from "./mysuni-post-form";

export default async function NewMySuniPostPage() {
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

  return <MySuniPostForm isAdmin={profile?.is_admin ?? false} />;
}
