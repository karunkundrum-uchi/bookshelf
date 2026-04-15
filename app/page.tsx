"use client";

import { supabasePublic } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Movie {
  id: number;
  user_id: string;
  title: string;
  year: number | null;
  poster_url: string;
  tmdb_id: number;
  created_at: string;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      const { data } = await supabasePublic
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });
      setMovies(data ?? []);
      setLoadingMovies(false);
    }
    fetchMovies();
  }, []);

  // Duplicate posters for marquee effect
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
              {movies.length} movies in the collection
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
              <div key={`${movie.id}-${i}`} className="flex-shrink-0 w-[88px] h-[132px] mx-1 rounded overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
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
                <div key={movie.id} className="group">
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
                    {/* Hover info overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">
          Built with Next.js &middot; Supabase &middot; Clerk &middot; TMDB
        </p>
      </footer>
    </div>
  );
}
