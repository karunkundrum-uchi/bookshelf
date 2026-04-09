"use client";

import { supabasePublic } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Favorite {
  id: number;
  user_id: string;
  title: string;
  author: string;
  cover_url: string;
  ol_key: string;
  created_at: string;
}

export default function Home() {
  const [books, setBooks] = useState<Favorite[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabasePublic
        .from("favorites")
        .select("*")
        .order("created_at", { ascending: false });
      setBooks(data ?? []);
      setLoadingBooks(false);
    }
    fetchBooks();
  }, []);

  // Duplicate books for marquee effect if we have some
  const booksWithCovers = books.filter((b) => b.cover_url);
  const marqueeBooks = [...booksWithCovers, ...booksWithCovers, ...booksWithCovers, ...booksWithCovers];

  return (
    <div className="flex-1 bg-black text-white">
      {/* Giant Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[120px] animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] animate-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[150px]" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-black tracking-tighter leading-[0.85] uppercase">
            Class
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              Bookshelf
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto font-light">
            Every book someone in our class has loved, all in one place.
          </p>

          {/* Search */}
          <form action="/search" className="mt-10 max-w-md mx-auto">
            <div className="relative group">
              <input
                type="text"
                name="q"
                placeholder="Search and add a book..."
                className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-base focus:outline-none focus:bg-white/15 focus:border-white/25 transition-all backdrop-blur-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors">
                Search
              </button>
            </div>
          </form>

          {!loadingBooks && books.length > 0 && (
            <p className="mt-6 text-sm text-zinc-500">
              {books.length} books in the collection
            </p>
          )}
        </div>

        {/* Scroll indicator */}
        {books.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
          </div>
        )}
      </section>

      {/* Scrolling Marquee of covers */}
      {booksWithCovers.length > 0 && (
        <section className="py-4 overflow-hidden border-t border-b border-white/5">
          <div className="flex animate-marquee" style={{ width: `${marqueeBooks.length * 100}px` }}>
            {marqueeBooks.map((book, i) => (
              <div key={`${book.id}-${i}`} className="flex-shrink-0 w-[88px] h-[132px] mx-1 rounded overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  width={88}
                  height={132}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Book Grid */}
      <section className="max-w-[1400px] mx-auto px-8 py-16">
        {loadingBooks ? (
          <div className="flex justify-center py-24">
            <div className="h-6 w-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-lg">No books yet.</p>
            <Link href="/search" className="inline-block mt-4 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors">
              Add the first one
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tight">The Collection</h2>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {books.map((book) => (
                <div key={book.id} className="group">
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-orange-400/50 group-hover:shadow-[0_0_30px_-5px_rgba(251,146,60,0.3)] transition-all duration-300">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    {/* Hover info overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-bold line-clamp-2">{book.title}</p>
                      <p className="text-zinc-400 text-[11px]">{book.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">
          Built with Next.js &middot; Supabase &middot; Clerk
        </p>
      </footer>
    </div>
  );
}
