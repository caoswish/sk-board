import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { maskEmail } from "@/lib/mask-email";
import ReplyForm from "./reply-form";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, author, created_at, is_notice, user_id")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  const { data: replies } = await supabase
    .from("replies")
    .select("id, content, created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const { data: attachments } = await supabase
    .from("attachments")
    .select("id, file_name, file_url, file_type")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

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

  let authorInfo: { name: string | null; company: string | null } | null =
    null;
  if (isAdmin) {
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("name, company")
      .eq("id", post.user_id)
      .single();
    authorInfo = authorProfile ?? null;
  }

  return (
    <article>
      <h1 className="text-2xl font-bold">
        {post.is_notice && (
          <span className="mr-2 rounded bg-red-600 px-2 py-0.5 align-middle text-xs font-bold text-white">
            공지
          </span>
        )}
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-black/50 dark:text-white/50">
        {authorInfo && (
          <span className="font-medium text-black dark:text-white">
            {authorInfo.name ?? "이름없음"} ({authorInfo.company ?? "회사없음"})
            {" · "}
          </span>
        )}
        {maskEmail(post.author)} · {new Date(post.created_at).toLocaleString("ko-KR")}
      </p>
      <p className="mt-6 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {attachments && attachments.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {attachments.map((file) =>
            file.file_type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={file.id}
                src={file.file_url}
                alt={file.file_name}
                className="max-w-full rounded border border-black/10 dark:border-white/10"
              />
            ) : (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                📎 {file.file_name}
              </a>
            )
          )}
        </div>
      )}

      <section className="mt-10 border-t border-black/10 pt-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">답글</h2>

        {replies && replies.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-4">
            {replies.map((reply) => (
              <li
                key={reply.id}
                className="rounded bg-black/5 p-4 dark:bg-white/5"
              >
                <p className="whitespace-pre-wrap">{reply.content}</p>
                <p className="mt-2 text-xs text-black/50 dark:text-white/50">
                  관리자 · {new Date(reply.created_at).toLocaleString("ko-KR")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-black/50 dark:text-white/50">
            아직 답글이 없어요.
          </p>
        )}

        {isAdmin && <ReplyForm postId={post.id} />}
      </section>
    </article>
  );
}
