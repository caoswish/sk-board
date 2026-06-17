"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export default function SignupForm({ companies }: { companies: string[] }) {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">회원가입</h1>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
      <input
        name="name"
        type="text"
        placeholder="이름"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <select
        name="company"
        required
        defaultValue=""
        className="rounded border border-black/20 bg-white px-3 py-2 text-black dark:border-white/20 dark:bg-zinc-900 dark:text-white [color-scheme:dark]"
      >
        <option value="" disabled>
          회사를 선택하세요
        </option>
        {companies.map((company) => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>
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
        placeholder="비밀번호 (6자 이상)"
        required
        minLength={6}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "가입 중..." : "회원가입"}
      </button>
      <p className="text-sm text-black/60 dark:text-white/60">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
