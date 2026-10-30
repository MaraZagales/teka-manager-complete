import { useEffect, useState } from 'react';
import { Package, Pencil, X } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { hasPermission } from '../../services/authorization';
import { guardarFichaEcommerce, obtenerFichaEcommerce, type FichaEcommerce, type ImagenEcommerce, type ProductoEcommerce, type StockEcommerce } from '../../services/ecommerceApi';
import { ProductPhotos } from '../inventory/components/products/ProductPhotos';

type Tab = 'publicacion' | 'medidas' | 'imagenes' | 'modelo' | 'disponibilidad';
type Props = { producto: ProductoEcommerce; stock: StockEcommerce[]; onClose: () => void; onSaved?: () => void; initialTab?: Tab };
const tabs: { id: Tab; texto: string }[] = [
  { id: 'publicacion', texto: 'Publicación' }, { id: 'medidas', texto: 'Medidas' },
  { id: 'imagenes', texto: 'Imágenes' }, { id: 'modelo', texto: 'Modelo 3D' },
  { id: 'disponibilidad', texto: 'Disponibilidad' },
];

function validarNumero(text: string, entero: boolean, requerido = false): string {
  if (!text.trim()) return requerido ? 'Este campo es obligatorio.' : '';
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(text) || (entero && !/^\d+$/.test(text))) return entero ? 'Ingresá un número entero no negativo.' : 'Ingresá un número positivo con hasta dos decimales.';
  if (!Number.isFinite(Number(text.replace(',', '.')))) return 'Número inválido.';
  return '';
}

export function EcommerceProductEditor({ producto, stock, onClose, onSaved, initialTab = 'publicacion' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [editando, setEditando] = useState(false);
  const [ficha, setFicha] = useState<FichaEcommerce | null>(null);
  const [imagenes, setImagenes] = useState<ImagenEcommerce[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [numeros, setNumeros] = useState<Record<string, string>>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const canEdit = hasPermission('E-commerce', 'Editar');
  const depositos = [...new Map(stock.filter((item) => item.productoId === producto.productoId).map((item) => [item.depositoId, item.depositoNombre])).entries()];

  async function recargar() {
    setCargando(true); setError('');
    try { const data = await obtenerFichaEcommerce(producto.productoId); setFicha(data.ficha); setImagenes(data.imagenes); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo cargar la ficha.'); }
    finally { setCargando(false); }
  }
  useEffect(() => { setNumeros({}); setTocados({}); setEditando(false); void recargar(); }, [producto.productoId]);

  function cambiar<K extends keyof FichaEcommerce>(key: K, value: FichaEcommerce[K]) { setFicha((current) => current ? { ...current, [key]: value } : current); setMensaje(''); }

  async function guardarFicha() {
    if (!ficha) return;
    const invalidNumbers = Object.entries(numeros).filter(([key, value]) => validarNumero(value, ['Orden de visualización', 'Cupo máximo online'].includes(key)));
    if (invalidNumbers.length) { setTocados((current) => ({ ...current, ...Object.fromEntries(invalidNumbers.map(([key]) => [key, true])) })); setError('Corregí los campos numéricos marcados antes de guardar.'); return; }
    if (ficha.ordenVisual < 0 || !Number.isInteger(ficha.ordenVisual)) { setError('El orden debe ser un entero no negativo.'); return; }
    if (ficha.destacado && !ficha.publicado) { setError('Un producto destacado debe estar publicado.'); return; }
    const medidas = [ficha.anchoCm, ficha.altoCm, ficha.profundidadCm];
    if (medidas.some((value) => value !== null) && medidas.some((value) => value === null || !Number.isFinite(value) || value <= 0)) { setError('Ingresá las tres medidas positivas, o dejalas vacías.'); return; }
    if ((ficha.depositoId === null) !== (ficha.cupoOnline === null) || (ficha.cupoOnline !== null && (!Number.isFinite(ficha.cupoOnline) || ficha.cupoOnline < 0))) { setError('Seleccioná depósito y cupo válido juntos.'); return; }
    if (ficha.escalaValidada && !ficha.urlGlb && !ficha.urlUsdz) { setError('Para validar escala debe existir un modelo 3D.'); return; }
    if (ficha.publicado) {
      const problems: string[] = [];
      if (!producto.activo) problems.push('el producto está inactivo');
      if (!ficha.descripcionComercial?.trim()) problems.push('falta descripción comercial');
      if (medidas.some((value) => value === null)) problems.push('faltan medidas');
      if (imagenes.length !== 3) problems.push('debe tener exactamente tres imágenes');
      if (!imagenes.some((image) => image.esPrincipal)) problems.push('falta imagen de portada');
      if (ficha.depositoId === null || ficha.cupoOnline === null || ficha.cupoOnline <= 0) problems.push('falta cupo online positivo');
      if (problems.length) { setError(`No se puede publicar: ${problems.join('; ')}.`); return; }
    }
    setGuardando(true); setError(''); setMensaje('');
    try { const { productoId: _productoId, ...payload } = ficha; await guardarFichaEcommerce(producto.productoId, payload); await recargar(); onSaved?.(); setEditando(false); setMensaje('Cambios guardados correctamente.'); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo guardar.'); }
    finally { setGuardando(false); }
  }

  const textField = (label: string, value: string, onChange: (value: string) => void, placeholder = '') => <label className="ec-field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>;
  const numberField = (label: string, value: number | null, onChange: (value: number | null) => void, step = '0.01') => {
    const integer = step === '1' || label === 'Cupo máximo online';
    const content = numeros[label] ?? (value === null ? '' : String(value));
    const fieldError = tocados[label] ? validarNumero(content, integer) : '';
    return <label className="ec-field"><span>{label}</span><input type="text" inputMode={integer ? 'numeric' : 'decimal'} autoComplete="off" value={content} aria-invalid={Boolean(fieldError)} onBlur={() => setTocados((current) => ({ ...current, [label]: true }))} onChange={(event) => { const raw = event.target.value; setNumeros((current) => ({ ...current, [label]: raw })); if (!validarNumero(raw, integer)) onChange(raw.trim() ? Number(raw.replace(',', '.')) : null); }}/>{fieldError && <small className="ec-field-error">{fieldError}</small>}</label>;
  };

  return <aside className="ec-detail-panel" aria-label={`Ficha comercial de ${producto.nombre}`}>
    <header className="ec-detail-header"><div className="ec-detail-identity"><span className="ec-detail-icon"><Package size={22}/></span><div><h2>{producto.nombre}</h2><p>Código {producto.codigo}</p></div></div><button type="button" className="ec-detail-close" onClick={onClose} aria-label="Cerrar ficha"><X size={19}/></button></header>
    <div className="ec-editor">
      <div className="ec-tabs" role="tablist" aria-label="Ficha comercial">{tabs.map((item) => <button type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'selected' : ''} key={item.id} onClick={() => { setTab(item.id); if (item.id === 'imagenes') setEditando(false); setError(''); setMensaje(''); }}>{item.texto}</button>)}</div>
      {cargando ? <p>Cargando ficha comercial…</p> : !ficha ? <p>No se pudo recuperar la ficha. <button onClick={() => void recargar()}>Reintentar</button></p> : tab === 'imagenes' ? <><ProductPhotos productId={producto.productoId} productName={producto.nombre} readonly={!canEdit} context="ecommerce" initialImages={imagenes} onImagesChange={setImagenes}/><div className="ec-footer"><button type="button" className="button secondary" onClick={onClose}>Cerrar</button></div></> : !editando ? <>
        <div className="ec-readonly-detail">
          {tab === 'publicacion' && <><div><span>Publicación</span><strong>{ficha.publicado ? 'Publicado' : 'Oculto'}</strong></div><div><span>Destacado</span><strong>{ficha.destacado ? 'Sí' : 'No'}</strong></div><div><span>Orden</span><strong>{ficha.ordenVisual}</strong></div><div className="ec-readonly-wide"><span>Descripción comercial</span><p>{ficha.descripcionComercial || 'Sin descripción'}</p></div></>}
          {tab === 'medidas' && <><div><span>Ancho</span><strong>{ficha.anchoCm === null ? 'Sin registrar' : `${ficha.anchoCm} cm`}</strong></div><div><span>Alto</span><strong>{ficha.altoCm === null ? 'Sin registrar' : `${ficha.altoCm} cm`}</strong></div><div><span>Profundidad</span><strong>{ficha.profundidadCm === null ? 'Sin registrar' : `${ficha.profundidadCm} cm`}</strong></div><p className="ec-note ec-readonly-wide">La edición se conserva temporalmente para no impedir la publicación. Su administración canónica debe permanecer en Inventario.</p></>}
          {tab === 'disponibilidad' && <><div><span>Depósito configurado</span><strong>{depositos.find(([id]) => id === ficha.depositoId)?.[1] || 'Sin configurar'}</strong></div><div><span>Cupo online</span><strong>{ficha.cupoOnline ?? 'Sin configurar'}</strong></div><p className="ec-note ec-readonly-wide">El cupo limita la venta del canal. El stock físico se administra en Inventario.</p></>}
          {tab === 'modelo' && <><div className="ec-readonly-wide"><span>Modelo GLB</span><p>{ficha.urlGlb || 'Sin archivo'}</p></div><div className="ec-readonly-wide"><span>Modelo USDZ</span><p>{ficha.urlUsdz || 'Sin archivo'}</p></div><div><span>Escala validada</span><strong>{ficha.escalaValidada ? 'Sí' : 'No'}</strong></div><p className="ec-note ec-readonly-wide">Configuración administrativa existente. La exposición de estos recursos en la aplicación móvil todavía no fue verificada.</p></>}
        </div><div className="ec-footer"><button type="button" className="button secondary" onClick={onClose}>Cerrar</button>{canEdit && <button type="button" className="button primary" onClick={() => { setEditando(true); setError(''); }}><Pencil size={16}/>Editar ficha online</button>}</div>
      </> : <>
        {tab === 'publicacion' && <div className="ec-editor-grid"><label className="ec-check"><input type="checkbox" checked={ficha.publicado} onChange={(event) => { cambiar('publicado', event.target.checked); if (!event.target.checked) cambiar('destacado', false); }}/>Publicado en el canal digital</label><label className="ec-check"><input type="checkbox" checked={ficha.destacado} disabled={!ficha.publicado} onChange={(event) => cambiar('destacado', event.target.checked)}/>Producto destacado</label>{numberField('Orden de visualización', ficha.ordenVisual, (value) => cambiar('ordenVisual', value ?? 0), '1')}<label className="ec-field ec-full"><span>Descripción comercial</span><textarea rows={4} maxLength={2000} value={ficha.descripcionComercial ?? ''} onChange={(event) => cambiar('descripcionComercial', event.target.value || null)}/></label></div>}
        {tab === 'medidas' && <div className="ec-editor-grid">{numberField('Ancho (cm)', ficha.anchoCm, (value) => cambiar('anchoCm', value))}{numberField('Alto (cm)', ficha.altoCm, (value) => cambiar('altoCm', value))}{numberField('Profundidad (cm)', ficha.profundidadCm, (value) => cambiar('profundidadCm', value))}<p className="ec-note ec-full">Las medidas deben informarse las tres juntas.</p></div>}
        {tab === 'modelo' && <div className="ec-editor-grid">{textField('URL del modelo GLB', ficha.urlGlb ?? '', (value) => cambiar('urlGlb', value || null))}{textField('URL del modelo USDZ', ficha.urlUsdz ?? '', (value) => cambiar('urlUsdz', value || null))}<label className="ec-check ec-full"><input type="checkbox" checked={ficha.escalaValidada} onChange={(event) => cambiar('escalaValidada', event.target.checked)}/>La escala del modelo 3D fue validada</label></div>}
        {tab === 'disponibilidad' && <div className="ec-editor-grid"><label className="ec-field"><span>Depósito para venta online</span><select value={ficha.depositoId ?? ''} onChange={(event) => { const id = event.target.value ? Number(event.target.value) : null; setFicha((current) => current ? { ...current, depositoId: id, cupoOnline: id === null ? null : current.cupoOnline ?? 0 } : current); }}><option value="">Sin configuración</option>{depositos.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>{numberField('Cupo máximo online', ficha.cupoOnline, (value) => cambiar('cupoOnline', value))}<p className="ec-note ec-full">El cupo define el máximo disponible para el canal y no modifica el stock físico.</p></div>}
        <div className="ec-footer"><button type="button" className="button secondary" onClick={() => { void recargar(); setEditando(false); setError(''); }}>Cancelar</button><button type="button" className="button primary" disabled={guardando || cargando} onClick={() => void guardarFicha()}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button></div>
      </>}
      {error && <div role="alert" className="ec-error">{error}</div>}
      <Toast message={mensaje} onClose={() => setMensaje('')}/>
    </div>
  </aside>;
}
