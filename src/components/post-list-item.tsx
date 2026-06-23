import Link from "next/link";
import { formatDateTime } from "@/lib/format-date";
import { usesInstitution } from "@/lib/institutions";

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  is_notice: boolean;
  is_private: boolean;
  category: string;
  board: string;
  institution: string | null;
};

function getSnippet(content: string, maxLength = 80) {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength)}...` : flat;
}

export default function PostListItem({
  post,
  authorLabel,
  isAnswered,
}: {
  post: Post;
  authorLabel?: string;
  isAnswered?: boolean;
}) {
  return (
    <li className="py-4">
      <Link
        href={`/posts/${post.id}`}
        className="text-lg font-bold hover:underline"
      >
        {post.is_notice && (
          <span className="mr-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            공지
          </span>
        )}
        {post.is_private && (
          <span className="mr-2 rounded bg-gray-600 px-2 py-0.5 text-xs font-bold text-white">
            🔒비공개
          </span>
        )}
        {!post.is_notice &&
          (isAnswered === undefined ? (
            <span className="mr-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              로그인 후 확인
            </span>
          ) : isAnswered ? (
            <span className="mr-2 rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
              답변완료
            </span>
          ) : (
            <span className="mr-2 rounded bg-black/30 px-2 py-0.5 text-xs font-bold text-white dark:bg-white/30">
              답변대기
            </span>
          ))}
        <span className="mr-1 text-indigo-600 dark:text-indigo-400">
          [{usesInstitution(post.board) ? post.institution : post.category}]
        </span>
        {post.title}
      </Link>
      <p className="mt-1 line-clamp-1 text-sm text-black/60 dark:text-white/60">
        {getSnippet(post.content)}
      </p>
      <p className="mt-1 text-xs text-black/50 dark:text-white/50">
        {authorLabel && (
          <span className="font-medium text-black dark:text-white">
            {authorLabel}
            {" · "}
          </span>
        )}
        {post.author} · {formatDateTime(post.created_at)}
      </p>
    </li>
  );
}
