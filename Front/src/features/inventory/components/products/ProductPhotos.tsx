import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Ban, ExternalLink, ImagePlus, LoaderCircle, Star, Trash2, Upload } from "lucide-react";
import { EcommerceImage } from "../../../ecommerce/EcommerceImage";
import {
  editarImagenEcommerce,
  eliminarImagenEcommerce,
  obtenerFichaEcommerce,
  subirFotoEcommerce,
  type ImagenEcommerce,
} from "../../../../services/ecommerceApi";
import type { PendingProductPhoto } from "../../types/products";
import "../../styles/products.css";

const MAX_PHOTOS = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  productId?: number;
  productName: string;
  readonly?: boolean;
  pending?: PendingProductPhoto[];
  onPendingChange?: (photos: PendingProductPhoto[]) => void;
  initialImages?: ImagenEcommerce[];
  onImagesChange?: (images: ImagenEcommerce[]) => void;
  context?: "inventory" | "ecommerce";
};

export function ProductPhotos({ productId, productName, readonly = false, pending = [], onPendingChange = () => {}, initialImages, onImagesChange, context = "inventory" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImagenEcommerce[]>(() => [...(initialImages || [])].sort((a, b) => a.ordenVisual - b.ordenVisual));
  const [loading, setLoading] = useState(Boolean(productId && !initialImages));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!productId) return;
    setLoading(true);
    setError("");
    try {
      const data = await obtenerFichaEcommerce(productId);
      const next = [...data.imagenes].sort((a, b) => a.ordenVisual - b.ordenVisual);
      setImages(next); onImagesChange?.(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar las fotografías.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialImages) { const next = [...initialImages].sort((a, b) => a.ordenVisual - b.ordenVisual); setImages(next); onImagesChange?.(next); return; }
    void load();
    // La ficha de Catálogo puede entregar las imágenes iniciales y evita una segunda consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function validateFile(file: File) {
    if (!ACCEPTED.includes(file.type)) return "Solo se admiten archivos JPG, PNG o WebP.";
    if (file.size > MAX_BYTES) return "Cada fotografía puede pesar hasta 5 MB.";
    return "";
  }

  async function selectFiles(files: FileList | null) {
    if (!files?.length || readonly) return;
    const available = MAX_PHOTOS - (productId ? images.length : pending.length);
    const selected = Array.from(files).slice(0, Math.max(0, available));
    if (!selected.length) { setError("Se permiten hasta 3 fotografías por producto."); return; }
    const invalid = selected.map(validateFile).find(Boolean);
    if (invalid) { setError(invalid); return; }
    setError("");
    if (productId) {
      setBusy(true);
      try {
        for (let index = 0; index < selected.length; index += 1) {
          await subirFotoEcommerce(productId, selected[index], images.length === 0 && index === 0, images.length + index + 1, productName || "Producto");
        }
        await load();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No se pudo subir la fotografía.");
        await load();
      } finally { setBusy(false); }
    } else {
      const next = selected.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        esPrincipal: pending.length === 0 && index === 0,
        ordenVisual: pending.length + index + 1,
        textoAlternativo: productName || file.name,
      }));
      onPendingChange([...pending, ...next]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function updateImage(image: ImagenEcommerce, changes: Partial<ImagenEcommerce>) {
    if (!productId) return;
    setBusy(true); setError("");
    try {
      await editarImagenEcommerce(productId, image.productoImagenId, {
        urlArchivo: image.urlArchivo,
        textoAlternativo: image.textoAlternativo,
        esPrincipal: image.esPrincipal,
        ordenVisual: image.ordenVisual,
        ...changes,
      });
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo actualizar la fotografía."); }
    finally { setBusy(false); }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = images[index + direction];
    const current = images[index];
    if (!productId || !target || !current) return;
    setBusy(true); setError("");
    try {
      await editarImagenEcommerce(productId, current.productoImagenId, { ...current, ordenVisual: target.ordenVisual });
      await editarImagenEcommerce(productId, target.productoImagenId, { ...target, ordenVisual: current.ordenVisual });
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo cambiar el orden."); }
    finally { setBusy(false); }
  }

  async function removeImage(image: ImagenEcommerce) {
    if (!productId || !confirm(`¿Eliminar la fotografía de ${productName}?`)) return;
    setBusy(true); setError("");
    try { await eliminarImagenEcommerce(productId, image.productoImagenId); await load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo eliminar la fotografía."); }
    finally { setBusy(false); }
  }

  function updatePending(id: string, action: "main" | "up" | "down" | "remove") {
    let next = [...pending];
    const index = next.findIndex((photo) => photo.id === id);
    if (index < 0) return;
    if (action === "remove") {
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      if (next.length && !next.some((photo) => photo.esPrincipal)) next[0] = { ...next[0], esPrincipal: true };
    } else if (action === "main") {
      next = next.map((photo) => ({ ...photo, esPrincipal: photo.id === id }));
    } else {
      const destination = index + (action === "up" ? -1 : 1);
      if (destination < 0 || destination >= next.length) return;
      [next[index], next[destination]] = [next[destination], next[index]];
    }
    onPendingChange(next.map((photo, order) => ({ ...photo, ordenVisual: order + 1 })));
  }

  const count = productId ? images.length : pending.length;
  const mainImage = productId ? images.find((image) => image.esPrincipal) || images[0] : pending.find((image) => image.esPrincipal) || pending[0];

  return (
    <section className="product-form-section product-photo-section" aria-labelledby="product-photo-title">
      <header><span><ImagePlus size={18}/></span><div><h2 id="product-photo-title">Fotografías del producto</h2></div></header>
      {error && <div className="product-form-alert" role="alert"><Ban size={16}/><span>{error}</span></div>}
      {loading ? <div className="product-photo-loading"><LoaderCircle className="spin" size={22}/> Cargando fotografías…</div> : (
        <>
          <div className="product-photo-main">
            {productId
              ? <EcommerceImage url={(mainImage as ImagenEcommerce | undefined)?.urlArchivo} alt={productName}/>
              : mainImage
                ? <img src={(mainImage as PendingProductPhoto).previewUrl} alt={productName}/>
                : <span><ImagePlus size={28}/>Sin fotografía</span>}
            {mainImage && <em>Principal</em>}
          </div>
          {count > 0 && <div className="product-photo-strip">
            {(productId ? images : pending).map((photo, index) => {
              const stored = productId ? photo as ImagenEcommerce : null;
              const staged = productId ? null : photo as PendingProductPhoto;
              const isMain = stored?.esPrincipal ?? staged?.esPrincipal;
              return <div className={`product-photo-thumb ${isMain ? "is-main" : ""}`} key={stored?.productoImagenId ?? staged?.id}>
                {stored ? <EcommerceImage url={stored.urlArchivo} alt={stored.textoAlternativo || productName}/> : <img src={staged!.previewUrl} alt={staged!.textoAlternativo}/>} 
                {!readonly && <div className="product-photo-tools">
                  <button type="button" disabled={busy || isMain} title="Establecer como principal" onClick={() => stored ? void updateImage(stored, { esPrincipal: true }) : updatePending(staged!.id, "main")}><Star size={13}/></button>
                  <button type="button" disabled={busy || index === 0} title="Mover antes" onClick={() => stored ? void moveImage(index, -1) : updatePending(staged!.id, "up")}><ArrowUp size={13}/></button>
                  <button type="button" disabled={busy || index === count - 1} title="Mover después" onClick={() => stored ? void moveImage(index, 1) : updatePending(staged!.id, "down")}><ArrowDown size={13}/></button>
                  <button type="button" disabled={busy} title="Eliminar" onClick={() => stored ? void removeImage(stored) : updatePending(staged!.id, "remove")}><Trash2 size={13}/></button>
                </div>}
              </div>;
            })}
          </div>}
        </>
      )}
      {!readonly && <>
        <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void selectFiles(event.target.files)}/>
        <button type="button" className="button secondary product-photo-upload" disabled={busy || loading || count >= MAX_PHOTOS} onClick={() => inputRef.current?.click()}><Upload size={15}/>{busy ? "Procesando…" : count ? "Subir fotografías" : "Agregar fotografías"}</button>
        <small>JPG, PNG o WebP. Máximo 5 MB por imagen. Hasta 3 fotografías.</small>
      </>}
      {readonly && context === "inventory" && <div className="product-stock-note">Las fotografías de la tienda se administran desde E-commerce.{productId && <a className="customer-section-link" href={`/ecommerce/catalogo?productoId=${productId}`}><ExternalLink size={14}/> Abrir en Catálogo</a>}</div>}
    </section>
  );
}
