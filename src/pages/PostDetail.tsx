import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { CommentSection } from '../components/CommentSection';
import { SharePostModal } from '../components/SharePostModal';
import { SignUpModal } from '../components/SignUpModal';
import { PostImage } from '../components/PostImage';
import { Heart, MessageSquare, Share2, Lightbulb, ArrowLeft, Bookmark } from 'lucide-react';
import { usePostById, usePublishedPosts, localizePost } from '../lib/posts';
import { usePostLikes, usePostComments, useShareCount, isDbPostId } from '../lib/engagement';
import { useLanguage } from '../providers/LanguageProvider';
import { t } from '../lib/i18n';
import { useRequireAuth } from '../lib/subscription';
import { useToggleSave } from '../lib/savedPosts';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PostHoverPreview } from '../components/ui/post-hover-preview';

const SUBSCRIBE_MODAL_KEY = 'yro-subscribe-modal-dismissed-date';

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const wasDismissedToday = () => {
  try {
    return localStorage.getItem(SUBSCRIBE_MODAL_KEY) === getTodayDate();
  } catch {
    return false;
  }
};

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { post } = usePostById(id);
  const { posts } = usePublishedPosts();
  const { lang } = useLanguage();
  const localizedPost = post ? localizePost(post, lang) : post;
  const otherPosts = posts.filter((p) => p.id !== id).slice(0, 4);

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [engagementError, setEngagementError] = useState<string | null>(null);
  const hasShownNewsletterRef = useRef(false);
  const viewTrackedIdRef = useRef<string | null>(null);

  // Track view once per unique post ID (ref persists across navigations, so track by id)
  useEffect(() => {
    if (!id || !isDbPostId(id) || !isSupabaseConfigured || !supabase) return;
    if (viewTrackedIdRef.current === id) return;
    viewTrackedIdRef.current = id;
    void supabase.rpc('increment_post_view', { p_post_id: id });
  }, [id]);

  const { likeCount, liked, loading: likeLoading, error: likeError, toggleLike } = usePostLikes(id);
  const { comments, loading: commentsLoading, error: commentsError, refetch: refetchComments } = usePostComments(id);
  const { shareCount, error: shareError, incrementShare } = useShareCount(id);
  const { saved, toggling: saveToggling, toggleSave } = useToggleSave(id);

  const openSignUp = useCallback(() => setShowSignUpModal(true), []);
  const requireAuth = useRequireAuth(openSignUp);

  useEffect(() => {
    setEngagementError(likeError ?? shareError ?? commentsError ?? null);
  }, [likeError, shareError, commentsError]);

  // Newsletter prompt after scrolling (separate from auth)
  useEffect(() => {
    if (!post || wasDismissedToday()) return;

    const checkScroll = () => {
      if (hasShownNewsletterRef.current || wasDismissedToday()) return;
      if (window.scrollY > 300) {
        hasShownNewsletterRef.current = true;
        setShowNewsletterModal(true);
      }
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [post]);

  const handleCloseNewsletterModal = () => {
    setShowNewsletterModal(false);
    try { localStorage.setItem(SUBSCRIBE_MODAL_KEY, getTodayDate()); } catch (_) {}
  };

  const handleLikeClick = async () => {
    setEngagementError(null);
    if (!requireAuth()) return;
    await toggleLike();
  };

  const handleSaveClick = () => {
    requireAuth(async () => {
      await toggleSave();
    });
  };

  const handleShareClick = () => {
    requireAuth(() => setShowShareModal(true));
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-[#0f0f0f]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center dark:bg-[#0f0f0f]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-[#aaaaaa] mb-4">{t(lang, "post_not_found")}</p>
            <Link to="/" className="text-accent hover:underline">{t(lang, "post_return_home")}</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans dark:bg-[#0f0f0f] dark:text-[#ededed]">
      <Navbar />

      {/* Sign-up modal (for likes/comments/saves) */}
      <SignUpModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} />

      {/* Newsletter modal (scroll-triggered, separate concern) */}
      {showNewsletterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseNewsletterModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
            <button
              onClick={handleCloseNewsletterModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <img src="/Logo.png" alt="YRO" className="w-12 h-12 mx-auto mb-4 object-contain rounded-full" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enjoying this research?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Subscribe to get new insights from Youth Research Office delivered to your inbox.
            </p>
            <Link
              to="/subscribe"
              onClick={handleCloseNewsletterModal}
              className="block w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors text-sm"
            >
              Subscribe for free
            </Link>
            <button
              onClick={handleCloseNewsletterModal}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {post && (
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={post.title}
          url={typeof window !== "undefined" ? window.location.href : ""}
          onCopy={() => void incrementShare()}
          onNativeShare={() => void incrementShare()}
          shareCount={shareCount}
        />
      )}

      <main className="flex-grow relative">
        <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:block w-px h-32 bg-gray-200">
          <div className="absolute left-0 top-0 w-1 h-1 bg-gray-400 rounded-full -translate-x-1/2" />
          <div className="absolute left-0 top-1/2 w-1 h-1 bg-gray-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-0 bottom-0 w-1 h-1 bg-gray-400 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#666666] hover:text-black dark:hover:text-white mb-8 transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            {t(lang, "post_back")}
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] dark:text-[#ededed] leading-tight mb-4">
              {localizedPost!.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-[#a0a0a0] leading-relaxed mb-6">
              {localizedPost!.summary}
            </p>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/Logo.png"
                alt="YRO"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#ededed] uppercase tracking-wider">{t(lang, "post_yro_team")}</p>
                <p className="text-xs text-gray-500 dark:text-[#666666]">{post.date} • {post.category}</p>
              </div>
            </div>

            {/* Engagement bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Like */}
              <button
                type="button"
                onClick={handleLikeClick}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors text-sm ${
                  liked
                    ? "text-red-500 border-red-200 bg-red-50/50"
                    : "text-gray-600 border-gray-200 hover:border-gray-300 hover:text-black"
                }`}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
                <span>{id && isDbPostId(id) ? likeCount : (post.engagement?.likes ?? 0)}</span>
              </button>

              {/* Comments anchor */}
              <a
                href="#comments"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-black transition-colors text-sm"
              >
                <MessageSquare size={16} />
                <span>{comments.length}</span>
              </a>

              {/* Save */}
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={saveToggling}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors text-sm ${
                  saved
                    ? "text-amber-600 border-amber-200 bg-amber-50/50"
                    : "text-gray-600 border-gray-200 hover:border-gray-300 hover:text-black"
                }`}
                aria-label={saved ? t(lang, "post_saved") : t(lang, "post_save")}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                <span className="hidden sm:inline">{saved ? t(lang, "post_saved") : t(lang, "post_save")}</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShareClick}
                className="ml-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Share2 size={16} />
                {t(lang, "post_share")} {shareCount > 0 && `(${shareCount})`}
              </button>
            </div>

            {engagementError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {engagementError}
              </div>
            )}
          </div>

          {/* Featured image */}
          <div className="mb-10 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <PostImage
              src={post.image}
              alt={post.title}
              className="w-full min-h-[320px] sm:min-h-[400px] object-contain object-center bg-gray-50"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Article content */}
          <article className="prose prose-gray prose-lg max-w-none mb-16 text-base sm:text-lg dark:prose-invert">
            <div className="whitespace-pre-line text-gray-700 dark:text-[#c4c4c4] leading-relaxed">
              {localizedPost!.content}
            </div>
          </article>

          <CommentSection
            postId={post.id}
            comments={comments}
            loading={commentsLoading}
            onRefetch={refetchComments}
            onSignUpRequired={openSignUp}
          />

          {/* More Research */}
          <section className="border-t border-gray-100 dark:border-[#222222] pt-12">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-[#ededed] mb-6">
              <Lightbulb size={22} className="text-amber-500" />
              {t(lang, "post_more_research")}
            </h2>
            <PostHoverPreview posts={otherPosts}>
              {({ onMouseEnter, onMouseLeave, hoveredId }) => (
                <ul className="space-y-4">
                  {otherPosts.map((p) => (
                    <li
                      key={p.id}
                      onMouseEnter={() => onMouseEnter(p.id)}
                      onMouseLeave={onMouseLeave}
                      className="transition-opacity duration-200"
                      style={{ opacity: hoveredId !== null && hoveredId !== p.id ? 0.4 : 1 }}
                    >
                      <Link to={`/post/${p.id}`} className="flex items-start gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          <PostImage src={p.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-[#ededed] group-hover:underline">{localizePost(p, lang).title}</h3>
                          <p className="text-sm text-gray-500 dark:text-[#666666] line-clamp-1">{localizePost(p, lang).summary}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </PostHoverPreview>
          </section>
        </div>
      </main>
    </div>
  );
};
