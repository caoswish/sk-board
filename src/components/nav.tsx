import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-4">
        <Link href="/" className="text-base font-bold sm:text-lg">
          &apos;26년 7월 SK그룹 신입구성원과정 (7/1 ~ 7/15)
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/posts/new"
                className="flex items-center gap-1 rounded-full bg-black px-4 py-1.5 font-bold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
              >
                ✏️ 글쓰기
              </Link>

              <div className="flex items-center gap-3 border-l border-black/10 pl-3 dark:border-white/10">
                <Link href="/my-posts" className="flex items-center gap-1">
                  📝 내 글
                </Link>
                <Link href="/account" className="flex items-center gap-1">
                  ⚙️ 계정
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/approvals"
                    className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400"
                  >
                    🛡️ 관리자 승인
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3 border-l border-black/10 pl-3 dark:border-white/10">
                <span className="text-black/50 dark:text-white/50">
                  {user.email}
                </span>
                <form action={logout}>
                  <button type="submit" className="cursor-pointer">
                    로그아웃
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
