"use client";

import { useState, useTransition } from "react";
import { approveAdmin } from "@/app/actions/admin";

export default function ApproveButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    startTransition(async () => {
      const result = await approveAdmin(userId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return <span className="text-sm font-medium text-green-600">승인 완료</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "처리 중..." : "관리자로 승인"}
      </button>
    </div>
  );
}
