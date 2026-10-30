import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import './Toast.css';

type ToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

/** Aviso de éxito compartido. Se monta en document.body para no depender
 * del overflow, transform o posicionamiento de cada pantalla o modal. */
export function Toast({ message, onClose, duration = 4500 }: ToastProps) {
  // La función onClose puede cambiar en cada render: no reiniciar el temporizador.
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!message || duration <= 0) return;
    const timer = window.setTimeout(() => closeRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;
  return createPortal(
    <div className="ui-toast" role="status" aria-live="polite" aria-atomic="true">
      <CheckCircle2 size={20} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" className="ui-toast-close" onClick={onClose} aria-label="Cerrar notificación" title="Cerrar notificación">
        <X size={18} aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}
