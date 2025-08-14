'use client';

import { useEffect, useMemo, useState } from 'react';

export type FavPhoto = {
  id: string;
  src: string;
  alt: string;
  author?: string;
  authorLink?: string;
  location?: string | null;
};

const KEY = 'travelboard:favorites:v1';

export default function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, FavPhoto>>({});

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const list = useMemo(() => Object.values(favorites), [favorites]);

  const isFav = (id: string) => Boolean(favorites[id]);

  const add = (photo: FavPhoto) =>
    setFavorites((s) => ({ ...s, [photo.id]: photo }));

  const remove = (id: string) =>
    setFavorites((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });

  const toggle = (photo: FavPhoto) => (isFav(photo.id) ? remove(photo.id) : add(photo));

  return { list, isFav, add, remove, toggle, count: list.length };
}
