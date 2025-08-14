'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { FavPhoto } from '@/hooks/useFavorites';

export default function FavoritesPanel({
  open, onClose, list, onRemove,
}: {
  open: boolean;
  onClose: () => void;
  list: FavPhoto[];
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50" onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[320px] sm:w-[360px] border-r bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Favorites ({list.length})</h2>
              <button onClick={onClose} className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-800">Close</button>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                No favorites yet — hover an image and click <strong>Save</strong>.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {list.map((p) => (
                  <div key={p.id} className="relative overflow-hidden rounded-lg border dark:border-neutral-800">
                    <Image src={p.src} alt={p.alt} width={300} height={200} className="h-28 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 text-xs text-white">
                      <div className="truncate">{p.location || p.alt}</div>
                    </div>
                    <button
                      onClick={() => onRemove(p.id)}
                      className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-black hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
