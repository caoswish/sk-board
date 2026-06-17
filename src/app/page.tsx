import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { maskEmail } from "@/lib/mask-email";

function escapeForFilter(value: string) {
  return value.replace(/[,().:]/g, "\\$&");
}

function getSnippet(content: string, maxLength = 80) {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength)}...` : flat;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("id, title, content, author, created_at, is_notice, user_id")
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false });

  if (q) {
    const safeQ = escapeForFilter(q);
    query = query.or(`title.ilike.%${safeQ}%,content.ilike.%${safeQ}%`);
  }

  const { data: posts, error } = await query;

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

  const authorInfo = new Map<
    string,
    { name: string | null; company: string | null }
  >();

  if (isAdmin && posts && posts.length > 0) {
    const userIds = Array.from(
      new Set(posts.map((p) => p.user_id).filter((id): id is string => !!id))
    );
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, company")
        .in("id", userIds);
      profiles?.forEach((p) =>
        authorInfo.set(p.id, { name: p.name, company: p.company })
      );
    }
  }

  return (
    <div>
      {!user && (
        <p className="mb-6 rounded border border-black/10 bg-black/5 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
          글을 쓰려면 로그인 또는 회원가입이 필요해요.{" "}
          <Link href="/login" className="underline">
            로그인
          </Link>
          {" · "}
          <Link href="/signup" className="underline">
            회원가입
          </Link>
        </p>
      )}

      <form action="/" className="mb-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="제목이나 내용으로 검색"
          className="flex-1 rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          검색
        </button>
        {q && (
          <Link
            href="/"
            className="rounded border border-black/20 px-4 py-2 text-sm dark:border-white/20"
          >
            초기화
          </Link>
        )}
      </form>

      {error ? (
        <p className="text-red-600">
          글 목록을 불러오지 못했어요: {error.message}
        </p>
      ) : !posts || posts.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          {q
            ? `"${q}"에 대한 검색 결과가 없어요.`
            : "아직 작성된 글이 없어요. 첫 글을 남겨보세요!"}
        </p>
      ) : (
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {posts.map((post) => {
            const info = isAdmin ? authorInfo.get(post.user_id) : undefined;
            return (
              <li key={post.id} className="py-4">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-lg font-bold hover:underline"
                >
                  {post.is_notice && (
                    <span className="mr-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      공지
                    </span>
                  )}
                  {post.title}
                </Link>
                <p className="mt-1 line-clamp-1 text-sm text-black/60 dark:text-white/60">
                  {getSnippet(post.content)}
                </p>
                <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                  {info && (
                    <span className="font-medium text-black dark:text-white">
                      {info.name ?? "이름없음"} ({info.company ?? "회사없음"})
                      {" · "}
                    </span>
                  )}
                  {maskEmail(post.author)} ·{" "}
                  {new Date(post.created_at).toLocaleString("ko-KR")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
