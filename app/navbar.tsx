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
    <header className="border-b border-amber-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-amber-900 dark:text-amber-100 tracking-tight hover:text-amber-700 transition-colors"
          >
            Class Bookshelf
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100"
                      : "text-amber-700/70 dark:text-amber-300/60 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!isLoaded ? null : user ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          ) : (
            <>
              <SignInButton mode="redirect">
                <button className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="px-4 py-1.5 border border-amber-600 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-sm font-medium">
                  Create Account
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
