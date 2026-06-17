import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpdatePasswordForm from "@/components/update-password-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <p className="mb-6 text-sm text-black/60 dark:text-white/60">
        로그인 계정: {user.email}
      </p>
      <UpdatePasswordForm title="비밀번호 변경" />
    </div>
  );
}
