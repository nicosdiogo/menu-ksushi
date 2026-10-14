export const kz = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' Kz';
export const nameOf = (p) => p.name + (p.quantity ? ` (${p.quantity})` : '');
// Preço unitário para recibo/lista: só números únicos; o resto fica «por confirmar».
export const unit = (p) => (p.price != null ? kz(p.price) : p.priceStatus === 'consultar' ? 'Consultar' : 'A confirmar');
