import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewPostForm from "./new-post-form";

export default async function NewPostPage() {
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

  return <NewPostForm isAdmin={profile?.is_admin ?? false} />;
}
