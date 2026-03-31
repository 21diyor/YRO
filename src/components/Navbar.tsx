import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, Archive, Info, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { TubelightNavbar } from "./ui/tubelight-navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useSubscriptionStatus } from "@/lib/subscription";

const navItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Archive", url: "/archive", icon: Archive },
  { name: "About", url: "/about", icon: Info },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");
  const { signOut } = useAuth();
  const { user, subscribed, loading: subscriptionLoading } = useSubscriptionStatus();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) navigate(`/archive?q=${encodeURIComponent(q)}`);
    else navigate("/archive");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-100 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <img src="/Logo.png" alt="Youth Research Office" className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <TubelightNavbar items={navItems} />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <form onSubmit={handleSearch} className="flex items-center hidden sm:flex">
              <input
                type="search"
                placeholder="Search…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-28 sm:w-36 py-1.5 pl-2 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                aria-label="Search posts"
              />
              <button type="submit" className="-ml-7 p-2 text-gray-500 hover:text-black" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
            <Link to="/archive" className="p-2 text-gray-500 hover:text-black sm:hidden" aria-label="Search">
              <Search size={20} />
            </Link>

            {user && subscribed ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 border border-gray-200 text-gray-700">
                    <UserIcon size={16} />
                  </span>
                  <span className="hidden sm:inline">Account</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email ?? user.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={16} className="text-gray-500" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : subscriptionLoading ? (
              <div className="h-9 w-24 rounded-md bg-gray-100 animate-pulse" aria-hidden />
            ) : (
              <Link
                to="/subscribe"
                state={{ from: pathname }}
                className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Subscribe
              </Link>
            )}
          </div>
        </div>
        {/* Mobile: pill nav below header */}
        <div className="md:hidden flex justify-center pb-3">
          <TubelightNavbar items={navItems} />
        </div>
      </div>
    </header>
  );
};
