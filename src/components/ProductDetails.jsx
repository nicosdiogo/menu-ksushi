import { useEffect, useRef } from 'react';
import { set, addToCart, useStore } from '../store.js';
import { PriceTag, HeartButton, ProductImage } from './ui.jsx';

export default function ProductDetails() {
  const p = useStore((s) => s.details), n = useStore((s) => s.cart[s.details?.id] || 0);
  const dlg = useRef(null), y0 = useRef(null);
  useEffect(() => { if (p && !dlg.current.open) dlg.current.showModal(); }, [p]);

  // Arrastar a pega para baixo fecha o painel.
  const down = (e) => { if (e.target.closest('[data-grab]')) { y0.current = e.clientY; dlg.current.setPointerCapture(e.pointerId); } };
  const move = (e) => { if (y0.current !== null) dlg.current.style.transform = `translateY(${Math.max(0, e.clientY - y0.current)}px)`; };
  const up = (e) => {
    if (y0.current === null) return;
    const d = e.clientY - y0.current;
    y0.current = null; dlg.current.style.transform = '';
    if (d > 90) dlg.current.close();
  };

  return (
    <dialog id="details" ref={dlg} aria-label="Detalhes do produto" onClose={() => set({ details: null })}
            onClick={(e) => e.target === dlg.current && dlg.current.close()} onPointerDown={down} onPointerMove={move} onPointerUp={up}>
      {p && (
        <div key={p.id} className="relative sm:grid sm:grid-cols-2">
          <div data-grab className="absolute inset-x-0 top-0 z-10 grid h-10 touch-none place-items-center sm:hidden"><span className="h-1 w-10 rounded-full bg-white/70" /></div>
          <div className="aspect-[4/3] bg-white/5 sm:aspect-square"><ProductImage p={p} /></div>
          <div className="flex flex-col justify-center p-5 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-mute">{p.category}</p>
            <h2 className="mt-1 font-serif text-2xl uppercase tracking-wide sm:text-3xl">{p.name}</h2>
            {p.description && <p className="mt-2 text-sm">{p.description}</p>}
            {p.quantity && <p className="mt-2 text-sm text-mute">{p.quantity}</p>}
            <p className="mt-4 text-xl"><PriceTag p={p} /></p>
            <div className="mt-5 flex items-center gap-2">
              <button type="button" className="h-11 flex-1 rounded-full bg-accent px-4 text-sm font-medium" onClick={() => addToCart(p, true)}>Adicionar à lista{n ? ` (${n})` : ''}</button>
              <HeartButton id={p.id} className="!bg-white/10" />
              <button type="button" className="h-11 rounded-full bg-white/10 px-4 text-sm hover:bg-white/20" onClick={() => dlg.current.close()}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
