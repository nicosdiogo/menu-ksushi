// Pedidos feitos neste dispositivo (sem conta): só guardam a ligação de acompanhamento.
const KEY = 'ksushi-orders';

export const myOrders = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; } };

export function saveMyOrder(o) {
  const list = [{ token: o.token, reference: o.reference, total: o.total, createdAt: o.created_at }, ...myOrders().filter((x) => x.token !== o.token)].slice(0, 20);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignorar */ }
}
