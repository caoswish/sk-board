import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostListItem from "@/components/post-list-item";

function escapeForFilter(value: string) {
  return value.replace(/[,().:]/g, "\\$&");
}

function buildHref(params: { q?: string; status?: string }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("posts_public")
    .select(
      "id, title, content, author, created_at, is_notice, is_private, user_id"
    )
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false });

  if (q) {
    const safeQ = escapeForFilter(q);
    query = query.or(`title.ilike.%${safeQ}%,content.ilike.%${safeQ}%`);
  }

  const { data: allPosts, error } = await query;

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

  const answeredPostIds = new Set<number>();
  if (user && allPosts && allPosts.length > 0) {
    const { data: answeredRows } = await supabase
      .from("replies")
      .select("post_id")
      .in(
        "post_id",
        allPosts.map((p) => p.id)
      );
    answeredRows?.forEach((row) => answeredPostIds.add(row.post_id));
  }

  let posts = allPosts;
  if (user && posts && (status === "answered" || status === "pending")) {
    posts = posts.filter((post) => {
      if (post.is_notice) return false;
      const answered = answeredPostIds.has(post.id);
      return status === "answered" ? answered : !answered;
    });
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
        <p className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-4 text-base font-bold text-amber-900 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-200">
          글을 쓰거나 답변을 확인하려면 로그인이 필요해요.{" "}
          <Link href="/login" className="underline">
            로그인
          </Link>
          {" · "}
          <Link href="/signup" className="underline">
            회원가입
          </Link>
        </p>
      )}

      <form action="/" className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={status ?? ""} />
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
            href={buildHref({ status })}
            className="rounded border border-black/20 px-4 py-2 text-sm dark:border-white/20"
          >
            초기화
          </Link>
        )}
      </form>

      {user && (
        <div className="mb-6 flex gap-2 text-sm">
          {[
            { label: "전체", value: undefined },
            { label: "답변대기", value: "pending" },
            { label: "답변완료", value: "answered" },
          ].map((option) => {
            const active = (status ?? undefined) === option.value;
            return (
              <Link
                key={option.label}
                href={buildHref({ q, status: option.value })}
                className={`rounded px-3 py-1.5 font-medium ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-black/20 dark:border-white/20"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      )}

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
              <PostListItem
                key={post.id}
                post={post}
                authorLabel={
                  info
                    ? `${info.name ?? "이름없음"} (${info.company ?? "회사없음"})`
                    : undefined
                }
                isAnswered={user ? answeredPostIds.has(post.id) : undefined}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
