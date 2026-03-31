import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SubscribeModal } from '../components/SubscribeModal';
import { CommentSection } from '../components/CommentSection';
import { SharePostModal } from '../components/SharePostModal';
import { PostImage } from '../components/PostImage';
import { Heart, MessageSquare, Share2, Lightbulb, ArrowLeft } from 'lucide-react';
import { usePostById, usePublishedPosts } from '../lib/posts';
import { usePostLikes, usePostComments, useShareCount, isDbPostId } from '../lib/engagement';
import { useRequireSubscription } from '../lib/subscription';

const SUBSCRIBE_MODAL_KEY = 'yro-subscribe-modal-dismissed-date';

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const wasDismissedToday = () => {
  try {
    const stored = localStorage.getItem(SUBSCRIBE_MODAL_KEY);
    return stored === getTodayDate();
  } catch {
    return false;
  }
};

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { post } = usePostById(id);
  const { posts } = usePublishedPosts();
  const otherPosts = posts.filter((p) => p.id !== id).slice(0, 4);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [likeMessage, setLikeMessage] = useState<string | null>(null);
  const [engagementError, setEngagementError] = useState<string | null>(null);
  const hasShownRef = useRef(false);
  const { likeCount, liked, loading: likeLoading, error: likeError, toggleLike } = usePostLikes(id);
  const { comments, loading: commentsLoading, error: commentsError, refetch: refetchComments } = usePostComments(id);
  const { shareCount, error: shareError, incrementShare } = useShareCount(id);
  const requireSub = useRequireSubscription();

  useEffect(() => {
    setEngagementError(likeError ?? shareError ?? commentsError ?? null);
  }, [likeError, shareError, commentsError]);

  useEffect(() => {
    if (!post) return;
    if (wasDismissedToday()) return;

    const checkScroll = () => {
      if (hasShownRef.current) return;
      if (wasDismissedToday()) return;
      if (window.scrollY > 300) {
        hasShownRef.current = true;
        setShowSubscribeModal(true);
      }
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [post]);

  const handleCloseSubscribeModal = () => {
    setShowSubscribeModal(false);
    try {
      localStorage.setItem(SUBSCRIBE_MODAL_KEY, getTodayDate());
    } catch (_) {}
  };

  const handleShareClick = () => requireSub(() => setShowShareModal(true));
  const handleShareCopy = () => void incrementShare();
  const handleShareNative = () => void incrementShare();

  const handleLikeClick = async () => {
    setLikeMessage(null);
    setEngagementError(null);
    if (!requireSub()) return;
    const result = await toggleLike();
    if (result === "signed_out") {
      setLikeMessage("sign_in");
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Post not found</p>
            <Link to="/" className="text-accent hover:underline">Return home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <SubscribeModal isOpen={showSubscribeModal} onClose={handleCloseSubscribeModal} />
      {post && (
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={post.title}
          url={typeof window !== "undefined" ? window.location.href : ""}
          onCopy={handleShareCopy}
          onNativeShare={handleShareNative}
          shareCount={shareCount}
        />
      )}

      <main className="flex-grow relative">
        {/* Left vertical progress marker */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:block w-px h-32 bg-gray-200">
          <div className="absolute left-0 top-0 w-1 h-1 bg-gray-400 rounded-full -translate-x-1/2" />
          <div className="absolute left-0 top-1/2 w-1 h-1 bg-gray-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-0 bottom-0 w-1 h-1 bg-gray-400 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Back link */}
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          {/* Article header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6">
              {post.summary}
            </p>

            {/* Author and date */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/Logo.png"
                alt="YRO"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  YRO Team
                </p>
                <p className="text-xs text-gray-500">
                  {post.date} • {post.category}
                </p>
              </div>
            </div>

            {/* Engagement and share */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLikeClick}
                  disabled={likeLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors text-sm ${liked ? "text-red-500 border-red-200 bg-red-50/50" : "text-gray-600 border-gray-200 hover:border-gray-300 hover:text-black"}`}
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  <span>{id && isDbPostId(id) ? likeCount : (post.engagement?.likes ?? 0)}</span>
                </button>
                {likeMessage === "sign_in" && (
                  <span className="text-xs text-gray-500">
                    <Link to="/subscribe" className="text-accent hover:underline">Sign in</Link> to like
                  </span>
                )}
              </div>
              <a
                href="#comments"
                onClick={(e) => {
                  if (!requireSub()) e.preventDefault();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-black transition-colors text-sm"
              >
                <MessageSquare size={16} />
                <span>{comments.length}</span>
              </a>
              <button
                type="button"
                onClick={handleShareClick}
                className="ml-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Share2 size={16} />
                Share {shareCount > 0 && `(${shareCount})`}
              </button>
            </div>

            {engagementError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {engagementError}
              </div>
            )}
          </div>

          {/* Featured image - larger so infographics are readable */}
          <div className="mb-10 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <PostImage
              src={post.image}
              alt={post.title}
              className="w-full min-h-[320px] sm:min-h-[400px] object-contain object-center bg-gray-50"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Article content - larger base font for readability */}
          <article className="prose prose-gray prose-lg max-w-none mb-16 text-base sm:text-lg">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </article>

          <CommentSection
            postId={post.id}
            comments={comments}
            loading={commentsLoading}
            onRefetch={refetchComments}
          />

          {/* This Week's Big Ideas / More Research */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
              <Lightbulb size={22} className="text-amber-500" />
              More Research
            </h2>
            <ul className="space-y-4">
              {otherPosts.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/post/${p.id}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <PostImage
                        src={p.image}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:underline">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{p.summary}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};
