"use client";

import { useActionState } from "react";
import { updatePost } from "@/app/actions/posts";
import { POST_CATEGORIES } from "@/lib/post-categories";
import { INSTITUTIONS, usesInstitution } from "@/lib/institutions";

type Post = {
  id: number;
  title: string;
  content: string;
  is_notice: boolean;
  is_private: boolean;
  category: string;
  board: string;
  institution: string | null;
};

export default function EditPostForm({
  post,
  isAdmin,
}: {
  post: Post;
  isAdmin: boolean;
}) {
  const action = updatePost.bind(null, post.id, isAdmin, post.board);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">글 수정</h1>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {usesInstitution(post.board) ? (
        <div>
          <label className="mb-2 block text-sm font-medium">연수원</label>
          <select
            name="institution"
            defaultValue={post.institution ?? ""}
            className="rounded border border-black/20 bg-white px-3 py-2 text-black dark:border-white/20 dark:bg-zinc-900 dark:text-white [color-scheme:dark]"
          >
            {INSTITUTIONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium">카테고리</label>
          <select
            name="category"
            defaultValue={post.category}
            className="rounded border border-black/20 bg-white px-3 py-2 text-black dark:border-white/20 dark:bg-zinc-900 dark:text-white [color-scheme:dark]"
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <input
        name="title"
        defaultValue={post.title}
        placeholder="제목"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />

      <textarea
        name="content"
        defaultValue={post.content}
        placeholder="내용을 입력하세요"
        required
        rows={10}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPrivate"
          defaultChecked={post.is_private}
        />
        비공개로 등록 (작성자와 관리자만 볼 수 있어요)
      </label>

      {isAdmin && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isNotice"
            defaultChecked={post.is_notice}
          />
          공지사항으로 등록
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "저장 중..." : "수정 완료"}
      </button>
    </form>
  );
}
