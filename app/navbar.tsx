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
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-black tracking-tighter text-white uppercase">
            Bookshelf
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "text-black bg-white"
                      : "text-zinc-400 hover:text-white"
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
            <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
          ) : user ? (
            <UserButton />
          ) : (
            <>
              <SignInButton mode="redirect">
                <button className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="px-5 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-zinc-200 transition-colors">
                  Join
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
