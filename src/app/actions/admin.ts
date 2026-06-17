"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveAdmin(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/approvals");
  return {};
}
