"use client";

import { useUser, useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  year: number | null;
  poster_url: string;
  tmdb_id: number;
  created_at: string;
}

export default function MyMoviesPage() {
  const { user } = useUser();
  const { session } = useSession();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchMovies = useCallback(async () => {
    if (!session || !user) return;
    const supabase = createClerkSupabaseClient(() =>
      session.getToken({ template: "supabase" })
    );
    const { data } = await supabase
      .from("movies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMovies(data ?? []);
    setLoading(false);
  }, [session, user]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  async function handleRemove(id: number) {
    if (!session) return;
    setRemovingId(id);
    const supabase = createClerkSupabaseClient(() =>
      session.getToken({ template: "supabase" })
    );
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (!error) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
    }
    setRemovingId(null);
  }

  return (
    <div className="flex-1 bg-black text-white">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-600/5 to-transparent" />
        <div className="relative max-w-[1400px] mx-auto px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
            My Movies
          </h1>
          <p className="mt-3 text-zinc-400 text-base">
            Your personal collection. Hover to remove.
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-6 w-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-lg">Nothing here yet.</p>
            <Link
              href="/search"
              className="inline-block mt-6 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
            >
              Find movies to add
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">
                {movies.length} {movies.length === 1 ? "movie" : "movies"} saved
              </p>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {movies.map((movie) => (
                <div key={movie.id} className="group">
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-red-400/50 group-hover:shadow-[0_0_30px_-5px_rgba(248,113,113,0.3)] transition-all duration-300">
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
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
                    {/* Remove overlay */}
                    <button
                      onClick={() => handleRemove(movie.id)}
                      disabled={removingId === movie.id}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-white text-xs font-bold uppercase tracking-wider">
                          {removingId === movie.id ? "Removing..." : "Remove"}
                        </span>
                      </div>
                    </button>
                    {/* Bottom info on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <p className="text-white text-xs font-bold line-clamp-2">{movie.title}</p>
                      {movie.year && <p className="text-zinc-400 text-[11px]">{movie.year}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
