import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format-date";

function getSnippet(content: string, maxLength = 80) {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength)}...` : flat;
}

export default async function NoticesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let isAdmin = false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  isAdmin = profile?.is_admin ?? false;

  const { data: notices, error } = await supabase
    .from("posts_public")
    .select("id, title, content, created_at")
    .eq("is_notice", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">공지사항</h1>
        {isAdmin && (
          <Link
            href="/posts/new"
            className="flex items-center gap-1 rounded-full bg-black px-4 py-1.5 font-bold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            ✏️ 공지 작성
          </Link>
        )}
      </div>

      {error ? (
        <p className="text-red-600">
          공지사항을 불러오지 못했어요: {error.message}
        </p>
      ) : !notices || notices.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          아직 등록된 공지사항이 없어요.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {notices.map((notice) => (
            <li key={notice.id} className="py-4">
              <Link
                href={`/posts/${notice.id}`}
                className="text-lg font-bold hover:underline"
              >
                <span className="mr-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  공지
                </span>
                {notice.title}
              </Link>
              <p className="mt-1 line-clamp-1 text-sm text-black/60 dark:text-white/60">
                {getSnippet(notice.content)}
              </p>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                {formatDateTime(notice.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="flex-1 rounded bg-black px-4 py-3 text-center font-medium text-white dark:bg-white dark:text-black"
        >
          Survey 문의 바로가기
        </Link>
        <Link
          href="/faq"
          className="flex-1 rounded border border-black/20 px-4 py-3 text-center font-medium dark:border-white/20"
        >
          FAQ 바로가기
        </Link>
      </div>
    </div>
  );
}
