"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function togglePrivacy(postId: number, nextValue: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ is_private: nextValue })
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return {};
}

export async function deletePost(postId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect("/");
}
