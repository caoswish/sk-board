"use client";

import { useState, useTransition } from "react";
import { deletePost } from "@/app/actions/posts";

export default function DeletePostButton({ postId }: { postId: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    if (
      !window.confirm("정말 이 글을 삭제하시겠어요? 삭제하면 되돌릴 수 없어요.")
    ) {
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="self-start rounded border border-red-600 px-3 py-1 text-xs text-red-600 disabled:opacity-50"
      >
        {isPending ? "삭제 중..." : "글 삭제"}
      </button>
    </div>
  );
}
