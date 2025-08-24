'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ImageCard from '@/components/ImageCard';
import FavoritesPanel from '@/components/FavoritesPanel';
import SkeletonCard from '@/components/SkeletonCard';
import useFavorites, { FavPhoto } from '@/hooks/useFavorites';
import { motion, AnimatePresence } from 'framer-motion';

type Photo = FavPhoto;
type WeatherData = { name: string; temp: number; desc: string; icon?: string };
type Weather = WeatherData | null;

type UnsplashResponse = {
  results: Photo[];
  total?: number;
  totalPages?: number;
};

export default function HomeClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // derive initial state from URL
  const initialQ = (searchParams.get('q') || 'kyoto').trim();
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [query, setQuery] = useState<string>(initialQ);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [weatherOpen, setWeatherOpen] = useState<boolean>(false);
  const [weatherCity, setWeatherCity] = useState<string>('');
  const [weather, setWeather] = useState<Weather>(null);

  const [favOpen, setFavOpen] = useState<boolean>(false);
  const { list: favs, toggle: toggleFav, isFav, remove } = useFavorites();

  // force remount of grid on new searches (to avoid stale UI)
  const [gridKey, setGridKey] = useState<number>(0);

  // Track seen IDs to avoid duplicate keys on append
  const idsRef = useRef<Set<string>>(new Set());
  const prevQ = useRef<string>(query);
  const prevPage = useRef<number>(page);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const errorMsg = (e: unknown, fallback = 'Error'): string =>
    e instanceof Error ? e.message : fallback;

  // Update URL (q + page) without scroll jump
  function syncUrl(nextQ: string, nextPage: number) {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set('q', nextQ);
    sp.set('page', String(nextPage));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  // Fetch photos; de-dupe when appending
  async function fetchPhotos(q: string, pg: number, append = false): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(q)}&page=${pg}`);
      if (!res.ok) throw new Error('Failed to load photos');
      const json = (await res.json()) as UnsplashResponse;

      setTotalPages(json.totalPages ?? null);
      const incoming = json.results ?? [];

      setPhotos((prev) => {
        if (!append) {
          // Fresh set: reset ID set
          idsRef.current = new Set(incoming.map((p) => p.id));
          return incoming;
        }
        // Append with de-dupe by id
        const set = idsRef.current;
        const merged = [...prev];
        for (const ph of incoming) {
          if (!set.has(ph.id)) {
            set.add(ph.id);
            merged.push(ph);
          }
        }
        idsRef.current = set;
        return merged;
      });
    } catch (e: unknown) {
      setError(errorMsg(e, 'Error'));
    } finally {
      setLoading(false);
    }
  }

  // Submit: reset state and let URL change trigger fetch
  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSearch) return;

    setPage(1);
    setTotalPages(null);
    setPhotos([]);
    idsRef.current.clear();
    setGridKey((k) => k + 1);

    syncUrl(query, 1);
  }

  // Load more: just bump page via URL; effect will append
  function handleLoadMore() {
    const next = page + 1;
    syncUrl(query, next);
  }

  async function openWeather(city: string) {
    setWeatherOpen(true);
    setWeather(null);
    setWeatherCity(city);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error('Weather error');
      const json = (await res.json()) as { data: WeatherData };
      setWeather(json.data);
    } catch (_e: unknown) {
      setWeather({ name: city, temp: NaN, desc: 'Unavailable' });
    }
  }

  // Initial load and respond to URL changes (back/forward or programmatic)
  useEffect(() => {
    const urlQ = (searchParams.get('q') || 'kyoto').trim();
    const urlPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    // Decide whether to append or replace
    const append = prevQ.current === urlQ && urlPage > prevPage.current;

    setQuery(urlQ);
    setPage(urlPage);

    void fetchPhotos(urlQ, urlPage, append);

    prevQ.current = urlQ;
    prevPage.current = urlPage;
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Header row */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Travel Inspiration Board</h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">
              Search destinations, explore stunning photos, and peek at the local weather.
            </p>
          </div>
          <button
            onClick={() => setFavOpen(true)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Favorites ({favs.length})
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: Kyoto, Santorini, Marrakech…"
            className="flex-1 rounded-lg border border-neutral-300 bg-white/70 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            disabled={!canSearch || loading}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading && photos.length === 0 ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error && <p className="mt-3 text-red-600">{error}</p>}

        {/* Grid */}
        <div key={gridKey} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && photos.length === 0
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : photos.map((p) => (
                <ImageCard
                  key={p.id}
                  photo={p}
                  onCityClick={openWeather}
                  onToggleFav={(ph) => toggleFav(ph)}
                  isFavorite={isFav(p.id)}
                  cityForWeather={p.location || query} // ensures Weather button is available
                />
              ))}
        </div>

        {/* Load more */}
        <div className="mt-8 flex justify-center">
          {totalPages && page < totalPages ? (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 font-semibold hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          ) : (
            photos.length > 0 && (
              <span className="text-sm text-neutral-500">No more results.</span>
            )
          )}
        </div>

        {/* Weather Backdrop */}
        <AnimatePresence>
          {weatherOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setWeatherOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Weather Drawer */}
        <AnimatePresence>
          {weatherOpen && (
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[320px] border-l bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:w-[380px]"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Weather — {weatherCity}</h2>
                <button
                  onClick={() => setWeatherOpen(false)}
                  className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-800"
                >
                  Close
                </button>
              </div>

              <div className="mt-6">
                {!weather && <p>Loading…</p>}
                {weather && (
                  <div>
                    <div className="text-4xl font-extrabold">
                      {isNaN(weather.temp) ? '—' : `${weather.temp}°C`}
                    </div>
                    <div className="capitalize text-neutral-600 dark:text-neutral-300">{weather.desc}</div>
                    {weather.icon && (
                      <Image
                        alt={weather.desc || 'Weather'}
                        className="mt-4"
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        width={100}
                        height={100}
                        priority={false}
                      />
                    )}
                    <p className="mt-8 text-xs text-neutral-500">
                      Data by OpenWeather • Photos by Unsplash (credit per image)
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Favorites Panel */}
        <FavoritesPanel open={favOpen} onClose={() => setFavOpen(false)} list={favs} onRemove={remove} />
      </section>
    </main>
  );
}
