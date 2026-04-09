"use client";

import { useUser, useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Favorite {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  ol_key: string;
  created_at: string;
}

export default function MyBooksPage() {
  const { user } = useUser();
  const { session } = useSession();
  const [books, setBooks] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchBooks = useCallback(async () => {
    if (!session || !user) return;
    const supabase = createClerkSupabaseClient(() =>
      session.getToken({ template: "supabase" })
    );
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBooks(data ?? []);
    setLoading(false);
  }, [session, user]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  async function handleRemove(id: number) {
    if (!session) return;
    setRemovingId(id);
    const supabase = createClerkSupabaseClient(() =>
      session.getToken({ template: "supabase" })
    );
    const { error } = await supabase.from("favorites").delete().eq("id", id);
    if (!error) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
    setRemovingId(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-amber-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-900 dark:text-amber-100 tracking-tight hover:text-amber-700 transition-colors">
            Class Bookshelf
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              + Add Books
            </Link>
            <Link
              href="/"
              className="text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
            >
              &larr; Back to Shelf
            </Link>
          </div>
        </div>
      </header>

      {/* Title */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center">
        <h2 className="text-3xl font-extrabold text-amber-900 dark:text-amber-100 tracking-tight">
          My Books
        </h2>
        <p className="mt-2 text-amber-700/70 dark:text-amber-300/60">
          Your personal favorites. Click the remove button to delete a book.
        </p>
      </section>

      {/* Book Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-amber-600/60 dark:text-amber-400/60 text-lg">
              You haven&apos;t saved any books yet.
            </p>
            <Link
              href="/search"
              className="inline-block mt-4 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
            >
              Search for Books
            </Link>
          </div>
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
                <button
                  onClick={() => handleRemove(book.id)}
                  disabled={removingId === book.id}
                  className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {removingId === book.id ? "Removing..." : "Remove"}
                </button>
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
