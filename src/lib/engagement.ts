import * as React from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/providers/AuthProvider";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isDbPostId(id: string): boolean {
  return UUID_REGEX.test(id);
}

function getSupabaseErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
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
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    setError(null);
    try {
      const { count, error: countError } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      if (countError) throw countError;
      setLikeCount(count ?? 0);

      if (user) {
        const { data, error: likedError } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (likedError) throw likedError;
        setLiked(!!data);
      } else {
        setLiked(false);
      }
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to load likes."));
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
    setError(null);
    try {
      if (liked) {
        const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
      await fetch();
      return "ok";
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to update like."));
      return "error";
    } finally {
      setLoading(false);
    }
  };

  return { likeCount, liked, loading, error, toggleLike, refetch: fetch };
}

export function usePostComments(postId: string | undefined) {
  const [comments, setComments] = React.useState<CommentRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("comments")
        .select("id,post_id,user_id,body,created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (fetchError) throw fetchError;
      setComments((data as CommentRow[]) ?? []);
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to load comments."));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  React.useEffect(() => {
    void fetch();
  }, [fetch]);

  return { comments, loading, error, refetch: fetch };
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
  const [error, setError] = React.useState<string | null>(null);

  const fetch = React.useCallback(async () => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.from("posts").select("share_count").eq("id", postId).single();
      if (fetchError) throw fetchError;
      if (data && typeof (data as { share_count?: number }).share_count === "number") {
        setShareCount((data as { share_count: number }).share_count);
      }
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to load share count."));
    }
  }, [postId]);

  React.useEffect(() => {
    void fetch();
  }, [fetch]);

  const incrementShare = async (): Promise<"ok" | "error"> => {
    if (!postId || !isDbPostId(postId) || !supabase) return;
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("increment_post_share_count", { p_post_id: postId });
      if (rpcError) throw rpcError;
      await fetch();
      return "ok";
    } catch (err: unknown) {
      setError(getSupabaseErrorMessage(err, "Failed to record share."));
      return "error";
    }
  };

  return { shareCount, error, incrementShare, refetch: fetch };
}

export function usePostCardEngagement(postId: string | undefined) {
  const [likeCount, setLikeCount] = React.useState(0);
  const [commentCount, setCommentCount] = React.useState(0);

  React.useEffect(() => {
    if (!postId || !isDbPostId(postId) || !isSupabaseConfigured || !supabase) return;
    void Promise.all([
      supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", postId),
      supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", postId),
    ]).then(([likesRes, commentsRes]) => {
      setLikeCount(likesRes.count ?? 0);
      setCommentCount(commentsRes.count ?? 0);
    });
  }, [postId]);

  return { likeCount, commentCount };
}
