"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface SearchResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
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
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function doSearch(term: string) {
    if (!term.trim()) return;
    setLoading(true);
    setSavedId(null);
    setSaveError(null);
    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults(data.results ?? []);
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

  async function handleSave(movie: SearchResult) {
    if (!session || !user) return;

    setSavedId(null);
    setSaveError(null);

    const supabase = createClerkSupabaseClient(() =>
      session.getToken({ template: "supabase" })
    );

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    const year = movie.release_date
      ? parseInt(movie.release_date.slice(0, 4), 10)
      : null;

    const { error } = await supabase.from("movies").insert({
      user_id: user.id,
      title: movie.title,
      year,
      poster_url: posterUrl,
      tmdb_id: movie.id,
    });

    if (error) {
      setSaveError(error.message);
    } else {
      setSavedId(movie.id);
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
            Click any movie to add it to the class movieshelf.
          </p>

          <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, keyword, or year..."
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
              {results.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSave(movie)}
                  className="group text-left cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-green-400/50 group-hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.3)] transition-all duration-300">
                    {savedId === movie.id && (
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
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                    {/* Bottom info on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-bold line-clamp-2">{movie.title}</p>
                      {movie.release_date && (
                        <p className="text-zinc-400 text-[11px]">{movie.release_date.slice(0, 4)}</p>
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
