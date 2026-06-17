"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = (formData.get("name") as string).trim();
  const company = (formData.get("company") as string).trim();
  const email = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;

  if (!name) {
    return { error: "이름을 입력해주세요." };
  }

  const supabase = await createClient();

  const { data: companyValid } = await supabase
    .from("companies")
    .select("name")
    .eq("name", company)
    .maybeSingle();

  if (!companyValid) {
    return { error: "목록에 있는 회사를 선택해주세요." };
  }

  const { data: allowed, error: checkError } = await supabase.rpc(
    "is_email_allowed",
    { check_email: email }
  );

  if (checkError) {
    return { error: checkError.message };
  }

  if (!allowed) {
    return {
      error: "사전에 등록된 이메일만 가입할 수 있어요. 담당자에게 문의해주세요.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, company } },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message:
        "가입 신청이 완료됐어요! 이메일함을 확인해서 인증 링크를 클릭한 뒤 로그인해주세요.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
