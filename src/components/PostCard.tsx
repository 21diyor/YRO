import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { Post } from '../data';
import { PostImage } from './PostImage';
import { usePostCardEngagement, isDbPostId } from '../lib/engagement';
import { useLanguage } from '../providers/LanguageProvider';
import { localizePost } from '../lib/posts';
import { t } from '../lib/i18n';

interface PostCardProps {
  post: Post;
  index: number;
  dimmed?: boolean;
}

function EngagementCounts({ post }: { post: Post }) {
  const { likeCount, commentCount, viewCount: liveViewCount } = usePostCardEngagement(
    isDbPostId(post.id) ? post.id : undefined
  );

  const views = isDbPostId(post.id) ? (liveViewCount ?? post.viewCount ?? 0) : (post.engagement?.likes ?? 0);
  const likes = isDbPostId(post.id) ? likeCount : (post.engagement?.likes ?? 0);
  const comments = isDbPostId(post.id) ? commentCount : (post.engagement?.comments ?? 0);

  return (
    <div className="flex items-center gap-3 text-gray-400 text-xs mt-2">
      <span className="flex items-center gap-1">
        <Eye size={12} />
        {views}
      </span>
      <span className="flex items-center gap-1">
        <Heart size={12} />
        {likes}
      </span>
      <span className="flex items-center gap-1">
        <MessageSquare size={12} />
        {comments}
      </span>
    </div>
  );
}

export const PostCard: React.FC<PostCardProps> = ({ post, index, dimmed = false }) => {
  const { lang } = useLanguage();
  const localized = localizePost(post, lang);

  return (
    <Link to={`/post/${post.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex gap-8 py-8 border-b border-gray-100 dark:border-[#222222] group cursor-pointer transition-opacity duration-300"
        style={{ opacity: dimmed ? 0.4 : 1 }}
      >
        <div className="flex-grow">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 dark:text-[#ededed] group-hover:underline leading-tight">
            {localized.title}
          </h3>
          <p className="text-gray-600 dark:text-[#a0a0a0] text-sm sm:text-base mb-4 line-clamp-2 leading-relaxed">
            {localized.summary}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-[#666666] font-medium">
            <span className="uppercase tracking-wider">{post.date}</span>
            <span>•</span>
            <span className="uppercase tracking-wider">{t(lang, "post_yro_research")}</span>
          </div>
          <EngagementCounts post={post} />
        </div>

        <div className="w-40 h-28 sm:w-52 sm:h-36 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-200 dark:border-[#262626] shrink-0">
          <PostImage
            src={localized.image}
            alt={localized.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </Link>
  );
};
