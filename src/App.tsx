import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SidebarProfileSection, SubscribeBlock } from './components/SidebarProfileSection';
import { Hero } from './components/Hero';
import { PostListSection } from './components/PostListSection';
import { type FilterTab } from './data';
import { ChevronRight, Rocket, GraduationCap, BarChart3 } from 'lucide-react';
import { usePublishedPosts } from './lib/posts';
import { useLanguage } from './providers/LanguageProvider';
import { t } from './lib/i18n';

export default function App() {
  const [filter, setFilter] = useState<FilterTab>('latest');
  const location = useLocation();
  const { posts, loading } = usePublishedPosts();
  const { lang } = useLanguage();
  const recommendations = [
    { title: "Uzbekistan Startup Ecosystem", author: "YRO Research", Icon: Rocket },
    { title: "Higher Education Trends", author: "YRO Research", Icon: GraduationCap },
    { title: "Labor Market Analysis", author: "YRO Research", Icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans dark:bg-[#0f0f0f] dark:text-[#ededed]">
      <Navbar />
      
      <main className="flex-grow">
        <Hero posts={posts} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <PostListSection
                filter={filter}
                onFilterChange={setFilter}
                excludeFeatured={true}
                showAll={false}
                posts={posts}
              />

              <Link
                to="/archive"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium bg-gray-100 dark:bg-[#1e1e1e] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-800 dark:text-[#c4c4c4] px-4 py-2 rounded transition-colors"
              >
                {t(lang, "post_see_all")} <ChevronRight size={16} />
              </Link>
            </div>
            
            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-12">
                <SidebarProfileSection fromPath={location.pathname} />
                
                {/* Recommendations */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#666666]">{t(lang, "sidebar_recommendations")}</h3>
                    <Link to="/archive" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#555555] hover:text-black dark:hover:text-white">
                      {t(lang, "sidebar_view_all")}
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {recommendations.map((rec, i) => (
                      <Link
                        key={i}
                        to="/archive"
                        className="flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg flex items-center justify-center shrink-0 border border-gray-200 dark:border-[#2a2a2a]">
                          <rec.Icon size={17} className="text-gray-600 dark:text-[#999999]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold dark:text-[#ededed] group-hover:underline">{rec.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-[#666666]">{rec.author}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-[#1e1e1e] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mb-12">
            <img src="/Logo.png" alt="Youth Research Office" className="h-12 w-auto object-contain mb-4" />
            <h2 className="text-lg font-bold dark:text-[#ededed] mb-2">{t(lang, "sidebar_title")}</h2>
            <p className="text-sm text-gray-600 dark:text-[#a0a0a0] leading-relaxed mb-6">
              {t(lang, "footer_description")}
            </p>
            <SubscribeBlock fromPath={location.pathname} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm font-medium text-gray-600 dark:text-[#a0a0a0]">
            <Link to="/about" className="hover:text-black dark:hover:text-white">{t(lang, "footer_about")}</Link>
            <Link to="/archive" className="hover:text-black dark:hover:text-white">{t(lang, "footer_archive")}</Link>
            <Link to="/archive" className="hover:text-black dark:hover:text-white">{t(lang, "footer_recommendations")}</Link>
            <Link to="/archive" className="hover:text-black dark:hover:text-white">{t(lang, "footer_sitemap")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
