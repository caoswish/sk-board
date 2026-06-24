"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FaqState = { error?: string } | undefined;

export async function createFaq(
  _prevState: FaqState,
  formData: FormData
): Promise<FaqState> {
  const question = (formData.get("question") as string)?.trim();
  const answer = (formData.get("answer") as string)?.trim();

  if (!question || !answer) {
    return { error: "질문과 답변을 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({ question, answer });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/faq");
  return {};
}

export async function updateFaq(
  faqId: number,
  question: string,
  answer: string
): Promise<FaqState> {
  const q = question.trim();
  const a = answer.trim();

  if (!q || !a) {
    return { error: "질문과 답변을 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("faqs")
    .update({ question: q, answer: a })
    .eq("id", faqId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/faq");
  return {};
}

export async function deleteFaq(faqId: number): Promise<FaqState> {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", faqId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/faq");
  return {};
}
