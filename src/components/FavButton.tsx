'use client';

export default function FavButton({
  active,
  onClick,
}: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className="rounded-full bg-white/90 text-black px-2 py-1 text-xs font-semibold hover:bg-white"
    >
      {active ? '♥ Saved' : '♡ Save'}
    </button>
  );
}
