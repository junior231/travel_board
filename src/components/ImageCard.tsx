'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import FavButton from './FavButton';

type Photo = {
  id: string;
  src: string;
  alt: string;
  author?: string;
  authorLink?: string;
  location?: string | null;
};

export default function ImageCard({
  photo,
  onCityClick,
  onToggleFav,
  isFavorite,
  cityForWeather, 
}: {
  photo: Photo;
  onCityClick: (city: string) => void;
  onToggleFav: (photo: Photo) => void;
  isFavorite: boolean;
  cityForWeather?: string;
}) {
  const city = (cityForWeather ?? '').trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={800}
        height={520}
        className="h-56 w-full object-cover"
        priority={false}
      />

      {/* hover tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* top-right save */}
      <div className="absolute right-3 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <FavButton active={isFavorite} onClick={() => onToggleFav(photo)} />
      </div>

      {/* credits + actions */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-sm">
        <div className="truncate">
          {photo.author && (
            <a
              href={photo.authorLink ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/40 underline-offset-2 hover:decoration-white"
              title="Photo credit (Unsplash requirement)"
            >
              {photo.author}
            </a>
          )}
          {(photo.location || city) && (
            <span className="ml-2 opacity-90">• {photo.location || city}</span>
          )}
        </div>

        {/* Always show if we have a city candidate */}
        {city && (
          <button
            onClick={() => onCityClick(city)}
            className="rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-black hover:bg-white"
          >
            Weather
          </button>
        )}
      </div>
    </motion.div>
  );
}

