import { useEffect, useRef } from 'react';
import { set, useStore } from '../store.js';

export default function ConfirmModal() {
  const c = useStore((s) => s.confirm), dlg = useRef(null);
  useEffect(() => { if (c && !dlg.current.open) dlg.current.showModal(); }, [c]);
  return (
    <dialog ref={dlg} className="modal" aria-label={c?.title} onClose={() => set({ confirm: null })} onClick={(e) => e.target === dlg.current && dlg.current.close()}>
      {c && (
        <div className="p-6">
          <h2 className="font-serif text-xl">{c.title}</h2>
          <p className="mt-2 text-sm text-mute">{c.text}</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" className="act" onClick={() => dlg.current.close()}>Cancelar</button>
            <button type="button" className="h-11 rounded-full bg-accent text-sm font-medium text-bg" onClick={() => { c.onOk(); dlg.current.close(); }}>{c.ok}</button>
          </div>
        </div>
      )}
    </dialog>
  );
}
