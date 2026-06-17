import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FaqForm from "./faq-form";

export default async function FaqPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let isAdmin = false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  isAdmin = profile?.is_admin ?? false;

  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id, question, answer, created_at")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">자주 묻는 질문</h1>

      {isAdmin && <FaqForm />}

      {error ? (
        <p className="text-red-600">
          FAQ를 불러오지 못했어요: {error.message}
        </p>
      ) : !faqs || faqs.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          아직 등록된 FAQ가 없어요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {faqs.map((faq) => (
            <li key={faq.id} className="py-4">
              <p className="font-bold">Q. {faq.question}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-black/70 dark:text-white/70">
                A. {faq.answer}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="flex-1 rounded bg-black px-4 py-3 text-center font-medium text-white dark:bg-white dark:text-black"
        >
          과정 문의 바로가기
        </Link>
        <Link
          href="/notices"
          className="flex-1 rounded border border-black/20 px-4 py-3 text-center font-medium dark:border-white/20"
        >
          공지사항 바로가기
        </Link>
      </div>
    </div>
  );
}
