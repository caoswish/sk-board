"use client";

import { useActionState } from "react";
import { createReply } from "@/app/actions/replies";

export default function ReplyForm({ postId }: { postId: number }) {
  const action = createReply.bind(null, postId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2">
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <textarea
        name="content"
        placeholder="관리자 답글을 입력하세요"
        required
        rows={4}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "등록 중..." : "관리자 답글 등록"}
      </button>
    </form>
  );
}
