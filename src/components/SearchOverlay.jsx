import { useEffect, useMemo, useRef, useState } from 'react';
import { products, set, getDetails } from '../store.js';
import { matches } from '../utils/search-utils.js';
import ProductCard from './ProductCard.jsx';
import { GRID } from './CategoryView.jsx';

export default function SearchOverlay() {
  const [q, setQ] = useState(''), input = useRef(null);
  const results = useMemo(() => (q.trim() ? [...products.values()].filter((p) => matches(p, q)) : []), [q]);
  useEffect(() => {
    input.current.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !getDetails()) set({ search: false }); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg/95 px-4 pb-10 pt-3 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <label htmlFor="q" className="sr-only">Pesquisar no menu</label>
          <input id="q" ref={input} value={q} onChange={(e) => setQ(e.target.value)} type="search" autoComplete="off" placeholder="Pesquisar prato ou bebida" className="h-12 w-full rounded-full border border-line bg-surface px-5 text-base outline-none focus:border-accent" />
          <button type="button" className="icon-btn shrink-0" aria-label="Fechar pesquisa" onClick={() => set({ search: false })}>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="mt-4" role="status">
          {q.trim() && !results.length && <p className="py-16 text-center text-mute">Sem resultados para “{q.trim()}”.</p>}
          {results.length > 0 && <>
            <p className="mb-3 text-sm text-mute">{results.length} resultado(s)</p>
            <div className={GRID}>{results.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
          </>}
        </div>
      </div>
    </div>
  );
}
