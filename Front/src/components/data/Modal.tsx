import { X } from 'lucide-react';
import type { ReactNode } from 'react';
export function Modal({ title, subtitle, children, onClose, wide = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`modal ${wide ? 'wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}><header><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></header>{children}</section></div>;
}
