import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, Heart, MessageSquare } from 'lucide-react';
import { Post } from '../data';
import { PostImage } from './PostImage';
import { usePostCardEngagement, isDbPostId } from '../lib/engagement';

interface PostCardProps {
  post: Post;
  index: number;
}

function EngagementCounts({ post }: { post: Post }) {
  const { likeCount, commentCount } = usePostCardEngagement(
    isDbPostId(post.id) ? post.id : undefined
  );

  const views = isDbPostId(post.id) ? (post.viewCount ?? 0) : (post.engagement?.likes ?? 0);
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

export const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  return (
    <Link to={`/post/${post.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex gap-8 py-8 border-b border-gray-100 group cursor-pointer"
      >
        <div className="flex-grow">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:underline leading-tight">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2 leading-relaxed">
            {post.summary}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
            <span className="uppercase tracking-wider">{post.date}</span>
            <span>•</span>
            <span className="uppercase tracking-wider">YRO Research</span>
          </div>
          <EngagementCounts post={post} />
        </div>

        <div className="w-40 h-28 sm:w-52 sm:h-36 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
          <PostImage
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </Link>
  );
};
