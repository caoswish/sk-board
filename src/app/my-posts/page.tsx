import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostListItem from "@/components/post-list-item";

export default async function MyPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: posts, error } = await supabase
    .from("posts_public")
    .select(
      "id, title, content, author, created_at, is_notice, is_private, user_id"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">내 글</h1>

      {error ? (
        <p className="text-red-600">
          글 목록을 불러오지 못했어요: {error.message}
        </p>
      ) : !posts || posts.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          아직 작성한 글이 없어요.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 dark:divide-white/10">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
