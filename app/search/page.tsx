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
    <div className="flex-1">
      {/* Search header */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Search
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Find a book and click to add it to the class bookshelf.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, author, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 dark:focus:ring-stone-100/10 focus:border-stone-300 dark:focus:border-stone-600 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-40"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      <div className="border-t border-stone-200 dark:border-stone-800" />

      {/* Results */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {saveError && (
          <div className="mb-6 px-4 py-2.5 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
            {saveError}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-24">
            <div className="h-5 w-5 border-2 border-stone-300 dark:border-stone-600 border-t-stone-900 dark:border-t-stone-100 rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {results.map((book) => (
              <button
                key={book.key}
                onClick={() => handleSave(book)}
                className="group text-left cursor-pointer"
              >
                <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm group-hover:shadow-lg group-hover:ring-2 group-hover:ring-stone-900/20 dark:group-hover:ring-stone-100/20 transition-all duration-200">
                  {savedKey === book.key && (
                    <div className="absolute inset-0 z-10 bg-stone-900/70 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Added</span>
                    </div>
                  )}
                  {book.cover_i ? (
                    <Image
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
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
                {book.author_name && (
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                    {book.author_name[0]}
                  </p>
                )}
                {book.first_publish_year && (
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {book.first_publish_year}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <p className="text-center text-stone-400 dark:text-stone-500 py-24 text-sm">
            No results found for &ldquo;{query}&rdquo;
          </p>
        )}
      </section>
    </div>
  );
}
