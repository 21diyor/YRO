import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TubelightNavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface TubelightNavbarProps {
  items: TubelightNavItem[];
  className?: string;
}

function isActivePath(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(url + "/");
}

export function TubelightNavbar({ items, className }: TubelightNavbarProps) {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn(
        "flex items-center gap-1 bg-white/80 border border-gray-200 backdrop-blur-md py-1 px-1 rounded-full shadow-sm",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.url);
        return (
          <NavLink
            key={item.name}
            to={item.url}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-5 py-2 rounded-full transition-colors",
              "text-gray-600 hover:text-gray-900",
              isActive && "text-accent",
            )}
          >
            <span className="hidden md:inline">{item.name}</span>
            <span className="md:hidden inline-flex">
              <Icon size={18} strokeWidth={2.5} />
            </span>
            {isActive && (
              <motion.div
                layoutId="tubelight-lamp"
                className="absolute inset-0 w-full bg-accent/10 rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-t-full">
                  <div className="absolute w-12 h-6 bg-accent/20 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-8 h-6 bg-accent/20 rounded-full blur-md -top-1" />
                  <div className="absolute w-4 h-4 bg-accent/20 rounded-full blur-sm top-0 left-2" />
                </div>
              </motion.div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
