"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateReply, deleteReply } from "@/app/actions/replies";
import { formatDateTime } from "@/lib/format-date";

type Reply = {
  id: number;
  content: string;
  created_at: string;
};

export default function ReplyItem({
  reply,
  isAdmin,
}: {
  reply: Reply;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [savedContent, setSavedContent] = useState(reply.content);
  const [content, setContent] = useState(reply.content);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateReply(reply.id, content);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSavedContent(content);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!window.confirm("정말 이 답글을 삭제하시겠어요?")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteReply(reply.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (editing) {
    return (
      <li className="rounded bg-black/5 p-4 dark:bg-white/5">
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded bg-black px-3 py-1 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={() => {
              setContent(savedContent);
              setEditing(false);
            }}
            className="rounded border border-black/20 px-3 py-1 text-xs dark:border-white/20"
          >
            취소
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded bg-black/5 p-4 dark:bg-white/5">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <p className="whitespace-pre-wrap">{savedContent}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-black/50 dark:text-white/50">
          관리자 · {formatDateTime(reply.created_at)}
        </p>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs underline"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-red-600 underline disabled:opacity-50"
            >
              {isPending ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
