import { useEffect, useState } from 'react';
import { categories, set, mesa, useStore, useSummary } from './store.js';
import { kz } from './utils/format-utils.js';
import site from './data/site.json';
import locations from './data/locations.json';
import HomeView from './components/HomeView.jsx';
import CategoryView from './components/CategoryView.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import WaiterView from './components/WaiterView.jsx';

export default function App() {
  const route = useStore((s) => s.route), search = useStore((s) => s.search), waiter = useStore((s) => s.waiter);
  const favCount = useStore((s) => s.favs.length), cart = useSummary();
  const [scrolled, setScrolled] = useState(false);
  const isCat = route === 'fav' || categories.some((c) => c.id === route);

  useEffect(() => { scrollTo(0, 0); }, [route]);
  useEffect(() => { document.body.style.overflow = search || waiter ? 'hidden' : ''; }, [search, waiter]);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <>
      <header id="hdr" className={`fixed inset-x-0 top-0 z-30 transition ${scrolled ? 'scrolled' : ''}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <a href="#" className="flex items-center gap-2" aria-label="K-Sushi, início">
            <img src={site.logo} alt="" className="h-12 w-auto rounded  p-0.5" />
            
          </a>
          {mesa && <span className="ml-2 rounded-full border border-line px-3 py-1 text-xs">Mesa {mesa}</span>}
          <button type="button" className="icon-btn ml-auto" aria-label="Pesquisar no menu" onClick={() => set({ search: true })}>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
          <a href="#fav" className="icon-btn relative" aria-label="Favoritos">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
            {favCount > 0 && <span className="badge">{favCount}</span>}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-14">
        {isCat ? <CategoryView key={route} id={route} /> : <HomeView />}
      </main>

      <footer className="border-t border-line bg-surface px-4 py-8 text-sm">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3">
          <div><h2 className="mb-2 font-semibold">Localizações</h2><ul className="space-y-1 text-mute">{locations.locations.map((l) => <li key={l}>{l}</li>)}</ul></div>
          <div>
            <h2 className="mb-2 font-semibold">Contacto</h2>
            <ul className="space-y-1">
              {locations.contacts.map((c) => <li key={c.tel}><span className="text-mute">{c.label}:</span> <a className="underline" href={`tel:${c.tel}`}>{c.display}</a></li>)}
              <li><a className="underline" href={`mailto:${locations.email}`}>{locations.email}</a></li>
            </ul>
          </div>
          <p className="text-xs text-mute sm:self-end">© 2026 K-Sushi</p>
        </div>
      </footer>

      {cart.count > 0 && (
        <button id="cart-bar" key={cart.count} type="button" aria-haspopup="dialog" className="bump" onClick={() => set({ cartOpen: true })}>
          <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm">{cart.count}</span>
          <span>Lista de pedido</span>
          <span className="font-semibold text-gold">{kz(cart.total)}{cart.pending ? '+' : ''}</span>
        </button>
      )}

      {search && <SearchOverlay />}
      <ProductDetails />
      <CartDrawer />
      {waiter && <WaiterView />}
    </>
  );
}
