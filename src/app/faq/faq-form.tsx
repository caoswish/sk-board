"use client";

import { useActionState } from "react";
import { createFaq } from "@/app/actions/faqs";

export default function FaqForm() {
  const [state, action, pending] = useActionState(createFaq, undefined);

  return (
    <form
      action={action}
      className="mb-8 flex flex-col gap-3 rounded border border-black/10 p-4 dark:border-white/10"
    >
      <h2 className="text-sm font-bold">FAQ 추가 (관리자)</h2>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <input
        name="question"
        placeholder="질문"
        required
        className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
      />
      <textarea
        name="answer"
        placeholder="답변"
        required
        rows={4}
        className="rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "등록 중..." : "FAQ 등록"}
      </button>
    </form>
  );
}
