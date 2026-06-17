"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReplyState = { error?: string } | undefined;

export async function createReply(
  postId: number,
  _prevState: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const content = (formData.get("content") as string)?.trim();

  if (!content) {
    return { error: "답글 내용을 입력해주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("replies").insert({
    post_id: postId,
    content,
    author: user.email,
    user_id: user.id,
  });

  if (error) {
    return { error: "답글 작성 권한이 없거나 오류가 발생했어요: " + error.message };
  }

  revalidatePath(`/posts/${postId}`);
  return undefined;
}

export async function updateReply(replyId: number, content: string) {
  const trimmed = content.trim();

  if (!trimmed) {
    return { error: "답글 내용을 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("replies")
    .update({ content: trimmed })
    .eq("id", replyId);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function deleteReply(replyId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("replies").delete().eq("id", replyId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
