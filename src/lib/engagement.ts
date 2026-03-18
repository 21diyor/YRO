import * as React from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isDbPostId(id: string): boolean {
  return UUID_REGEX.test(id);
}

export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export function usePostLikes(postId: string | undefined) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = React.useState(0);
  const [liked, setLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetch = React.useCallback(async () => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    setLikeCount(count ?? 0);
    if (user) {
      const { data } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      setLiked(!!data);
    } else {
      setLiked(false);
    }
  }, [postId, user?.id]);

  React.useEffect(() => {
    void fetch();
  }, [fetch]);

  const toggleLike = async (): Promise<"ok" | "signed_out" | "error"> => {
    if (!postId || !supabase) return "error";
    if (!user) return "signed_out";
    if (!isDbPostId(postId)) return "ok"; // no-op for local posts
    setLoading(true);
    try {
      if (liked) {
        const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
        if (error) throw error;
        setLikeCount((c) => Math.max(0, c - 1));
        setLiked(false);
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
        setLikeCount((c) => c + 1);
        setLiked(true);
      }
      return "ok";
    } catch {
      return "error";
    } finally {
      setLoading(false);
    }
  };

  return { likeCount, liked, loading, toggleLike, refetch: fetch };
}

export function usePostComments(postId: string | undefined) {
  const [comments, setComments] = React.useState<CommentRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetch = React.useCallback(async () => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("id,post_id,user_id,body,created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments((data as CommentRow[]) ?? []);
    setLoading(false);
  }, [postId]);

  React.useEffect(() => {
    void fetch();
  }, [fetch]);

  return { comments, loading, refetch: fetch };
}

export function useCommentCount(postId: string | undefined) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .then(({ count: c }) => setCount(c ?? 0));
  }, [postId]);

  return count;
}

export function useShareCount(postId: string | undefined) {
  const [shareCount, setShareCount] = React.useState(0);

  const fetch = React.useCallback(async () => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    const { data } = await supabase.from("posts").select("share_count").eq("id", postId).single();
    if (data && typeof (data as { share_count?: number }).share_count === "number") {
      setShareCount((data as { share_count: number }).share_count);
    }
  }, [postId]);

  React.useEffect(() => {
    void fetch();
  }, [fetch]);

  const incrementShare = async () => {
    if (!postId || !isDbPostId(postId) || !supabase) return;
    await supabase.rpc("increment_post_share_count", { p_post_id: postId });
    setShareCount((c) => c + 1);
  };

  return { shareCount, incrementShare, refetch: fetch };
}
