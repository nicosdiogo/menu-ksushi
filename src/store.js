import { useSyncExternalStore, useMemo } from 'react';
import menu from './data/menu.json';
import site from './data/site.json';

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const persist = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };
const hash = () => decodeURIComponent(location.hash.slice(1));

export const categories = menu.categories;
export const products = new Map();
categories.forEach((c) => c.products.forEach((p) =>
  products.set(p.id, { ...p, category: c.name, imageUrl: p.image ? site.imageBase + p.image : null })));
export const mesa = new URLSearchParams(location.search).get(site.tableParam);

let state = { route: hash(), sort: 'menu', favs: load('ksushi-fav', []), cart: load('ksushi-cart', {}), details: null, cartOpen: false, waiter: false, search: false, toast: null, confirm: null, preview: null };
const subs = new Set();

export function set(patch) {
  const prev = state;
  state = { ...state, ...patch };
  if (state.favs !== prev.favs) persist('ksushi-fav', state.favs);
  if (state.cart !== prev.cart) persist('ksushi-cart', state.cart);
  subs.forEach((f) => f());
}
addEventListener('hashchange', () => set({ route: hash(), search: false }));

// O seletor deve devolver valores estáveis (primitivos ou referências do estado).
export const useStore = (sel) => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => sel(state));

export const toggleFav = (id) => set({ favs: state.favs.includes(id) ? state.favs.filter((x) => x !== id) : [...state.favs, id] });
export function setQty(id, n) {
  const c = { ...state.cart };
  if (n <= 0) delete c[id]; else c[id] = Math.min(n, 99);
  set({ cart: c });
}
export const clearCart = () => set({ cart: {} });

// Só soma produtos com preço numérico único; «Consultar» e preços duplos ficam por confirmar.
function summarize(cart) {
  const lines = Object.keys(cart).map((id) => products.get(id)).filter(Boolean)
    .map((p) => ({ p, q: cart[p.id], sub: p.price != null ? p.price * cart[p.id] : null }));
  return { lines, count: lines.reduce((a, l) => a + l.q, 0), total: lines.reduce((a, l) => a + (l.sub || 0), 0), pending: lines.some((l) => l.sub === null) };
}
export const useSummary = () => { const cart = useStore((s) => s.cart); return useMemo(() => summarize(cart), [cart]); };
export const getDetails = () => state.details;

// Aviso não bloqueante (opcionalmente com acção, ex.: «Desfazer»).
let toastTimer;
export function toast(msg, action) {
  clearTimeout(toastTimer);
  set({ toast: { id: Date.now(), msg, action } });
  toastTimer = setTimeout(() => set({ toast: null }), action ? 4000 : 1400);
}
// Pedido de confirmação num modal: ask({ title, text, ok, onOk }).
export const ask = (cfg) => set({ confirm: cfg });
export function addToCart(p, silent) {
  setQty(p.id, (state.cart[p.id] || 0) + 1);
  navigator.vibrate?.(12);
  if (!silent) toast(`${p.name} adicionado`);
}
