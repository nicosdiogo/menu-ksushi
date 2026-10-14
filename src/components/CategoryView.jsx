import { useEffect, useMemo } from 'react';
import { categories, products, set, useStore } from '../store.js';
import ProductCard from './ProductCard.jsx';

const SORTS = [['menu', 'Ordem do menu'], ['az', 'A–Z'], ['asc', 'Preço ↑'], ['desc', 'Preço ↓']];
const CMP = {
  az: (a, b) => a.name.localeCompare(b.name, 'pt'),
  asc: (a, b) => (a.price ?? 1e12) - (b.price ?? 1e12), // sem preço numérico vai para o fim
  desc: (a, b) => (b.price ?? -1) - (a.price ?? -1),
};
export const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5';

export default function CategoryView({ id }) {
  const sort = useStore((s) => s.sort), favs = useStore((s) => s.favs);
  const isFav = id === 'fav', cat = categories.find((c) => c.id === id);
  const list = useMemo(() => {
    const l = isFav ? favs.map((x) => products.get(x)).filter(Boolean) : cat.products.map((p) => products.get(p.id));
    return CMP[sort] ? [...l].sort(CMP[sort]) : l;
  }, [id, sort, favs]);
  useEffect(() => { document.querySelector('.chip[aria-current=true]')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }, [id]);

  return (
    <div className="page-in">
      <a href="#" className="mt-2 inline-flex h-11 items-center gap-2 text-sm text-mute hover:text-fg">← Início</a>
      <h1 className="font-serif text-4xl lg:text-6xl">{isFav ? 'Favoritos' : cat.name}</h1>
      <div className="sticky top-14 z-20 -mx-4 mt-4 bg-bg/80 px-4 py-4 backdrop-blur-xl lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto lg:min-w-0">
          {categories.map((c) => <a key={c.id} href={`#${c.id}`} className="chip" aria-current={c.id === id}>{c.name}</a>)}
        </div>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto lg:mt-0 lg:shrink-0">
          {SORTS.map(([k, l]) => <button key={k} type="button" className="chip !h-9 text-xs" aria-pressed={sort === k} onClick={() => set({ sort: k })}>{l}</button>)}
        </div>
      </div>
      <div key={sort} className={`mt-4 ${GRID}`}>
        {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        {!list.length && <p className="col-span-full py-16 text-center text-mute">Ainda sem favoritos. Toque no ♥ de um prato para o guardar.</p>}
      </div>
    </div>
  );
}
