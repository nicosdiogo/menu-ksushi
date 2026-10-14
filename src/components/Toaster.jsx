import { useEffect, useRef } from 'react';
import { set, useStore } from '../store.js';

// Popover «manual» fica na camada superior, acima dos modais abertos.
export default function Toaster() {
  const t = useStore((s) => s.toast), el = useRef(null);
  useEffect(() => {
    const n = el.current;
    if (!n?.showPopover) return;
    try { n.hidePopover(); } catch { /* já fechado */ }
    if (t) try { n.showPopover(); } catch { /* ignorar */ }
  }, [t]);
  return (
    <div ref={el} popover="manual" role="status" aria-live="polite" className="toast">
      {t && <>
        <span>{t.msg}</span>
        {t.action && <button type="button" className="font-semibold text-gold" onClick={() => { t.action.fn(); set({ toast: null }); }}>{t.action.label}</button>}
      </>}
    </div>
  );
}
