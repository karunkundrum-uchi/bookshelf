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
    <div className="flex-1 bg-black text-white">
      {/* Search header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-600/5 to-transparent" />
        <div className="relative max-w-[1400px] mx-auto px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            Search
          </h1>
          <p className="mt-3 text-zinc-400 text-base">
            Click any book to add it to the class bookshelf.
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, author, or keyword..."
                className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-base focus:outline-none focus:bg-white/15 focus:border-white/25 transition-all backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-40"
              >
                {loading ? "..." : "Go"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-[1400px] mx-auto px-8 py-12">
        {saveError && (
          <div className="mb-8 px-5 py-3 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
            {saveError}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-24">
            <div className="h-6 w-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">{results.length} results</p>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {results.map((book) => (
                <button
                  key={book.key}
                  onClick={() => handleSave(book)}
                  className="group text-left cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-green-400/50 group-hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.3)] transition-all duration-300">
                    {savedKey === book.key && (
                      <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Added</span>
                        </div>
                      </div>
                    )}
                    {book.cover_i ? (
                      <Image
                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
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
                    {/* Bottom info on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-bold line-clamp-2">{book.title}</p>
                      {book.author_name && (
                        <p className="text-zinc-400 text-[11px] line-clamp-1">{book.author_name[0]}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {!loading && results.length === 0 && query && (
          <p className="text-center text-zinc-500 py-24 text-base">
            Nothing found for &ldquo;{query}&rdquo;
          </p>
        )}
      </section>
    </div>
  );
}
