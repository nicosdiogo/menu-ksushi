import { readFileSync } from 'node:fs';
const menu = JSON.parse(readFileSync(new URL('../src/data/menu.json', import.meta.url), 'utf8'));
const expected = { 'sushi-pratos-principais': 50, 'entradas-acompanhamentos': 8, 'bebidas-cocktails': 6, sobremesas: 5 };
const errors = [], ids = new Set();
for (const c of menu.categories) {
  if (c.products.length !== expected[c.id]) errors.push(`${c.id}: ${c.products.length} produtos (esperado ${expected[c.id]})`);
  for (const p of c.products) {
    if (ids.has(p.id)) errors.push(`id duplicado: ${p.id}`);
    ids.add(p.id);
    if (!p.name || !p.image) errors.push(`campos em falta: ${p.id}`);
    if (p.priceStatus === 'listed' && !p.priceText) errors.push(`sem preço: ${p.id}`);
    if (p.priceStatus === 'consultar' && (p.price !== null || p.priceText)) errors.push(`preço inventado: ${p.id}`);
  }
}
const total = ids.size, want = Object.values(expected).reduce((a, b) => a + b, 0);
if (total !== want) errors.push(`total ${total} ≠ ${want}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${total} produtos em ${menu.categories.length} categorias.`);
