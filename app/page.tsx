"use client";

import { supabasePublic } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";

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

  return (
    <div className="flex-1 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-900">
      {/* Hero + Search */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <h2 className="text-5xl font-extrabold text-amber-900 dark:text-amber-100 tracking-tight">
          Our Class Bookshelf
        </h2>
        <p className="mt-4 text-lg text-amber-700 dark:text-amber-300 max-w-xl mx-auto">
          A shared collection of books loved by our class. Sign in to add your favorites.
        </p>

        {/* Search Bar */}
        <form
          action="/search"
          className="mt-8 max-w-lg mx-auto flex gap-3"
        >
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="q"
              placeholder="Search for a book to add..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 placeholder-amber-400 dark:placeholder-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm"
          >
            Search
          </button>
        </form>
      </section>

      {/* Book Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loadingBooks ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-amber-600/60 dark:text-amber-400/60 py-20 text-lg">
            No books yet. Be the first to add one!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="relative w-[140px] h-[210px] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-amber-100 dark:bg-gray-800">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      sizes="140px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-amber-800/40 dark:text-amber-200/30">
                      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-xs">No Cover</span>
                    </div>
                  )}
                </div>
                <div className="max-w-[160px]">
                  <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-50 line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-1">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 dark:border-gray-800 py-6 text-center text-xs text-amber-600/50 dark:text-amber-400/30">
        Class Bookshelf &middot; Built with Next.js, Supabase &amp; Clerk
      </footer>
    </div>
  );
}
