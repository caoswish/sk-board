import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReplyForm from "./reply-form";
import ReplyItem from "./reply-item";
import PrivacyToggle from "./privacy-toggle";
import DeletePostButton from "./delete-post-button";
import LikeButton from "./like-button";
import { formatDateTime } from "@/lib/format-date";

const FAQ_RECOMMEND_THRESHOLD = 10;

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts_public")
    .select(
      "id, title, content, author, created_at, is_notice, is_private, user_id, category"
    )
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  const { data: replies } = await supabase
    .from("replies_public")
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

  const isOwner = user?.id === post.user_id;

  const { count: likeCount } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  let likedByMe = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!myLike;
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
        {post.is_private && (
          <span className="mr-2 rounded bg-gray-600 px-2 py-0.5 align-middle text-xs font-bold text-white">
            🔒비공개
          </span>
        )}
        <span className="mr-1 align-middle text-indigo-600 dark:text-indigo-400">
          [{post.category}]
        </span>
        {post.title}
      </h1>
      {(isAdmin || isOwner) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className="rounded border border-black/20 px-3 py-1 text-xs dark:border-white/20"
          >
            수정
          </Link>
          {isAdmin && (
            <PrivacyToggle postId={post.id} isPrivate={post.is_private} />
          )}
          <DeletePostButton postId={post.id} />
        </div>
      )}
      <p className="mt-2 text-sm text-black/50 dark:text-white/50">
        {authorInfo && (
          <span className="font-medium text-black dark:text-white">
            {authorInfo.name ?? "이름없음"} ({authorInfo.company ?? "회사없음"})
            {" · "}
          </span>
        )}
        {post.author} · {formatDateTime(post.created_at)}
      </p>
      <p className="mt-6 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {!post.is_notice && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {user && (
            <LikeButton
              postId={post.id}
              initialLiked={likedByMe}
              initialCount={likeCount ?? 0}
            />
          )}
          {isAdmin && (likeCount ?? 0) >= FAQ_RECOMMEND_THRESHOLD && (
            <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
              ⭐ FAQ 등록 추천 (추천 {likeCount}개)
            </span>
          )}
        </div>
      )}

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

        {!user ? (
          <p className="mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-4 text-base font-bold text-amber-900 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-200">
            답변을 확인하려면 로그인이 필요해요.{" "}
            <Link href="/login" className="underline">
              로그인
            </Link>
            {" · "}
            <Link href="/signup" className="underline">
              회원가입
            </Link>
          </p>
        ) : replies && replies.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-4">
            {replies.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} isAdmin={isAdmin} />
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
