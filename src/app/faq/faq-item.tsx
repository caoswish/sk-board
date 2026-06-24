"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFaq, deleteFaq } from "@/app/actions/faqs";

type Faq = {
  id: number;
  question: string;
  answer: string;
};

export default function FaqItem({
  faq,
  isAdmin,
}: {
  faq: Faq;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateFaq(faq.id, question, answer);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setEditing(false);
        setErrorMsg(null);
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 FAQ를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteFaq(faq.id);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <li className="py-4">
        {errorMsg && <p className="mb-2 text-sm text-red-600">{errorMsg}</p>}
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="질문"
          className="mb-2 w-full rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="답변 (HTML 가능 — 예: <video controls><source src='...'></video>)"
          rows={6}
          className="w-full rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        />
        <p className="mt-1 text-xs text-black/40 dark:text-white/40">
          HTML 태그를 직접 입력할 수 있습니다. 동영상: &lt;video controls&gt;&lt;source src=&quot;URL&quot; type=&quot;video/mp4&quot;&gt;&lt;/video&gt; / YouTube: &lt;iframe src=&quot;embed URL&quot; ...&gt;&lt;/iframe&gt;
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded bg-black px-3 py-1 text-xs text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={() => {
              setQuestion(faq.question);
              setAnswer(faq.answer);
              setEditing(false);
              setErrorMsg(null);
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
    <li className="py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold">Q. {faq.question}</p>
        {isAdmin && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded border border-black/20 px-2 py-0.5 text-xs dark:border-white/20"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 disabled:opacity-50 dark:border-red-700 dark:text-red-400"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <div className="mt-1 text-sm font-medium text-black/50 dark:text-white/50">
        A.
      </div>
      <div
        className="mt-1 text-sm text-black/70 dark:text-white/70
          [&_video]:max-w-full [&_video]:rounded
          [&_iframe]:max-w-full [&_iframe]:rounded
          [&_img]:max-w-full [&_img]:rounded
          [&_a]:text-blue-600 [&_a]:underline
          [&_p]:mt-1 [&_br]:block"
        dangerouslySetInnerHTML={{ __html: faq.answer }}
      />
    </li>
  );
}
