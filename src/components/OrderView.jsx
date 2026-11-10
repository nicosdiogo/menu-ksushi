import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { ask, toast } from '../store.js';
import { kz } from '../utils/format-utils.js';

function Row({ label, value, copy }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-mute">{label}</dt>
      <dd className="flex items-center gap-2 font-medium">
        {value}
        {copy && <button type="button" className="rounded-full border border-line px-2 py-0.5 text-xs text-mute hover:text-fg"
          onClick={() => { navigator.clipboard?.writeText(copy); toast('Copiado'); }}>Copiar</button>}
      </dd>
    </div>
  );
}

export default function OrderView({ token }) {
  const [o, setO] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [proofErr, setProofErr] = useState('');

  const load = useCallback(async () => {
    try { setO(await api.order(token)); setErr(''); }
    catch (e) { setErr(e.status === 404 ? 'Pedido não encontrado.' : 'Sem ligação. A tentar de novo…'); }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  const final = o?.final;
  useEffect(() => {
    if (final) return undefined;
    const id = setInterval(() => { if (!document.hidden) load(); }, 5000);
    return () => clearInterval(id);
  }, [final, load]);

  async function upload(file) {
    if (!file) return;
    setBusy(true); setProofErr('');
    try { setO(await api.uploadProof(token, file)); toast('Comprovativo enviado'); }
    catch (e) { setProofErr(e.errors?.proof?.[0] || e.message); }
    finally { setBusy(false); }
  }

  const cancel = () => ask({
    title: 'Cancelar pedido?', text: 'Só é possível enquanto o restaurante ainda não o confirmou.', ok: 'Cancelar pedido',
    onOk: async () => {
      try { setO(await api.cancelOrder(token)); toast('Pedido cancelado'); }
      catch (e) { toast(e.errors?.order?.[0] || e.message); }
    },
  });

  if (!o) return <p className="page-in pt-10 text-mute">{err || 'A carregar o pedido…'}</p>;
  const pay = o.payment, ins = pay.instructions;

  return (
    <div className="page-in mx-auto max-w-2xl pb-10">
      <a href="#pedidos" className="mt-2 inline-flex h-11 items-center text-sm text-mute hover:text-fg">← Os meus pedidos</a>
      <p className="text-xs uppercase tracking-[.3em] text-mute">{o.typeLabel}{o.table ? ` · Mesa ${o.table}` : ''}</p>
      <h1 className="font-serif text-4xl">{o.reference}</h1>
      <p className="mt-2"><span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-bg">{o.statusLabel}</span></p>
      {err && <p role="status" className="mt-2 text-xs text-mute">{err}</p>}

      {o.cancelled ? (
        <p role="note" className="mt-6 rounded-xl border border-line bg-surface p-3 text-sm text-mute">Este pedido foi cancelado.</p>
      ) : (
        <ol className="mt-6 space-y-3" aria-label="Estado do pedido">
          {o.timeline.map((st) => (
            <li key={st.key} className="flex items-center gap-3" aria-current={st.state === 'current' ? 'step' : undefined}>
              <span className={`grid size-6 place-items-center rounded-full border text-xs ${st.state === 'done' ? 'border-accent bg-accent text-bg' : st.state === 'current' ? 'animate-pulse border-accent text-gold' : 'border-line text-mute'}`}>
                {st.state === 'done' ? '✓' : ''}
              </span>
              <span className={st.state === 'todo' ? 'text-mute' : ''}>{st.label}</span>
            </li>
          ))}
        </ol>
      )}

      {!o.cancelled && (
        <section className="mt-6 rounded-2xl border border-line bg-surface p-4" aria-label="Pagamento">
          {ins ? (
            <>
              <h2 className="font-serif text-xl">Pagamento por {ins.providerLabel}</h2>
              {pay.status === 'rejected' && <p role="alert" className="mt-1 text-sm text-red-400">O comprovativo foi rejeitado. Envie outro.</p>}
              {ins.text && <p className="mt-2 text-sm text-mute">{ins.text}</p>}
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Número" value={ins.phone} copy={ins.phone} />
                <Row label="Titular" value={ins.holder} />
                <Row label="Referência" value={ins.reference} copy={ins.reference} />
                <Row label="Valor" value={kz(ins.amount)} copy={String(ins.amount)} />
              </dl>
              {ins.note && <p role="note" className="mt-3 rounded-lg border border-line p-2 text-xs text-mute">{ins.note}</p>}
              <label className="act mt-4 grid cursor-pointer place-items-center">
                {busy ? 'A enviar…' : 'Enviar comprovativo'}
                <input type="file" accept="image/*,application/pdf" className="sr-only" disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              {proofErr && <p role="alert" className="mt-2 text-xs text-red-400">{proofErr}</p>}
            </>
          ) : pay.method === 'transfer' ? (
            <p className="text-sm">{pay.status === 'paid' ? '✓ Pagamento confirmado.' : 'Comprovativo recebido. A aguardar a confirmação do restaurante.'}</p>
          ) : (
            <p className="text-sm"><span className="text-mute">Pagamento:</span> {pay.methodLabel} · {pay.statusLabel}</p>
          )}
        </section>
      )}

      <section className="mt-6" aria-label="Detalhes">
        <h2 className="font-serif text-xl">Pedido</h2>
        <p className="mt-1 text-sm text-mute">
          {o.type === 'pickup' && `${o.pickup_point} · ${o.pickup_time || 'o mais cedo possível'}`}
          {o.type === 'delivery' && [o.delivery_address, o.delivery_area].filter(Boolean).join(' · ')}
          {o.type === 'dine_in' && `Mesa ${o.table}`}
        </p>
        <ul className="mt-3 divide-y divide-line text-sm">
          {o.items.map((i, k) => (
            <li key={k} className="flex justify-between gap-3 py-2">
              <span>{i.qty}× {i.name}{i.quantity ? ` (${i.quantity})` : ''}</span>
              <span className="text-gold">{i.line_total != null ? kz(i.line_total) : 'a confirmar'}</span>
            </li>
          ))}
        </ul>
        {o.delivery_fee > 0 && <p className="mt-2 flex justify-between text-sm"><span className="text-mute">Taxa de entrega</span><span>{kz(o.delivery_fee)}</span></p>}
        <p className="mt-2 flex justify-between border-t border-line pt-2 text-lg"><span>Total</span><span className="font-semibold text-gold">{kz(o.total)}</span></p>
        {o.has_pending_prices && <p className="mt-1 text-xs text-mute">Itens por confirmar não estão incluídos no total; o restaurante indica o valor final.</p>}
        {o.notes && <p className="mt-3 text-sm text-mute">Observações: {o.notes}</p>}
      </section>

      {o.can_cancel && <button type="button" className="act mt-6 w-full" onClick={cancel}>Cancelar pedido</button>}
    </div>
  );
}
