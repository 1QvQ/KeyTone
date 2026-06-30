'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Keyboard, Search, GitCompare, LogOut, User } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'DASHBOARD', icon: Keyboard },
    { href: '/search', label: 'SEARCH & FILTERS', icon: Search },
    { href: '/compare', label: 'COMPARE SETUPS', icon: GitCompare },
  ];

  return (
    <nav className="bg-white border-b-2 border-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-slate-900 flex items-center justify-center border-2 border-slate-900 group-hover:bg-emerald-500 group-hover:text-slate-900 text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] group-hover:shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
                <Keyboard className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-pixel tracking-wide text-slate-900 group-hover:text-emerald-600 transition-colors uppercase">
                KeyTone
              </span>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 border-2 transition-all font-bold text-xs uppercase tracking-wider ${isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.5)]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-2 border-slate-900 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800">
              <div className="w-5 h-5 bg-slate-900 flex items-center justify-center text-white">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="hidden sm:inline-block">
                {user?.username}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 hover:bg-red-500 hover:text-white text-slate-700 bg-white font-bold transition-all cursor-pointer text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
