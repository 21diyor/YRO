import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { isDbPostId } from "@/lib/engagement";
import type { CommentRow } from "@/lib/engagement";
import { useSubscriptionStatus } from "@/lib/subscription";

interface CommentSectionProps {
  postId: string;
  comments: CommentRow[];
  loading: boolean;
  onRefetch: () => void;
}

export function CommentSection({ postId, comments, loading, onRefetch }: CommentSectionProps) {
  const { user } = useAuth();
  const { subscribed } = useSubscriptionStatus();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canComment = isSupabaseConfigured && supabase && user && subscribed && isDbPostId(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canComment || !body.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase!
        .from("comments")
        .insert({ post_id: postId, user_id: user!.id, body: body.trim() });
      if (error) throw error;
      setBody("");
      onRefetch();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDb = isDbPostId(postId);

  return (
    <section id="comments" className="border-t border-gray-100 pt-10 mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Comments {isDb && comments.length > 0 && `(${comments.length})`}
      </h2>

      {!isDb && (
        <p className="text-sm text-gray-500 py-4 rounded-lg bg-gray-50 px-4">
          Comments are available for articles published on this site.
        </p>
      )}

      {isDb && canComment && (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-y"
            required
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="mt-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
      )}

      {isDb && (!user || !subscribed) && isSupabaseConfigured && (
        <p className="text-sm text-gray-500 mb-6 rounded-lg bg-gray-50 px-4 py-3">
          <Link to="/subscribe" className="text-accent hover:underline font-medium">
            Subscribe / sign in
          </Link>{" "}
          to comment.
        </p>
      )}

      {isDb && user && !subscribed && isSupabaseConfigured && (
        <button
          type="button"
          onClick={() => navigate("/subscribe", { state: { from: pathname } })}
          className="mb-6 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Subscribe to comment
        </button>
      )}

      {isDb && (loading ? (
        <p className="text-sm text-gray-500 py-4">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 rounded-lg bg-gray-50 px-4">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="py-4 px-4 rounded-lg bg-gray-50/80 border border-gray-100">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
