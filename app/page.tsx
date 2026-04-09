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
    <div className="flex-1">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-[1.1]">
            Our Class Bookshelf
          </h1>
          <p className="mt-4 text-lg text-stone-500 dark:text-stone-400 leading-relaxed">
            A shared collection of books loved by our class.
            <br className="hidden sm:block" />
            Sign in to add your favorites.
          </p>
        </div>

        {/* Search */}
        <form action="/search" className="mt-10 max-w-md">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="q"
              placeholder="Search for a book..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 dark:focus:ring-stone-100/10 focus:border-stone-300 dark:focus:border-stone-600 transition-all"
            />
          </div>
        </form>
      </section>

      {/* Divider */}
      <div className="border-t border-stone-200 dark:border-stone-800" />

      {/* Book Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loadingBooks ? (
          <div className="flex justify-center py-24">
            <div className="h-5 w-5 border-2 border-stone-300 dark:border-stone-600 border-t-stone-900 dark:border-t-stone-100 rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-stone-400 dark:text-stone-500 py-24 text-sm">
            No books yet — be the first to add one.
          </p>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-8">
              {books.length} {books.length === 1 ? "book" : "books"} in the collection
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {books.map((book) => (
                <div key={book.id} className="group">
                  <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-stone-300 dark:text-stone-600 text-xs">No cover</span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {book.author}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
