import { useEffect, useRef } from 'react';
import { set, useStore } from '../store.js';
import { saveAs, shareReceipt } from '../utils/receipt.js';

export default function PreviewModal() {
  const pv = useStore((s) => s.preview), dlg = useRef(null);
  useEffect(() => { if (pv && !dlg.current.open) dlg.current.showModal(); }, [pv]);
  useEffect(() => () => { if (pv) URL.revokeObjectURL(pv.url); }, [pv]);
  const canShare = !!pv && !!navigator.canShare?.({ files: [new File([pv.blob], 'a.png', { type: 'image/png' })] });
  return (
    <dialog ref={dlg} className="modal" aria-label="Pré-visualização do recibo" onClose={() => set({ preview: null })} onClick={(e) => e.target === dlg.current && dlg.current.close()}>
      {pv && (
        <div className="p-5">
          <h2 className="font-serif text-2xl">Pré-visualização</h2>
          <p className="mt-1 text-xs text-mute">Ainda nada foi descarregado. Confira a lista e escolha o formato.</p>
          <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl bg-white"><img src={pv.url} alt="Recibo informativo da lista de pedido" className="w-full" /></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="act" onClick={() => saveAs('pdf', pv)}>Baixar PDF</button>
            <button type="button" className="act" onClick={() => saveAs('png', pv)}>Baixar imagem</button>
            {canShare && <button type="button" className="act col-span-2" onClick={() => shareReceipt(pv)}>Partilhar…</button>}
          </div>
          <button type="button" className="mt-2 h-10 w-full text-sm text-mute hover:text-fg" onClick={() => dlg.current.close()}>Fechar</button>
        </div>
      )}
    </dialog>
  );
}
