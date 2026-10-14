import { useEffect, useState } from 'react';
import { categories, set, ask, toast, mesa, useStore, useSummary } from './store.js';
import { kz } from './utils/format-utils.js';
import site from './data/site.json';
import locations from './data/locations.json';
import HomeView from './components/HomeView.jsx';
import CategoryView from './components/CategoryView.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import WaiterView from './components/WaiterView.jsx';
import Toaster from './components/Toaster.jsx';
import PreviewModal from './components/PreviewModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';

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

  // Atalho de teclado no computador: «/» abre a pesquisa.
  useEffect(() => {
    const k = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName) && !document.querySelector('dialog[open]')) { e.preventDefault(); set({ search: true }); }
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);

  return (
    <>
      <header id="hdr" className={`fixed inset-x-0 top-0 z-30 border-b border-line bg-bg transition-shadow duration-300 ${scrolled ? 'shadow-[0_10px_30px_rgb(0_0_0/.6)]' : ''}`}>
  <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
    <a href="#" className="flex items-center" aria-label="K-Sushi, início">
      <img src={site.logo} alt="" className="h-11 w-auto" />
    </a>
    {mesa && <span className="ml-3 rounded-full border border-line bg-surface px-3 py-1 text-xs">Mesa {mesa}</span>}
    <div className="ml-auto flex items-center gap-2">
      <button type="button" className="icon-btn border border-line bg-surface" aria-label="Pesquisar no menu" onClick={() => set({ search: true })}>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </button>
      <a href="#fav" className="icon-btn relative border border-line bg-surface" aria-label="Favoritos">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>
        {favCount > 0 && <span className="badge">{favCount}</span>}
      </a>
    </div>
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
        <div role="note" className="mx-auto mt-4 flex max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-mute">
          <p>Favoritos e lista ficam só neste dispositivo. Não recolhemos dados pessoais.</p>
          <button type="button" className="underline hover:text-fg" onClick={() => ask({
            title: 'Apagar dados guardados?', text: 'Os favoritos e a lista de pedido deste dispositivo serão removidos.', ok: 'Apagar',
            onOk: () => { set({ favs: [], cart: {} }); toast('Dados apagados'); },
          })}>Apagar dados guardados</button>
        </div>
      </footer>

      {cart.count > 0 && (
  <button
    id="cart-bar"
    key={cart.count}
    type="button"
    aria-haspopup="dialog"
    className="bump"
    onClick={() => set({ cartOpen: true, toast: null })}
  >
    <span className="grid size-7 place-items-center rounded-full bg-white/20 text-sm">{cart.count}</span>
    <span>Lista de pedido</span>
    <span className="font-semibold text-gold">{kz(cart.total)}{cart.pending ? '+' : ''}</span>
  </button>
)}

      {search && <SearchOverlay />}
      <ProductDetails />
      <CartDrawer />
      {waiter && <WaiterView />}
      <PreviewModal />
      <ConfirmModal />
      <Toaster />
    </>
  );
}
