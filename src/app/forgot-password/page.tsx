"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">비밀번호 찾기</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        가입할 때 사용한 이메일을 입력하면 비밀번호 재설정 링크를 보내드려요.
      </p>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
      <input
        name="email"
        type="email"
        placeholder="이메일"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "전송 중..." : "재설정 링크 보내기"}
      </button>
      <p className="text-sm text-black/60 dark:text-white/60">
        <Link href="/login" className="underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </form>
  );
}
