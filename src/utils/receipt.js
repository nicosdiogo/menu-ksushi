import site from '../data/site.json';
import { kz, nameOf, unit } from './format-utils.js';

export function makeReceipt(s, mesa) {
  const W = 800, S = 2, y0 = 260 + s.lines.length * 52, H = y0 + 150;
  const c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
  const g = c.getContext('2d'); g.scale(S, S);
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  const t = (txt, x, y, font, align = 'left', color = '#111') => { g.font = font; g.textAlign = align; g.fillStyle = color; g.fillText(txt, x, y); };
  const fit = (txt, max, font) => { g.font = font; while (g.measureText(txt).width > max && txt.length > 1) txt = txt.slice(0, -2) + '…'; return txt; };
  const dash = (y) => { g.setLineDash([6, 4]); g.beginPath(); g.moveTo(40, y); g.lineTo(W - 40, y); g.strokeStyle = '#999'; g.stroke(); g.setLineDash([]); };
  t('K-SUSHI', W / 2, 80, '700 46px Georgia, serif', 'center');
  t('LISTA DE PEDIDO', W / 2, 115, '600 18px Arial, sans-serif', 'center', '#555');
  t('Documento informativo. Não é fatura nem confirmação de encomenda.', W / 2, 145, '14px Arial, sans-serif', 'center', '#777');
  t(new Date().toLocaleString('pt-PT') + (mesa ? `  ·  Mesa ${mesa}` : ''), W / 2, 175, '15px Arial, sans-serif', 'center', '#333');
  dash(205);
  [['Qtd', 40, 'left'], ['Descrição', 100, 'left'], ['Preço', 600, 'right'], ['Subtotal', 760, 'right']].forEach(([l, x, a]) => t(l, x, 235, '600 14px Arial, sans-serif', a, '#555'));
  s.lines.forEach((l, i) => {
    const y = 275 + i * 52;
    t(`${l.q}×`, 40, y, '600 20px Arial, sans-serif');
    t(fit(nameOf(l.p), 440, '17px Arial, sans-serif'), 100, y, '17px Arial, sans-serif');
    t(unit(l.p), 600, y, '15px Arial, sans-serif', 'right', '#444');
    t(l.sub != null ? kz(l.sub) : '—', 760, y, '600 17px Arial, sans-serif', 'right');
  });
  dash(y0 - 15);
  t('TOTAL', 40, y0 + 30, '700 24px Arial, sans-serif');
  t(kz(s.total), 760, y0 + 30, '700 24px Arial, sans-serif', 'right');
  if (s.pending) t('Itens «Consultar» ou por confirmar não estão incluídos no total.', 40, y0 + 65, '13px Arial, sans-serif', 'left', '#777');
  return c;
}

async function pdfBlob(c) {
  const jpg = new Uint8Array(await (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92))).arrayBuffer());
  const W = 595, H = Math.round((W * c.height) / c.width), enc = new TextEncoder(), parts = [], off = [];
  let len = 0;
  const add = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, s) => { off[n] = len; add(`${n} 0 obj\n${s}\nendobj\n`); };
  add('%PDF-1.4\n');
  obj(1, '<</Type/Catalog/Pages 2 0 R>>');
  obj(2, '<</Type/Pages/Kids[3 0 R]/Count 1>>');
  obj(3, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>`);
  off[4] = len;
  add(`4 0 obj\n<</Type/XObject/Subtype/Image/Width ${c.width}/Height ${c.height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>\nstream\n`);
  add(jpg); add('\nendstream\nendobj\n');
  const cs = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
  obj(5, `<</Length ${cs.length}>>\nstream\n${cs}\nendstream`);
  const xo = len;
  add('xref\n0 6\n0000000000 65535 f \n' + [1, 2, 3, 4, 5].map((n) => `${String(off[n]).padStart(10, '0')} 00000 n \n`).join(''));
  add(`trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xo}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export async function exportFile(kind, s, mesa) {
  const c = makeReceipt(s, mesa);
  if (kind === 'png') c.toBlob((b) => download(b, 'k-sushi-lista-pedido.png'), 'image/png');
  else download(await pdfBlob(c), 'k-sushi-lista-pedido.pdf');
}

// Sem número configurado, o WhatsApp deixa o cliente escolher o contacto.
export function sendWhatsApp(s, mesa) {
  const text = [
    '*K-Sushi — Lista de pedido*', mesa ? `Mesa ${mesa}` : null, '',
    ...s.lines.map((l) => `${l.q}× ${nameOf(l.p)} — ${unit(l.p)}${l.sub != null ? ` = ${kz(l.sub)}` : ''}`), '',
    `*Total: ${kz(s.total)}*`, s.pending ? '(itens «Consultar» ou por confirmar não incluídos)' : null,
    '_Lista informativa, não é encomenda._',
  ].filter((x) => x !== null).join('\n');
  open(`https://wa.me/${site.whatsappNumber || ''}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}
