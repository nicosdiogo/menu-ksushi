import { useEffect, useState } from 'react';
import { api, apiEnabled } from '../api.js';
import { kz } from '../utils/format-utils.js';
import { myOrders } from '../utils/my-orders.js';

export default function MyOrdersView() {
  const [list] = useState(myOrders);
  const [live, setLive] = useState({});

  useEffect(() => {
    if (!apiEnabled) return;
    list.slice(0, 10).forEach((o) => api.order(o.token).then((d) => setLive((s) => ({ ...s, [o.token]: d }))).catch(() => {}));
  }, [list]);

  return (
    <div className="page-in mx-auto max-w-2xl pb-10">
      <a href="#" className="mt-2 inline-flex h-11 items-center text-sm text-mute hover:text-fg">← Início</a>
      <h1 className="font-serif text-4xl">Os meus pedidos</h1>
      <p className="mt-1 text-xs text-mute">Guardados apenas neste dispositivo.</p>
      {!list.length && <p className="py-16 text-center text-mute">Ainda não fez nenhum pedido.</p>}
      <ul className="mt-4 space-y-2">
        {list.map((o) => (
          <li key={o.token}>
            <a href={`#pedido/${o.token}`} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent/60">
              <div>
                <p className="font-medium">{o.reference}</p>
                <p className="text-xs text-mute">{o.createdAt ? new Date(o.createdAt).toLocaleString('pt-PT') : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-gold">{kz(o.total)}</p>
                <p className="text-xs text-mute">{live[o.token]?.statusLabel ?? '…'}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
