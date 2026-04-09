"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/my-books", label: "My Books" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100"
          >
            bookshelf
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? "text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ) : user ? (
            <UserButton />
          ) : (
            <>
              <SignInButton mode="redirect">
                <button className="px-3.5 py-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="px-3.5 py-1.5 text-[13px] font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors">
                  Get started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
