import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, Archive, Info } from "lucide-react";
import { TubelightNavbar } from "./ui/tubelight-navbar";

const navItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Archive", url: "/archive", icon: Archive },
  { name: "About", url: "/about", icon: Info },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");

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
            <Link
              to="/subscribe"
              state={{ from: pathname }}
              className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Subscribe
            </Link>
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
