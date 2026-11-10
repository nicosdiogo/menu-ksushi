import { useEffect, useState } from 'react';
import { api, apiEnabled, ApiError } from '../api.js';
import { clearCart, table, useSummary } from '../store.js';
import { kz, nameOf } from '../utils/format-utils.js';
import { saveMyOrder } from '../utils/my-orders.js';

const TYPES = [['dine_in', 'Na mesa'], ['pickup', 'Levantamento'], ['delivery', 'Entrega']];
// «Pagar no levantamento» só existe sem entregador; «pagar ao entregador» só com entrega.
const METHODS = {
  dine_in: [['pay_restaurant', 'Pagar no restaurante'], ['transfer', 'Transferência']],
  pickup: [['pay_pickup', 'Pagar no levantamento'], ['transfer', 'Transferência']],
  delivery: [['cash_courier', 'Pagar ao entregador'], ['transfer', 'Transferência']],
};
const input = 'h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none focus:border-accent';

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm text-mute">{label}</span>
    {children}
    {error && <span role="alert" className="mt-1 block text-xs text-red-400">{error}</span>}
  </label>
);

const Choice = ({ on, disabled, onClick, children, hint }) => (
  <button type="button" disabled={disabled} aria-pressed={on} onClick={onClick}
    className={`rounded-xl border px-3 py-3 text-left text-sm transition disabled:opacity-40 ${on ? 'border-accent bg-accent/10' : 'border-line hover:border-mute'}`}>
    {children}{hint && <span className="mt-0.5 block text-xs text-mute">{hint}</span>}
  </button>
);

export default function CheckoutView() {
  const s = useSummary();
  const [cfg, setCfg] = useState(null);
  const [errors, setErrors] = useState({});
  const [fail, setFail] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    type: table ? 'dine_in' : 'pickup', name: '', phone: '', address: '', area: '',
    pickup_point: '', pickup_time: '', notes: '', payment_method: '', transfer_provider: 'express',
  });
  const up = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!apiEnabled) return;
    api.settings()
      .then((c) => { setCfg(c); setF((p) => ({ ...p, pickup_point: p.pickup_point || c.pickup_points[0] || '' })); })
      .catch(() => setCfg({ delivery_fee: 0, pickup_points: [], pickup_lead_minutes: 20 }));
  }, []);

  if (!apiEnabled) return <p className="page-in pt-10 text-mute">Os pedidos online não estão disponíveis nesta versão (só consulta do menu).</p>;
  if (!s.count) return (
    <div className="page-in pt-10">
      <p className="text-mute">A lista de pedido está vazia.</p>
      <a href="#" className="mt-3 inline-block underline">Voltar ao menu</a>
    </div>
  );

  const type = f.type;
  const methods = METHODS[type];
  const method = methods.some(([k]) => k === f.payment_method) ? f.payment_method : methods[0][0];
  const fee = type === 'delivery' ? cfg?.delivery_fee ?? 0 : 0;
  const err = (k) => errors[k]?.[0];

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErrors({}); setFail('');
    const clean = (v) => (v && String(v).trim() ? String(v).trim() : undefined);
    try {
      const order = await api.createOrder({
        type,
        table_token: type === 'dine_in' ? table?.token : undefined,
        name: f.name.trim(),
        phone: clean(f.phone),
        address: type === 'delivery' ? clean(f.address) : undefined,
        area: type === 'delivery' ? clean(f.area) : undefined,
        pickup_point: type === 'pickup' ? clean(f.pickup_point) : undefined,
        pickup_time: type === 'pickup' ? clean(f.pickup_time) : undefined,
        notes: clean(f.notes),
        payment_method: method,
        transfer_provider: method === 'transfer' ? f.transfer_provider : undefined,
        items: s.lines.map((l) => ({ id: l.p.id, qty: l.q })),
      });
      saveMyOrder(order);
      clearCart();
      location.hash = `pedido/${order.token}`;
    } catch (ex) {
      if (ex instanceof ApiError) {
        setErrors(ex.errors);
        setFail(ex.status === 422 ? 'Verifique os campos assinalados.' : ex.message);
      } else setFail('Erro inesperado. Tente novamente.');
    } finally { setBusy(false); }
  }

  return (
    <div className="page-in mx-auto max-w-5xl pb-10">
      <a href="#" className="mt-2 inline-flex h-11 items-center text-sm text-mute hover:text-fg">← Voltar ao menu</a>
      <h1 className="font-serif text-4xl lg:text-5xl">Finalizar pedido</h1>
      {cfg?.demo_notice && <p role="note" className="mt-3 rounded-xl border border-line bg-surface p-3 text-sm text-mute">ⓘ {cfg.demo_notice}</p>}

      <form onSubmit={submit} noValidate className="mt-6 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm text-mute">Como quer o pedido?</legend>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(([k, l]) => (
                <Choice key={k} on={type === k} disabled={k === 'dine_in' && !table} hint={k === 'dine_in' && !table ? 'Leia o QR da mesa' : undefined}
                  onClick={() => setF((p) => ({ ...p, type: k }))}>{l}</Choice>
              ))}
            </div>
            {err('table_token') && <p role="alert" className="mt-1 text-xs text-red-400">{err('table_token')}</p>}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" error={err('name')}><input className={input} value={f.name} onChange={up('name')} autoComplete="name" /></Field>
            <Field label={type === 'dine_in' ? 'Telemóvel (opcional)' : 'Telemóvel'} error={err('phone')}>
              <input className={input} value={f.phone} onChange={up('phone')} inputMode="tel" autoComplete="tel" />
            </Field>
          </div>

          {type === 'pickup' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Local de levantamento" error={err('pickup_point')}>
                <select className={input} value={f.pickup_point} onChange={up('pickup_point')}>
                  {(cfg?.pickup_points ?? []).map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Hora (opcional)" error={err('pickup_time')}>
                <input className={input} type="time" value={f.pickup_time} onChange={up('pickup_time')} />
                <span className="mt-1 block text-xs text-mute">Vazio = o mais cedo possível (cerca de {cfg?.pickup_lead_minutes ?? 20} min).</span>
              </Field>
            </div>
          )}

          {type === 'delivery' && (
            <div className="space-y-4">
              <Field label="Morada de entrega" error={err('address')}>
                <textarea className={`${input} h-24 py-3`} value={f.address} onChange={up('address')} />
              </Field>
              <Field label="Bairro ou ponto de referência (opcional)" error={err('area')}>
                <input className={input} value={f.area} onChange={up('area')} />
              </Field>
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-sm text-mute">Pagamento</legend>
            <div className="grid grid-cols-2 gap-2">
              {methods.map(([k, l]) => <Choice key={k} on={method === k} onClick={() => setF((p) => ({ ...p, payment_method: k }))}>{l}</Choice>)}
            </div>
            {method === 'transfer' && (
              <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Aplicação de pagamento">
                {[['express', 'Pagamento Express'], ['kwik', 'Kwik']].map(([k, l]) => (
                  <Choice key={k} on={f.transfer_provider === k} onClick={() => setF((p) => ({ ...p, transfer_provider: k }))}>{l}</Choice>
                ))}
                <p className="col-span-2 text-xs text-mute">Os dados do restaurante aparecem depois de fazer o pedido.</p>
              </div>
            )}
            {err('payment_method') && <p role="alert" className="mt-1 text-xs text-red-400">{err('payment_method')}</p>}
            {err('transfer_provider') && <p role="alert" className="mt-1 text-xs text-red-400">{err('transfer_provider')}</p>}
          </fieldset>

          <Field label="Observações (opcional)" error={err('notes')}>
            <textarea className={`${input} h-20 py-3`} value={f.notes} onChange={up('notes')} maxLength={300} />
          </Field>
        </div>

        <aside className="mt-8 rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-20 lg:mt-0">
          <h2 className="font-serif text-xl">Resumo</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {s.lines.map((l) => (
              <li key={l.p.id} className="flex justify-between gap-3">
                <span>{l.q}× {nameOf(l.p)}</span>
                <span className="text-gold">{l.sub != null ? kz(l.sub) : 'a confirmar'}</span>
              </li>
            ))}
          </ul>
          {type === 'delivery' && <p className="mt-3 flex justify-between text-sm"><span className="text-mute">Taxa de entrega</span><span>{kz(fee)}</span></p>}
          <p className="mt-3 flex justify-between border-t border-line pt-3 text-lg"><span>Total</span><span className="font-semibold text-gold">{kz(s.total + fee)}</span></p>
          {s.pending && <p className="mt-1 text-xs text-mute">Itens «Consultar» ou por confirmar não estão incluídos no total.</p>}
          {err('items') && <p role="alert" className="mt-2 text-xs text-red-400">{errors.items.join(' ')}</p>}
          {fail && <p role="alert" className="mt-3 text-sm text-red-400">{fail}</p>}
          <button type="submit" disabled={busy} className="mt-4 h-12 w-full rounded-full bg-accent font-medium text-bg disabled:opacity-60">
            {busy ? 'A enviar…' : 'Fazer pedido'}
          </button>
        </aside>
      </form>
    </div>
  );
}
