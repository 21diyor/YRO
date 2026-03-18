import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Post } from '../data';
import { PostImage } from './PostImage';

interface PostCardProps {
  post: Post;
  index: number;
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
