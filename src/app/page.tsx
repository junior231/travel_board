'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ImageCard from '@/components/ImageCard';
import FavoritesPanel from '@/components/FavoritesPanel';
import SkeletonCard from '@/components/SkeletonCard';
import useFavorites, { FavPhoto } from '@/hooks/useFavorites';
import { motion, AnimatePresence } from 'framer-motion';

type Photo = FavPhoto;

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [gridKey, setGridKey] = useState(0);

  // derive initial state from URL
  const initialQ = (searchParams.get('q') || 'kyoto').trim();
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [query, setQuery] = useState(initialQ);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [weatherOpen, setWeatherOpen] = useState(false);
  const [weatherCity, setWeatherCity] = useState<string>('');
  const [weather, setWeather] = useState<{ name: string; temp: number; desc: string; icon?: string } | null>(null);

  const [favOpen, setFavOpen] = useState(false);
  const { list: favs, toggle: toggleFav, isFav, remove } = useFavorites();

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  // helper: update URL (q + page) without scrolling/jumping
  function syncUrl(nextQ: string, nextPage: number) {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set('q', nextQ);
    sp.set('page', String(nextPage));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  async function fetchPhotos(q: string, pg: number, append = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(q)}&page=${pg}`);
      if (!res.ok) throw new Error('Failed to load photos');
      const json = await res.json();
      setTotalPages(json.totalPages ?? null);
      setPhotos(prev => (append ? [...prev, ...(json.results || [])] : (json.results || [])));
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  // function handleSearchSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   if (!canSearch) return;
  //   setPage(1);
  //   syncUrl(query, 1);
  //   fetchPhotos(query, 1, false);
  // }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSearch) return;

    // FULL reset
    setPage(1);
    setTotalPages(null);
    setPhotos([]);        // clear current photos so skeletons show
    setGridKey((k) => k + 1); // force remount of the grid container

    syncUrl(query, 1);
    fetchPhotos(query, 1, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    syncUrl(query, next);
    await fetchPhotos(query, next, true);
  }

  async function openWeather(city: string) {
    setWeatherOpen(true);
    setWeather(null);
    setWeatherCity(city);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error('Weather error');
      const json = await res.json();
      setWeather(json.data);
    } catch {
      setWeather({ name: city, temp: NaN, desc: 'Unavailable' });
    }
  }

  // initial load or URL change (back/forward)
  useEffect(() => {
    const urlQ = (searchParams.get('q') || 'kyoto').trim();
    const urlPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    setQuery(urlQ);
    setPage(urlPage);
    // fresh fetch (not append) to reflect URL
    fetchPhotos(urlQ, urlPage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // listen to URL changes

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
            {loading ? 'Searching…' : 'Search'}
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
                  cityForWeather={p.location || query} 
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
                <button onClick={() => setWeatherOpen(false)} className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-800">
                  Close
                </button>
              </div>

              <div className="mt-6">
                {!weather && <p>Loading…</p>}
                {weather && (
                  <div>
                    <div className="text-4xl font-extrabold">{isNaN(weather.temp) ? '—' : `${weather.temp}°C`}</div>
                    <div className="capitalize text-neutral-600 dark:text-neutral-300">{weather.desc}</div>
                    {weather.icon && (
                      <img
                        alt={weather.desc || 'Weather'} className="mt-4"
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
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
