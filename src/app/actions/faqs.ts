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
