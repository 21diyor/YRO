import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, Archive, Info, User as UserIcon, LogOut, ChevronDown, Bookmark, Moon, Sun } from "lucide-react";
import { TubelightNavbar } from "./ui/tubelight-navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/i18n";
import { useSavedPosts } from "@/lib/savedPosts";
import { SignUpModal } from "@/components/SignUpModal";

const NAV_KEYS = [
  { key: "nav_home" as const, url: "/", icon: Home },
  { key: "nav_archive" as const, url: "/archive", icon: Archive },
  { key: "nav_about" as const, url: "/about", icon: Info },
];

function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const { user, displayName, signOut } = useAuth();
  const { posts: savedPosts } = useSavedPosts();
  const { lang } = useLanguage();

  if (!user) return null;

  return (
    <div
      role="menu"
      className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-100 dark:border-[#222222] bg-white dark:bg-[#161616] shadow-lg overflow-hidden"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[#222222]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] text-gray-700 dark:text-[#c4c4c4] font-semibold text-sm uppercase shrink-0">
            {(displayName || user.email || "?").charAt(0)}
          </span>
          <div className="min-w-0">
            {displayName && (
              <p className="text-sm font-semibold text-gray-900 dark:text-[#ededed] truncate">{displayName}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-[#777777] truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Saved posts */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[#222222]">
        <p className="text-xs font-semibold text-gray-400 dark:text-[#555555] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Bookmark size={12} />
          {t(lang, "nav_saved_posts")}
        </p>
        {savedPosts.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-[#555555] py-1">{t(lang, "nav_no_saved")}</p>
        ) : (
          <ul className="space-y-1.5">
            {savedPosts.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Link
                  to={`/post/${p.id}`}
                  onClick={onClose}
                  className="block text-xs text-gray-700 dark:text-[#c4c4c4] hover:text-black dark:hover:text-white hover:underline line-clamp-1"
                >
                  {p.title}
                </Link>
              </li>
            ))}
            {savedPosts.length > 4 && (
              <li className="text-xs text-gray-400 dark:text-[#555555]">{savedPosts.length - 4} more…</li>
            )}
          </ul>
        )}
      </div>

      {/* Sign out */}
      <button
        type="button"
        role="menuitem"
        onClick={async () => {
          onClose();
          await signOut();
        }}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-[#c4c4c4] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
      >
        <LogOut size={16} className="text-gray-500 dark:text-[#777777]" />
        {t(lang, "nav_sign_out")}
      </button>
    </div>
  );
}

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");
  const { user, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navItems = NAV_KEYS.map((n) => ({ name: t(lang, n.key), url: n.url, icon: n.icon }));

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) navigate(`/archive?q=${encodeURIComponent(q)}`);
    else navigate("/archive");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f0f0f]/95 border-b border-gray-100 dark:border-[#1e1e1e] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
              <img src="/Logo.png" alt="Youth Research Office" className="h-14 w-auto object-contain" />
            </Link>

            <div className="hidden md:flex flex-1 justify-center">
              <TubelightNavbar items={navItems} />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <form onSubmit={handleSearch} className="flex items-center hidden sm:flex">
                <input
                  type="search"
                  placeholder={t(lang, "nav_search_placeholder")}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-28 sm:w-36 py-1.5 pl-2 pr-8 text-sm border border-gray-200 dark:border-[#2e2e2e] dark:bg-[#161616] dark:text-[#ededed] dark:placeholder-[#555555] rounded-md focus:outline-none focus:border-gray-400 dark:focus:border-[#444444]"
                  aria-label="Search posts"
                />
                <button type="submit" className="-ml-7 p-2 text-gray-500 hover:text-black" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>
              <Link to="/archive" className="p-2 text-gray-500 hover:text-black sm:hidden" aria-label="Search">
                <Search size={20} />
              </Link>

              {/* Language switcher */}
              <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-gray-200 dark:border-[#2e2e2e] overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-1 transition-colors ${lang === "en" ? "bg-gray-900 dark:bg-[#ededed] text-white dark:text-[#0f0f0f]" : "text-gray-500 dark:text-[#666666] hover:text-gray-800 dark:hover:text-[#c4c4c4]"}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("uz")}
                  className={`px-2.5 py-1 transition-colors ${lang === "uz" ? "bg-gray-900 dark:bg-[#ededed] text-white dark:text-[#0f0f0f]" : "text-gray-500 dark:text-[#666666] hover:text-gray-800 dark:hover:text-[#c4c4c4]"}`}
                >
                  UZ
                </button>
              </div>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-[#777777] hover:text-gray-900 dark:hover:text-[#ededed] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {authLoading ? (
                <div className="h-9 w-24 rounded-md bg-gray-100 animate-pulse" aria-hidden />
              ) : user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-[#2e2e2e] bg-white dark:bg-[#161616] px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-[#c4c4c4] hover:border-gray-300 dark:hover:border-[#444444] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] text-gray-700 dark:text-[#c4c4c4] text-xs font-semibold uppercase">
                      <UserIcon size={14} />
                    </span>
                    <span className="hidden sm:inline">{t(lang, "nav_account")}</span>
                    <ChevronDown size={16} className="text-gray-500 dark:text-[#555555]" />
                  </button>

                  {menuOpen && <ProfileDropdown onClose={() => setMenuOpen(false)} />}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSignUp(true)}
                    className="text-sm text-gray-600 dark:text-[#a0a0a0] hover:text-black dark:hover:text-white transition-colors"
                  >
                    {t(lang, "nav_sign_in")}
                  </button>
                  <Link
                    to="/subscribe"
                    state={{ from: pathname }}
                    className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
                  >
                    {t(lang, "nav_subscribe")}
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* Mobile: pill nav below header */}
          <div className="md:hidden flex justify-center pb-3">
            <TubelightNavbar items={navItems} />
          </div>
        </div>
      </header>

      <SignUpModal isOpen={showSignUp} onClose={() => setShowSignUp(false)} />
    </>
  );
};
