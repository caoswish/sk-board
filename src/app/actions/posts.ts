"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { POST_CATEGORIES } from "@/lib/post-categories";
import { INSTITUTIONS } from "@/lib/institutions";

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

export type UpdatePostState = { error?: string } | undefined;

export async function updatePost(
  postId: number,
  isAdmin: boolean,
  board: string,
  _prevState: UpdatePostState,
  formData: FormData
): Promise<UpdatePostState> {
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const isPrivate = formData.get("isPrivate") === "on";
  const isNotice = isAdmin && formData.get("isNotice") === "on";

  if (!title || !content) {
    return { error: "제목과 내용을 모두 입력해주세요." };
  }

  const updates: Record<string, unknown> = {
    title,
    content,
    is_private: isPrivate,
    is_notice: isNotice,
  };

  if (board === "mysuni") {
    const institution = formData.get("institution") as string;
    if (!INSTITUTIONS.includes(institution as (typeof INSTITUTIONS)[number])) {
      return { error: "올바른 기관을 선택해주세요." };
    }
    updates.institution = institution;
  } else {
    const category = formData.get("category") as string;
    if (
      !POST_CATEGORIES.includes(category as (typeof POST_CATEGORIES)[number])
    ) {
      return { error: "올바른 카테고리를 선택해주세요." };
    }
    updates.category = category;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  redirect(`/posts/${postId}`);
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

export async function toggleLike(postId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) return { error: error.message };
  }

  revalidatePath(`/posts/${postId}`);
  return {};
}
