import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UpdatePasswordForm from "@/components/update-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-black/60 dark:text-white/60">
          비밀번호 재설정 링크를 통해서만 접속할 수 있는 화면이에요.
        </p>
        <Link href="/forgot-password" className="underline">
          비밀번호 찾기로 이동
        </Link>
      </div>
    );
  }

  return <UpdatePasswordForm title="새 비밀번호 설정" />;
}
