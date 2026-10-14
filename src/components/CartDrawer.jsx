import { useEffect, useRef } from 'react';
import { set, setQty, clearCart, mesa, useStore, useSummary } from '../store.js';
import { kz, nameOf } from '../utils/format-utils.js';
import { exportFile, sendWhatsApp } from '../utils/receipt.js';

export default function CartDrawer() {
  const open = useStore((s) => s.cartOpen), s = useSummary(), dlg = useRef(null);
  useEffect(() => {
    if (open && !dlg.current.open) dlg.current.showModal();
    else if (!open && dlg.current.open) dlg.current.close();
  }, [open]);
  const close = () => set({ cartOpen: false });

  return (
    <dialog id="cart" ref={dlg} aria-label="Lista de pedido" onClose={close} onClick={(e) => e.target === dlg.current && close()}>
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="font-serif text-2xl">Lista de pedido</h2>
          <p className="mt-1 text-xs text-mute">Para mostrar ao empregado. Não é uma encomenda nem uma fatura.</p>
        </div>
        <button type="button" className="icon-btn shrink-0" aria-label="Fechar lista" onClick={close}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
        {s.lines.map((l) => (
          <li key={l.p.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium uppercase tracking-wide">{nameOf(l.p)}</p>
              <p className="text-xs text-mute">{l.p.price != null ? kz(l.p.price) : l.p.priceText || 'Consultar'}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="step" aria-label="Menos um" onClick={() => setQty(l.p.id, l.q - 1)}>−</button>
              <span className="w-6 text-center" aria-live="polite">{l.q}</span>
              <button type="button" className="step" aria-label="Mais um" onClick={() => setQty(l.p.id, l.q + 1)}>+</button>
            </div>
            <p className="w-24 text-right text-sm text-gold">{l.sub != null ? kz(l.sub) : '—'}</p>
          </li>
        ))}
        {!s.count && <li className="py-12 text-center text-mute">A lista está vazia. Toque no + de um prato para o adicionar.</li>}
      </ul>
      {s.count > 0 && (
        <div className="border-t border-line p-5">
          <p className="flex justify-between text-lg"><span>Total</span><span className="font-semibold text-gold">{kz(s.total)}</span></p>
          {s.pending && <p className="mt-1 text-xs text-mute">Itens «Consultar» ou com preço por confirmar não estão incluídos no total.</p>}
          <button type="button" className="mt-4 h-12 w-full rounded-full bg-accent font-medium" onClick={() => set({ cartOpen: false, waiter: true })}>Mostrar ao empregado</button>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button type="button" className="act" onClick={() => exportFile('pdf', s, mesa)}>PDF</button>
            <button type="button" className="act" onClick={() => exportFile('png', s, mesa)}>Imagem</button>
            <button type="button" className="act" onClick={() => sendWhatsApp(s, mesa)}>WhatsApp</button>
          </div>
          <button type="button" className="mt-2 h-10 w-full text-sm text-mute hover:text-fg" onClick={() => confirm('Limpar toda a lista?') && clearCart()}>Limpar lista</button>
        </div>
      )}
    </dialog>
  );
}
