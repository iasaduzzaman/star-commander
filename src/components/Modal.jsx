import React, { useEffect, useRef } from 'react';

export default function Modal({ children, labelledBy, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const first = ref.current?.querySelector('button, [href], select, input');
    first?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#050B14]/80 fade p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div ref={ref} className={`rise w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto scroll-thin bg-navy-2 border border-navy-line rounded-t-2xl sm:rounded-2xl shadow-2xl`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {children}
      </div>
    </div>
  );
}
