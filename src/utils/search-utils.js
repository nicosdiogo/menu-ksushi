export const norm = (s) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function matches(p, query) {
  const terms = norm(query).split(' ').filter(Boolean);
  if (!terms.length) return true;
  const hay = norm([p.name, p.description, p.category, p.quantity].filter(Boolean).join(' '));
  return terms.every((t) => hay.includes(t));
}
