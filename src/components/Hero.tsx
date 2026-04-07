import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { posts as defaultPosts } from '../data';
import type { Post } from '../data';
import { Globe } from './ui/globe';
import { BackgroundPaperShaders } from './ui/background-paper-shaders';
import { PostImage } from './PostImage';
import { usePostLikes, useShareCount, useCommentCount, isDbPostId } from '../lib/engagement';
import { useRequireSubscription } from '../lib/subscription';
import { useLanguage } from '../providers/LanguageProvider';
import { localizePost } from '../lib/posts';
import { t } from '../lib/i18n';

interface HeroProps {
  posts?: Post[];
}

export const Hero = ({ posts = defaultPosts }: HeroProps) => {
  const featured = posts[0];
  const { lang } = useLanguage();
  const localizedFeatured = featured ? localizePost(featured, lang) : featured;
  const [localLiked, setLocalLiked] = React.useState(false);
  const { likeCount, liked: dbLiked, loading: likeLoading, error: likeError, toggleLike } = usePostLikes(featured?.id);
  const { shareCount, error: shareError, incrementShare } = useShareCount(featured?.id);
  const commentCount = useCommentCount(featured?.id);
  const requireSub = useRequireSubscription();
  const isDb = featured ? isDbPostId(featured.id) : false;
  const liked = isDb ? dbLiked : localLiked;
  const displayLikeCount = isDb ? likeCount : (featured?.engagement?.likes ?? 0) + (localLiked ? 1 : 0);
  const postUrl = featured && typeof window !== "undefined" ? `${window.location.origin}/post/${featured.id}` : "";

  const handleShare = () => {
    if (!featured) return;
    if (!requireSub()) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: featured.title, url: postUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(postUrl);
    }
    void incrementShare();
  };

  const handleLike = () => {
    if (!requireSub()) return;
    if (isDb) void toggleLike();
    else setLocalLiked((v) => !v);
  };

  if (!featured) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
      {/* Globe hero (separate from featured preview) */}
      <div className="relative rounded-2xl border border-gray-100 dark:border-[#222222] bg-white dark:bg-[#0f0f0f] overflow-hidden">
        <div className="relative h-[340px] sm:h-[390px] lg:h-[420px] overflow-hidden">
          <BackgroundPaperShaders
            className="absolute inset-0 opacity-[0.14] pointer-events-none"
            color1="#a39289"
            color2="#ffffff"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(163,146,137,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_55%,rgba(163,146,137,0.12),rgba(0,0,0,0))]" />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center pt-10 sm:pt-12 z-10">
            <span className="select-none text-center text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-gray-900/85 dark:text-[#ededed]/85">
              {t(lang, "sidebar_title")}
            </span>
            <span className="mt-3 h-px w-24 bg-gradient-to-r from-transparent via-gray-300 dark:via-[#444444] to-transparent" />
          </div>

          <Globe className="top-16 max-w-[460px] opacity-95" />
        </div>

        <div className="px-6 sm:px-8 lg:px-10 pb-8 pt-6 border-t border-gray-100 dark:border-[#222222]">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#ededed]">
              {t(lang, "hero_tagline")}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-[#aaaaaa] leading-relaxed">
              {t(lang, "hero_description")}
            </p>
          </div>
        </div>
      </div>

      {/* Featured post preview UNDER the globe */}
      <div className="mt-8 rounded-2xl border border-gray-100 dark:border-[#222222] bg-white dark:bg-[#161616] shadow-[0_1px_0_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <Link to={`/post/${featured.id}`} className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/10] lg:aspect-auto lg:h-full bg-gray-50"
            >
              <PostImage
                src={featured.image}
                alt={localizedFeatured.title}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20" />
            </motion.div>
          </Link>

          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-gray-700 border border-gray-200/70">
                  Latest
                </span>
                <span className="text-gray-400">•</span>
                <span>{featured.date}</span>
              </div>

              <Link to={`/post/${featured.id}`} className="block group">
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-gray-900 group-hover:underline">
                  {localizedFeatured.title}
                </h2>
              </Link>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {localizedFeatured.summary}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium text-gray-900">YRO Team</span>
                <span className="text-gray-300">•</span>
                <span className="uppercase tracking-wider text-[10px] font-bold text-gray-500">Research</span>
              </div>

              <div className="pt-2 flex items-center gap-5 text-gray-500">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={isDb && likeLoading}
                  className={`flex items-center gap-1.5 hover:text-gray-900 transition-colors ${liked ? "text-red-500" : ""}`}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  <span className="text-sm">{displayLikeCount}</span>
                </button>
                <Link
                  to={`/post/${featured.id}#comments`}
                  onClick={(e) => {
                    if (!requireSub()) e.preventDefault();
                  }}
                  className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                >
                  <MessageSquare size={18} />
                  <span className="text-sm">{isDb ? commentCount : (featured.engagement?.comments ?? 0)}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                  {shareCount > 0 && <span className="text-sm">{shareCount}</span>}
                </button>
              </div>

              {(isDb && (likeError || shareError)) && (
                <p className="text-xs text-red-600">
                  {likeError ?? shareError}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
