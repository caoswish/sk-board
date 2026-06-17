"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">로그인</h1>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <input
        name="email"
        type="email"
        placeholder="이메일"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <input
        name="password"
        type="password"
        placeholder="비밀번호"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-sm text-black/60 dark:text-white/60">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
