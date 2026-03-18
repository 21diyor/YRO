import React from 'react';
import { Link } from 'react-router-dom';
import { PostCard } from './PostCard';
import { type FilterTab, type Post } from '../data';
import { Search } from 'lucide-react';
import { getFilteredPostsFromList } from '../lib/posts';

interface PostListSectionProps {
  filter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  excludeFeatured?: boolean;
  showAll?: boolean;
  posts: Post[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'latest', label: 'Latest' },
  { id: 'top', label: 'Top' },
  { id: 'discussions', label: 'Discussions' },
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
  const filteredPosts = getFilteredPostsFromList(posts, filter, excludeFeatured, searchQuery);
  const displayPosts = showAll ? filteredPosts : filteredPosts.slice(0, 3);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-4">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`text-sm font-medium pb-4 -mb-4 transition-colors ${
                filter === tab.id
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {onSearchChange ? (
            <label className="flex items-center gap-2 text-gray-500 focus-within:text-black">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search posts…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-36 sm:w-44 py-1.5 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              />
            </label>
          ) : (
            <Link to="/archive" className="p-2 text-gray-400 hover:text-black" aria-label="Search">
              <Search size={18} />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {displayPosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </>
  );
};
