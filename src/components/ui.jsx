import { useState } from 'react';
import { useStore, toggleFav } from '../store.js';

// Revela os elementos quando entram no ecrã (usado como `ref`).
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.1 });
export const reveal = (el) => { if (el) io.observe(el); };

export const PriceTag = ({ p }) => p.priceStatus === 'consultar'
  ? <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-mute">Consultar</span>
  : <span className="font-semibold text-gold">{p.priceText}</span>;

export function HeartButton({ id, className = '' }) {
  const on = useStore((s) => s.favs.includes(id));
  return (
    <button type="button" className={`heart ${className}`} aria-pressed={on} aria-label="Guardar nos favoritos" onClick={(e) => { e.stopPropagation(); toggleFav(id); }}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
    </button>
  );
}

export function ProductImage({ p }) {
  const [failed, setFailed] = useState(false);
  return p.imageUrl && !failed
    ? <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" width="640" height="480" className="size-full object-cover" onError={() => setFailed(true)} />
    : <div className="grid size-full place-items-center text-xs text-mute">Sem fotografia</div>;
}
