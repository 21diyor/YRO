import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { PostListSection } from '../components/PostListSection';
import { SidebarProfileSection, SubscribeBlock } from '../components/SidebarProfileSection';
import { type FilterTab } from '../data';
import { usePublishedPosts } from '../lib/posts';

export const Archive = () => {
  const [filter, setFilter] = useState<FilterTab>('latest');
  const [searchParams, setSearchParams] = useSearchParams();
  const qFromUrl = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const location = useLocation();
  const { posts, loading, error } = usePublishedPosts();

  useEffect(() => {
    setSearchQuery(qFromUrl);
  }, [qFromUrl]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      setSearchParams({ q: q.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              {error && (
                <p className="mb-4 text-sm text-red-600">{error}</p>
              )}
              {loading ? (
                <p className="text-sm text-gray-500">Loading posts…</p>
              ) : posts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600 mb-2">No published posts yet.</p>
                  <p className="text-sm text-gray-500">
                    Publish a post from the Admin panel to see it here.
                  </p>
                </div>
              ) : (
                <PostListSection
                  filter={filter}
                  onFilterChange={setFilter}
                  excludeFeatured={false}
                  showAll={true}
                  posts={posts}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                />
              )}
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-12">
                <SidebarProfileSection fromPath={location.pathname} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mb-12">
            <img src="/Logo.png" alt="Youth Research Office" className="h-12 w-auto object-contain mb-4" />
            <h2 className="text-lg font-bold mb-2">Youth Research Office</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Insights for policymakers and entrepreneurs creating the future of Uzbekistan.
            </p>
            <SubscribeBlock fromPath={location.pathname} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm font-medium text-gray-600">
            <Link to="/about" className="hover:text-black">About</Link>
            <Link to="/archive" className="hover:text-black">Archive</Link>
            <a href="#" className="hover:text-black">Recommendations</a>
            <a href="#" className="hover:text-black">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
