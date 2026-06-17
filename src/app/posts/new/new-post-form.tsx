"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PendingFile = {
  file: File;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function NewPostForm({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addFiles(newFiles: FileList | File[]) {
    const incoming = Array.from(newFiles);
    const tooLarge: File[] = [];
    const notAllowed: File[] = [];
    const valid: File[] = [];

    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        tooLarge.push(file);
      } else if (!isAdmin && !file.type.startsWith("image/")) {
        notAllowed.push(file);
      } else {
        valid.push(file);
      }
    }

    const errors: string[] = [];
    if (tooLarge.length > 0) {
      errors.push(
        `다음 파일은 20MB를 초과해서 첨부할 수 없어요: ${tooLarge
          .map((file) => file.name)
          .join(", ")}`
      );
    }
    if (notAllowed.length > 0) {
      errors.push(
        `이미지 파일만 첨부할 수 있어요: ${notAllowed
          .map((file) => file.name)
          .join(", ")}`
      );
    }
    setError(errors.join(" "));

    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid.map((file) => ({ file }))]);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    const pastedImages: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) pastedImages.push(file);
      }
    }
    if (pastedImages.length > 0) {
      addFiles(pastedImages);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요합니다.");
      setSubmitting(false);
      return;
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        content: content.trim(),
        author: user.email,
        user_id: user.id,
        is_notice: isAdmin ? isNotice : false,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (postError || !post) {
      setError(postError?.message ?? "글을 등록하지 못했어요.");
      setSubmitting(false);
      return;
    }

    for (const { file } of files) {
      const path = `${post.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(path, file);

      if (uploadError) {
        setError(
          `"${file.name}" 파일 업로드에 실패했어요: ${uploadError.message}`
        );
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(path);

      await supabase.from("attachments").insert({
        post_id: post.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type || "application/octet-stream",
      });
    }

    router.push(`/posts/${post.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">새 글 쓰기</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        required
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onPaste={handlePaste}
        placeholder="내용을 입력하세요 (이미지를 복사해서 Ctrl+V로 붙여넣을 수 있어요)"
        required
        rows={10}
        className="rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
      />

      <div>
        <label className="mb-2 block text-sm font-medium">첨부파일</label>
        <input
          type="file"
          multiple
          accept={isAdmin ? undefined : "image/*"}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="text-sm"
        />
        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
          {isAdmin
            ? "파일은 1개당 최대 20MB까지 첨부할 수 있어요."
            : "이미지 파일만 첨부할 수 있어요 (1개당 최대 20MB)."}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded bg-black/5 px-3 py-2 text-sm dark:bg-white/5"
            >
              <span className="truncate">{f.file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-2 shrink-0 text-red-600"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
        비공개로 등록 (작성자와 관리자만 볼 수 있어요)
      </label>

      {isAdmin && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isNotice}
            onChange={(e) => setIsNotice(e.target.checked)}
          />
          공지사항으로 등록
        </label>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting ? "등록 중..." : "등록하기"}
      </button>
    </form>
  );
}
