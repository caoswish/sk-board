import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditPostForm from "./edit-post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post } = await supabase
    .from("posts_public")
    .select("id, title, content, is_notice, is_private, user_id, category")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  let isAdmin = false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  isAdmin = profile?.is_admin ?? false;

  const isOwner = user.id === post.user_id;

  if (!isOwner && !isAdmin) {
    redirect(`/posts/${post.id}`);
  }

  return <EditPostForm post={post} isAdmin={isAdmin} />;
}
