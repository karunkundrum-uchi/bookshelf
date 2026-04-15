"use client";

import { supabasePublic } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Movie {
  id: number;
  user_id: string;
  title: string;
  year: number | null;
  poster_url: string;
  tmdb_id: number;
  rating: number | null;
  created_at: string;
}

interface AggregatedMovie {
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string;
  avgRating: number | null;
  ratingCount: number;
  totalAdds: number;
}

function aggregate(movies: Movie[]): AggregatedMovie[] {
  const groups = new Map<number, Movie[]>();
  for (const m of movies) {
    const arr = groups.get(m.tmdb_id);
    if (arr) arr.push(m);
    else groups.set(m.tmdb_id, [m]);
  }

  const result: AggregatedMovie[] = [];
  for (const [tmdb_id, rows] of groups) {
    // rows are in fetch order (created_at desc) — first row is the most-recent add
    const rep = rows[0];
    const rated = rows.filter((r) => r.rating !== null) as (Movie & { rating: number })[];
    const avgRating =
      rated.length > 0
        ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
        : null;
    result.push({
      tmdb_id,
      title: rep.title,
      year: rep.year,
      poster_url: rep.poster_url,
      avgRating,
      ratingCount: rated.length,
      totalAdds: rows.length,
    });
  }
  return result;
}

export default function Home() {
  const [rows, setRows] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      const { data } = await supabasePublic
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });
      setRows((data ?? []) as Movie[]);
      setLoadingMovies(false);
    }
    fetchMovies();
  }, []);

  const movies = useMemo(() => aggregate(rows), [rows]);

  // Duplicate posters for marquee effect (unique movies only)
  const moviesWithPosters = movies.filter((m) => m.poster_url);
  const marqueeMovies = [...moviesWithPosters, ...moviesWithPosters, ...moviesWithPosters, ...moviesWithPosters];

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
              Movieshelf
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto font-light">
            Every movie someone in our class has loved, all in one place.
          </p>

          {/* Search */}
          <form action="/search" className="mt-10 max-w-md mx-auto">
            <div className="relative group">
              <input
                type="text"
                name="q"
                placeholder="Search and add a movie..."
                className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-base focus:outline-none focus:bg-white/15 focus:border-white/25 transition-all backdrop-blur-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors">
                Search
              </button>
            </div>
          </form>

          {!loadingMovies && movies.length > 0 && (
            <p className="mt-6 text-sm text-zinc-500">
              {movies.length} {movies.length === 1 ? "movie" : "movies"} in the collection
            </p>
          )}
        </div>

        {/* Scroll indicator */}
        {movies.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
          </div>
        )}
      </section>

      {/* Scrolling Marquee of posters */}
      {moviesWithPosters.length > 0 && (
        <section className="py-4 overflow-hidden border-t border-b border-white/5">
          <div className="flex animate-marquee" style={{ width: `${marqueeMovies.length * 100}px` }}>
            {marqueeMovies.map((movie, i) => (
              <div key={`${movie.tmdb_id}-${i}`} className="flex-shrink-0 w-[88px] h-[132px] mx-1 rounded overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  width={88}
                  height={132}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Movie Grid */}
      <section className="max-w-[1400px] mx-auto px-8 py-16">
        {loadingMovies ? (
          <div className="flex justify-center py-24">
            <div className="h-6 w-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-lg">No movies yet.</p>
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
              {movies.map((movie) => (
                <div key={movie.tmdb_id} className="group">
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-white/5 group-hover:ring-orange-400/50 group-hover:shadow-[0_0_30px_-5px_rgba(251,146,60,0.3)] transition-all duration-300">
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

                    {/* Persistent rating badge (always visible when rated) */}
                    {movie.avgRating !== null && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-amber-300 text-xs font-bold tracking-tight flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {movie.avgRating.toFixed(1)}
                      </div>
                    )}

                    {/* Hover info overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-bold line-clamp-2">{movie.title}</p>
                      {movie.year && <p className="text-zinc-400 text-[11px]">{movie.year}</p>}
                      <p className="text-zinc-300 text-[11px] mt-1">
                        {movie.ratingCount > 0 ? (
                          <>
                            <span className="text-amber-300 font-bold">{movie.avgRating!.toFixed(1)}</span>
                            <span className="text-zinc-400"> / 10 · {movie.ratingCount} {movie.ratingCount === 1 ? "rating" : "ratings"}</span>
                          </>
                        ) : (
                          <span className="text-zinc-500">No ratings yet</span>
                        )}
                      </p>
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
          Built with Next.js &middot; Supabase &middot; Clerk &middot; TMDB
        </p>
      </footer>
    </div>
  );
}
