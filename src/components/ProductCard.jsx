import { set, setQty, useStore } from '../store.js';
import { PriceTag, HeartButton, ProductImage, reveal } from './ui.jsx';

export default function ProductCard({ p, i = 0 }) {
  const n = useStore((s) => s.cart[p.id] || 0);
  return (
    <article ref={reveal} style={{ '--i': i % 8 }} className="reveal group relative overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/60 active:scale-[.97]">
      <button type="button" className="block w-full text-left" onClick={() => set({ details: p })}>
        <div className="aspect-[4/3] overflow-hidden bg-white/5">
          <div className="size-full transition duration-700 group-hover:scale-110"><ProductImage p={p} /></div>
        </div>
        <div className="flex flex-col gap-1 p-3 pr-14">
          <h3 className="text-[13px] font-medium uppercase leading-snug tracking-wide">{p.name}</h3>
          {p.description && <p className="text-xs text-mute">{p.description}</p>}
          {p.quantity && <p className="text-xs text-mute">{p.quantity}</p>}
          <p className="pt-1 text-sm"><PriceTag p={p} /></p>
        </div>
      </button>
      <HeartButton id={p.id} className="absolute right-2 top-2" />
      <button type="button" className="addbtn" aria-label="Adicionar à lista de pedido" onClick={() => setQty(p.id, n + 1)}>{n || '+'}</button>
    </article>
  );
}
