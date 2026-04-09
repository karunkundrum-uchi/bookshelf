"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface SearchResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const { user } = useUser();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function doSearch(term: string) {
    if (!term.trim()) return;
    setLoading(true);
    setSavedKey(null);
    setSaveError(null);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=20`
      );
      const data = await res.json();
      setResults(data.docs ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  async function handleSave(book: SearchResult) {
    if (!session || !user) return;

    setSavedKey(null);
    setSaveError(null);

    const supabase = createClerkSupabaseClient(() =>
      session.getToken({ template: "supabase" })
    );

    const coverUrl = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "";

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      title: book.title,
      author: book.author_name?.[0] ?? "Unknown",
      cover_url: coverUrl,
      ol_key: book.key,
    });

    if (error) {
      setSaveError(error.message);
    } else {
      setSavedKey(book.key);
    }
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-900">
      {/* Search Section */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center">
        <h2 className="text-3xl font-extrabold text-amber-900 dark:text-amber-100 tracking-tight">
          Search Books
        </h2>
        <p className="mt-2 text-amber-700/70 dark:text-amber-300/60">
          Click on a book to add it to the class bookshelf
        </p>

        <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 placeholder-amber-400 dark:placeholder-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {saveError && (
          <p className="mb-6 text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
            Error saving: {saveError}
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((book) => (
              <button
                key={book.key}
                onClick={() => handleSave(book)}
                className="group flex flex-col items-center text-center gap-3 cursor-pointer"
              >
                <div className="relative w-[140px] h-[210px] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl group-hover:ring-2 group-hover:ring-amber-400 transition-all duration-300 bg-amber-100 dark:bg-gray-800">
                  {savedKey === book.key && (
                    <span className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow font-medium">
                      Saved!
                    </span>
                  )}
                  {book.cover_i ? (
                    <Image
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
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
                  {book.author_name && (
                    <p className="text-xs text-amber-700/70 dark:text-amber-300/60 mt-1 line-clamp-1">
                      {book.author_name[0]}
                    </p>
                  )}
                  {book.first_publish_year && (
                    <p className="text-xs text-amber-600/50 dark:text-amber-400/40 mt-0.5">
                      {book.first_publish_year}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <p className="text-center text-amber-600/60 dark:text-amber-400/60 py-20 text-lg">
            No results found.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 dark:border-gray-800 py-6 text-center text-xs text-amber-600/50 dark:text-amber-400/30">
        Class Bookshelf &middot; Built with Next.js, Supabase &amp; Clerk
      </footer>
    </div>
  );
}
