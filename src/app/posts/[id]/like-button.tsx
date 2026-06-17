"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/app/actions/posts";

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLike(postId);
      if (result?.error) {
        setError(result.error);
        setLiked(!nextLiked);
        setCount((c) => c + (nextLiked ? -1 : 1));
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
        className={`self-start rounded border px-3 py-1 text-sm font-medium disabled:opacity-50 ${
          liked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-black/20 dark:border-white/20"
        }`}
      >
        👍 추천 {count}
      </button>
    </div>
  );
}
