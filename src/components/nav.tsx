import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-4">
        <Link href="/" className="text-base font-bold sm:text-lg">
          2026년 7월 SK그룹 신입구성원과정 (7/1 ~ 7/15)
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/posts/new">글쓰기</Link>
              <Link href="/my-posts">내 글</Link>
              <Link href="/account">계정</Link>
              <span className="text-black/50 dark:text-white/50">
                {user.email}
              </span>
              <form action={logout}>
                <button type="submit" className="cursor-pointer">
                  로그아웃
                </button>
              </form>
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
