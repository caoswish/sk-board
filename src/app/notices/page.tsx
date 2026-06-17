import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const attachmentsByPost = new Map<
    number,
    { id: number; file_name: string; file_url: string; file_type: string }[]
  >();

  if (notices && notices.length > 0) {
    const { data: attachments } = await supabase
      .from("attachments")
      .select("id, post_id, file_name, file_url, file_type")
      .in(
        "post_id",
        notices.map((n) => n.id)
      )
      .order("created_at", { ascending: true });

    attachments?.forEach((file) => {
      const list = attachmentsByPost.get(file.post_id) ?? [];
      list.push(file);
      attachmentsByPost.set(file.post_id, list);
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">공지사항</h1>

      {isAdmin && (
        <Link
          href="/posts/new"
          className="mb-6 inline-block rounded bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          공지 작성하기 (글쓰기 화면에서 &quot;공지사항으로 등록&quot; 체크)
        </Link>
      )}

      {error ? (
        <p className="text-red-600">
          공지사항을 불러오지 못했어요: {error.message}
        </p>
      ) : !notices || notices.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          아직 등록된 공지사항이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {notices.map((notice) => (
            <li key={notice.id} className="py-6">
              <h2 className="text-lg font-bold">{notice.title}</h2>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                {new Date(notice.created_at).toLocaleString("ko-KR")}
              </p>
              <p className="mt-4 whitespace-pre-wrap leading-relaxed">
                {notice.content}
              </p>

              {attachmentsByPost.get(notice.id)?.map((file) =>
                file.file_type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={file.id}
                    src={file.file_url}
                    alt={file.file_name}
                    className="mt-4 max-w-full rounded border border-black/10 dark:border-white/10"
                  />
                ) : (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block text-sm text-blue-600 underline"
                  >
                    📎 {file.file_name}
                  </a>
                )
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="flex-1 rounded bg-black px-4 py-3 text-center font-medium text-white dark:bg-white dark:text-black"
        >
          과정 문의 바로가기
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
