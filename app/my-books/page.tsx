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
    <div className="flex-1">
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          My Books
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Your saved favorites. Hover over a book to remove it.
        </p>
      </section>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      <section className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-5 w-5 border-2 border-stone-300 dark:border-stone-600 border-t-stone-900 dark:border-t-stone-100 rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              You haven&apos;t saved any books yet.
            </p>
            <Link
              href="/search"
              className="inline-block mt-4 px-5 py-2.5 text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              Search for books
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-8">
              {books.length} {books.length === 1 ? "book" : "books"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {books.map((book) => (
                <div key={book.id} className="group relative">
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
                    {/* Remove overlay on hover */}
                    <button
                      onClick={() => handleRemove(book.id)}
                      disabled={removingId === book.id}
                      className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-white text-xs font-medium px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 transition-colors">
                        {removingId === book.id ? "Removing..." : "Remove"}
                      </span>
                    </button>
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
