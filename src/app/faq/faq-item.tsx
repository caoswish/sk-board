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
  const [open, setOpen] = useState(false);
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
        setOpen(true);
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
          placeholder="답변 (HTML 가능 — 유튜브: <iframe src='https://www.youtube.com/embed/영상ID' width='560' height='315' allowfullscreen></iframe>)"
          rows={6}
          className="w-full rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        />
        <p className="mt-1 text-xs text-black/40 dark:text-white/40">
          유튜브 삽입 예시: &lt;iframe src=&quot;https://www.youtube.com/embed/영상ID&quot; width=&quot;100%&quot; height=&quot;315&quot; allowfullscreen&gt;&lt;/iframe&gt;
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
    <li className="divide-y divide-black/5 dark:divide-white/5">
      <div className="flex items-center gap-2 py-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center justify-between gap-2 text-left"
        >
          <span className="font-bold">
            <span className="mr-2 text-indigo-500 dark:text-indigo-400">Q.</span>
            {faq.question}
          </span>
          <span className="shrink-0 text-black/40 dark:text-white/40">
            {open ? "▲" : "▼"}
          </span>
        </button>
        {isAdmin && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => { setEditing(true); setOpen(false); }}
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

      {open && (
        <div className="pb-4 pt-3">
          <p className="mb-2 text-sm font-semibold text-indigo-500 dark:text-indigo-400">
            A.
          </p>
          <div
            className="text-sm leading-relaxed text-black/80 dark:text-white/80
              [&_video]:max-w-full [&_video]:rounded
              [&_iframe]:max-w-full [&_iframe]:rounded
              [&_img]:max-w-full [&_img]:rounded
              [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      )}
    </li>
  );
}
