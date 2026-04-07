import React from 'react';
import { Link } from 'react-router-dom';
import { PostCard } from './PostCard';
import { type FilterTab, type Post } from '../data';
import { Search } from 'lucide-react';
import { getFilteredPostsFromList } from '../lib/posts';
import { PostHoverPreview } from './ui/post-hover-preview';
import { useLanguage } from '../providers/LanguageProvider';
import { t } from '../lib/i18n';

interface PostListSectionProps {
  filter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  excludeFeatured?: boolean;
  showAll?: boolean;
  posts: Post[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const TAB_KEYS: { id: FilterTab; key: import('../lib/i18n').TranslationKey }[] = [
  { id: 'latest', key: 'post_latest' },
  { id: 'top', key: 'post_top' },
  { id: 'discussions', key: 'post_discussions' },
];

export const PostListSection: React.FC<PostListSectionProps> = ({
  filter,
  onFilterChange,
  excludeFeatured = false,
  showAll = false,
  posts,
  searchQuery = '',
  onSearchChange,
}) => {
  const { lang } = useLanguage();
  const filteredPosts = getFilteredPostsFromList(posts, filter, excludeFeatured, searchQuery);
  const displayPosts = showAll ? filteredPosts : filteredPosts.slice(0, 3);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-8 border-b border-gray-100 dark:border-[#222222] pb-4">
        <div className="flex gap-6">
          {TAB_KEYS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`text-sm font-medium pb-4 -mb-4 transition-colors ${
                filter === tab.id
                  ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
                  : 'text-gray-500 dark:text-[#666666] hover:text-black dark:hover:text-white border-b-2 border-transparent'
              }`}
            >
              {t(lang, tab.key)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {onSearchChange ? (
            <label className="flex items-center gap-2 text-gray-500 dark:text-[#666666] focus-within:text-black dark:focus-within:text-white">
              <Search size={18} />
              <input
                type="search"
                placeholder={t(lang, "post_search_placeholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-36 sm:w-44 py-1.5 px-2 text-sm border border-gray-200 dark:border-[#2e2e2e] dark:bg-[#161616] dark:text-[#ededed] dark:placeholder-[#555555] rounded-md focus:outline-none focus:border-gray-400 dark:focus:border-[#444444]"
              />
            </label>
          ) : (
            <Link to="/archive" className="p-2 text-gray-400 dark:text-[#555555] hover:text-black dark:hover:text-white" aria-label="Search">
              <Search size={18} />
            </Link>
          )}
        </div>
      </div>

      <PostHoverPreview posts={displayPosts}>
        {({ onMouseEnter, onMouseLeave, hoveredId }) => (
          <div className="flex flex-col">
            {displayPosts.map((post, index) => (
              <div
                key={post.id}
                onMouseEnter={() => onMouseEnter(post.id)}
                onMouseLeave={onMouseLeave}
              >
                <PostCard post={post} index={index} dimmed={hoveredId !== null && hoveredId !== post.id} />
              </div>
            ))}
          </div>
        )}
      </PostHoverPreview>
    </>
  );
};
