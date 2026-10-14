import { useEffect } from 'react';
import { set, mesa, useSummary } from '../store.js';
import { kz, nameOf, unit } from '../utils/format-utils.js';

export default function WaiterView() {
  const s = useSummary();
  const close = () => set({ waiter: false });
  useEffect(() => { if (!s.count) close(); }, [s.count]);
  useEffect(() => {
    let lock = null;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', onKey);
    navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { removeEventListener('keydown', onKey); lock?.release?.(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg" role="dialog" aria-label="Pedido para mostrar ao empregado">
      <div className="mx-auto max-w-3xl px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[.3em] text-mute">K-Sushi{mesa ? ` · Mesa ${mesa}` : ''}</p>
            <h2 className="font-serif text-3xl">Pedido</h2>
          </div>
          <button type="button" className="h-11 rounded-full bg-white/10 px-5" onClick={close}>Sair</button>
        </div>
        <ul className="mt-6 divide-y divide-line">
          {s.lines.map((l) => (
            <li key={l.p.id} className="flex items-baseline gap-4 py-4">
              <span className="w-16 font-serif text-4xl text-gold">{l.q}×</span>
              <span className="flex-1 text-xl uppercase tracking-wide">{nameOf(l.p)}</span>
              <span className="text-mute">{l.sub != null ? kz(l.sub) : unit(l.p)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex justify-between text-2xl"><span>Total</span><span className="text-gold">{kz(s.total)}</span></p>
        <p className="mt-3 text-xs text-mute">Lista informativa, não é encomenda nem fatura.{s.pending ? ' Itens «Consultar» ou por confirmar não estão incluídos no total.' : ''}</p>
      </div>
    </div>
  );
}
