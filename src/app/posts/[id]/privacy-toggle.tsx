"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { togglePrivacy } from "@/app/actions/posts";

export default function PrivacyToggle({
  postId,
  isPrivate,
}: {
  postId: number;
  isPrivate: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    startTransition(async () => {
      const result = await togglePrivacy(postId, !isPrivate);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="self-start rounded border border-black/20 px-3 py-1 text-xs disabled:opacity-50 dark:border-white/20"
      >
        {isPending ? "변경 중..." : isPrivate ? "공개로 전환" : "비공개로 전환"}
      </button>
    </div>
  );
}
