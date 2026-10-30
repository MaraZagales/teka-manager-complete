import { useEffect, useState } from 'react';
import { resolverUrlImagenEcommerce } from '../../services/ecommerceApi';

type Props = { url: string | null | undefined; alt: string; className?: string };
/** Muestra una miniatura solo cuando el archivo responde; nunca presenta una imagen rota. */
export function EcommerceImage({ url, alt, className = '' }: Props) {
  const src = resolverUrlImagenEcommerce(url);
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [src]);
  if (!src || fallo) return <span className={`${className} ec-image-missing`} role="img" aria-label={`Fotografía no disponible: ${alt}`}>Sin foto disponible</span>;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFallo(true)} />;
}
