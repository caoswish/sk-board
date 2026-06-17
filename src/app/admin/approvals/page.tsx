import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApproveButton from "./approve-button";

const ADMIN_COMPANY = "SK아카데미";
const ADMIN_EMAIL_SUFFIX = "@sk.com";

export default async function AdminApprovalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: candidates, error } = await supabase
    .from("profiles")
    .select("id, name, company, email")
    .eq("company", ADMIN_COMPANY)
    .eq("is_admin", false)
    .ilike("email", `%${ADMIN_EMAIL_SUFFIX}`);

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">관리자 승인</h1>
      <p className="mb-6 text-sm text-black/60 dark:text-white/60">
        회사가 &quot;{ADMIN_COMPANY}&quot;이고, 이메일이 &quot;
        {ADMIN_EMAIL_SUFFIX}&quot;로 끝나는 가입자만 후보로 보여요.
      </p>

      {error ? (
        <p className="text-red-600">목록을 불러오지 못했어요: {error.message}</p>
      ) : !candidates || candidates.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          승인 대기 중인 후보가 없어요.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="flex items-center justify-between py-4"
            >
              <div>
                <p className="font-medium">
                  {candidate.name ?? "이름없음"} ({candidate.company})
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {candidate.email}
                </p>
              </div>
              <ApproveButton userId={candidate.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
