'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useProfileContext } from './ProfileProvider';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

export function HeaderNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userId, profile } = useProfileContext();
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) return;

    async function loadWallet() {
      try {
        const { data } = await supabase
          .from('wallets')
          .select('coins, streak')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          setCoins(data.coins ?? 0);
          setStreak(data.streak ?? 0);
        }
      } catch (e) {
        console.error('Error loading wallet in navbar:', e);
      }
    }

    loadWallet();

    function onFocus() {
      loadWallet();
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [userId]);

  const navLinks = [
    { name: 'Live Scores', href: '/', exact: true },
    { name: 'Games', href: '/games', matchPrefix: '/games', exact: false },
  ];

  const avatarUrl = profile
    ? `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(profile.avatarSeed)}`
    : null;

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest shadow-sm border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-4 md:px-6 py-4 max-w-[1280px] mx-auto">
        {/* Logo Left */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1" aria-label="Cricket 007 Home">
            <div className="flex items-center gap-1 font-headline tracking-tighter text-3xl sm:text-4xl">
              <span className="font-extrabold text-primary">CRICKET</span>
              <span className="text-secondary font-black italic">007</span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : link.matchPrefix
                  ? pathname.startsWith(link.matchPrefix)
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => track(ANALYTICS_EVENTS.NAV_LINK_CLICKED, { link_name: link.name, source: 'desktop_header' })}
                  className={`font-headline text-lg transition-colors px-2 py-1 rounded ${isActive
                    ? 'text-secondary font-bold border-b-2 border-secondary pb-1'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Badges & Profile */}
        <div className="flex items-center gap-4">
          {/* Streak & Coins Container */}
          <Link
            href="/games/wordle"
            className="flex items-center bg-surface-container-low rounded-full px-2.5 py-1 border border-outline-variant shadow-sm gap-2 hover:bg-surface-container transition-colors"
            aria-label="Play Cricket Wordle"
          >
            {/* Streak */}
            <div className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-tertiary-container text-[15px]" aria-hidden="true">
                local_fire_department
              </span>
              <span className="font-headline font-bold text-xs">{streak}</span>
            </div>

            {/* Divider */}
            <div className="w-px h-3.5 bg-outline-variant" />

            {/* Coins */}
            <div className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-secondary text-[15px]" aria-hidden="true">
                toll
              </span>
              <span className="font-headline font-bold text-xs">{coins.toLocaleString()}</span>
            </div>
          </Link>

          {/* Profile Avatar */}
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer active:opacity-80 transition-all hover:ring-2 hover:ring-secondary ml-1 hidden sm:block bg-surface-container"
            aria-label="View your profile"
          >
            {avatarUrl && (
              <img
                className="w-full h-full object-cover"
                alt="Your avatar"
                src={avatarUrl}
              />
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="md:hidden text-primary p-1 rounded hover:bg-surface-container-high transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-low border-t border-outline-variant px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : link.matchPrefix
                ? pathname.startsWith(link.matchPrefix)
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => { setMobileMenuOpen(false); track(ANALYTICS_EVENTS.NAV_LINK_CLICKED, { link_name: link.name, source: 'mobile_drawer' }); }}
                className={`block px-3 py-2 rounded-md text-base font-headline font-semibold transition-colors ${isActive
                  ? 'bg-surface-container-highest text-secondary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-headline font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
          >
            Profile
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface-container-low py-8 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-mono-code text-xs font-bold text-primary tracking-wider uppercase">
          Cricket 007 Pro
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-on-surface-variant font-body-md">
          <Link className="hover:text-primary underline transition-colors" href="#">
            About Us
          </Link>
          <Link className="hover:text-primary underline transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="hover:text-primary underline transition-colors" href="#">
            Privacy Policy
          </Link>
          <Link className="hover:text-primary underline transition-colors" href="#">
            Contact Support
          </Link>
        </div>
        <div className="text-xs text-on-surface-variant text-center md:text-right font-body-md">
          © 2026 Cricket 007 Pro. All match data and scores provided for entertainment.
        </div>
      </div>
    </footer>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();

  const NAV_TABS = [
    {
      name: 'Live Scores',
      href: '/',
      exact: true,
      icon: 'sports_cricket',
    },
    {
      name: 'Games',
      href: '/games',
      exact: false,
      matchPrefix: '/games',
      icon: 'sports_esports',
    },
  ];

  return (
    <nav
      id="bottom-tab-bar"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-2 items-center px-2">
        {NAV_TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : tab.matchPrefix
              ? pathname.startsWith(tab.matchPrefix)
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              id={`tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              href={tab.href}
              onClick={() => track(ANALYTICS_EVENTS.NAV_LINK_CLICKED, { link_name: tab.name, source: 'bottom_tab' })}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 ${isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-2xl ${isActive ? 'text-secondary' : 'text-on-surface-variant'
                    }`}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                )}
              </div>
              <span className="text-[10px] font-headline tracking-wide">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}