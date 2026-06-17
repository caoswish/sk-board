"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";

export default function UpdatePasswordForm({ title }: { title: string }) {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
      <input
        name="password"
        type="password"
        placeholder="새 비밀번호 (6자 이상)"
        required
        minLength={6}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="새 비밀번호 확인"
        required
        minLength={6}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
