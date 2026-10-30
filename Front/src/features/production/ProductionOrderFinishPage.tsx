import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/data/PageHeader';
import { AppShell } from '../../components/layout/AppShell';
import { apiErrorMessage } from '../../services/apiClient';
import { productionOrdersApi, type ProductionFinishPreview } from '../../services/productionOrdersApi';
import { productionSupportApi, type Lookup } from '../../services/productionSupportApi';
import { suppliesApi, type ColorLookup, type Supply, type UnitLookup } from '../../services/suppliesApi';
import { productsApi, type Product } from '../../services/productsApi';
import { obtenerResumenCatalogoEcommerce, type ResumenCatalogoEcommerce } from '../../services/ecommerceApi';
import { EcommerceImage } from '../ecommerce/EcommerceImage';
import { formatProductName } from '../../services/productDisplay';
import { Image as ImageIcon } from 'lucide-react';
import { productionOrderNumber, quantity } from './productionOrderUtils';
import './productionOrders.css';

type ResultLine = { productoId: number; codigo: string; nombre: string; planned: number; actual: string };
type CutLine = { key: number; insumoId: string; tipoRecorteId: string; estadoRecorteId: string; colorId: string; dimension: string; unidadMedidaId: string; cantidad: string; observaciones: string };
let cutKey = 1;
const valueOf = (value: string) => Number(value.replace(',', '.'));
const decimal2Pattern = /^\d{1,15}(?:[.,]\d{1,2})?$/;
const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function ProductionOrderFinishPage({ orderId }: { orderId: number }) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [photos, setPhotos] = useState<ResumenCatalogoEcommerce[]>([]);
  const [preview, setPreview] = useState<ProductionFinishPreview | null>(null);
  const [results, setResults] = useState<ResultLine[]>([]);
  const [cuts, setCuts] = useState<CutLine[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [units, setUnits] = useState<UnitLookup[]>([]);
  const [colors, setColors] = useState<ColorLookup[]>([]);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [states, setStates] = useState<Lookup[]>([]);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([productionOrdersApi.getById(orderId), productionOrdersApi.finishPreview(orderId), suppliesApi.list(), suppliesApi.units(), suppliesApi.colors(), productionSupportApi.cutTypes(), productionSupportApi.cutStates()]).then(([order, p, s, u, c, t, e]) => {
      if (!normalized(order.estadoOrdenProduccionNombre).includes('proceso')) throw new Error('Solo se puede finalizar una orden En Proceso.');
      if (!live) return; setPreview(p); setSupplies(s.filter(item => item.activo)); setUnits(u); setColors(c); setTypes(t); setStates(e);
      const availableState = e.find(item => normalized(item.descripcion) === 'disponible');
      setResults(p.modelos.map(item => ({ productoId: item.productoId, codigo: item.productoCodigo, nombre: item.productoNombre, planned: item.cantidadPlanificada, actual: String(item.cantidadPlanificada) })));
      setCuts(p.recortesPrevistos.map(item => ({ key: cutKey++, insumoId: String(item.insumoId), tipoRecorteId: item.tipoRecorteId ? String(item.tipoRecorteId) : '', estadoRecorteId: availableState ? String(availableState.id) : '', colorId: item.colorId ? String(item.colorId) : '', dimension: item.dimension == null ? '' : String(item.dimension), unidadMedidaId: String(item.unidadMedidaId), cantidad: String(item.cantidadSugerida), observaciones: item.observaciones || '' })));
    }).catch(caught => { if (live) setError(apiErrorMessage(caught, 'No se pudo preparar la finalización.')); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [orderId]);

  useEffect(() => {
    let live = true;
    Promise.all([productsApi.list(), obtenerResumenCatalogoEcommerce()]).then(([products, images]) => {
      if (live) { setCatalogProducts(products); setPhotos(images); }
    }).catch(() => { /* La finalización debe funcionar aunque no carguen las fotografías. */ });
    return () => { live = false; };
  }, []);
  const productById = useMemo(() => new Map(catalogProducts.map(item => [item.productoId, item])), [catalogProducts]);
  const photoById = useMemo(() => new Map(photos.map(item => [item.productoId, item.urlPortada])), [photos]);

  const validation = useMemo(() => {
    if (results.some(item => !decimal2Pattern.test(item.actual.trim()) || !Number.isFinite(valueOf(item.actual)) || valueOf(item.actual) < 0)) return 'Ingresá cantidades fabricadas válidas, con hasta dos decimales.';
    const over = results.find(item => valueOf(item.actual) > item.planned); if (over) return `${over.nombre}: la cantidad real no puede superar ${quantity.format(over.planned)}.`;
    if (!results.some(item => valueOf(item.actual) > 0)) return 'Debe existir al menos una unidad fabricada.';
    if (cuts.some(item => !item.insumoId || !item.estadoRecorteId || !item.unidadMedidaId || !decimal2Pattern.test(item.cantidad.trim()) || !(valueOf(item.cantidad) > 0) || (item.dimension !== '' && (!decimal2Pattern.test(item.dimension.trim()) || !(valueOf(item.dimension) > 0))))) return 'Revisá los recortes recuperados: cantidades y dimensiones admiten hasta dos decimales.';
    return '';
  }, [results, cuts]);
  const totalProducts = results.reduce((sum, item) => sum + Math.max(0, valueOf(item.actual) || 0), 0);
  const updateCut = (key: number, patch: Partial<CutLine>) => setCuts(all => all.map(item => item.key === key ? { ...item, ...patch } : item));

  async function finish() {
    if (validation || saving) return; setSaving(true); setError('');
    try {
      await productionOrdersApi.finish(orderId, { resultados: results.map(item => ({ productoId: item.productoId, cantidad: valueOf(item.actual) })), recortesConfirmados: cuts.map(item => ({ insumoId: Number(item.insumoId), tipoRecorteId: item.tipoRecorteId ? Number(item.tipoRecorteId) : null, estadoRecorteId: Number(item.estadoRecorteId), colorId: item.colorId ? Number(item.colorId) : null, dimension: item.dimension ? valueOf(item.dimension) : null, unidadMedidaId: Number(item.unidadMedidaId), cantidad: valueOf(item.cantidad), observaciones: item.observaciones.trim() || null })), observaciones: observations.trim() || null });
      sessionStorage.setItem('production-order-notice', 'La orden se finalizó y los ingresos de inventario quedaron registrados.'); location.href = `/production/orders/${orderId}`;
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo finalizar la orden. No se registraron ingresos parciales.')); }
    finally { setSaving(false); }
  }

  return <AppShell title="Finalizar producción" breadcrumb="Producción / Órdenes / Finalizar"><main className="production-orders-page production-create-page production-finish-page">
    <a className="production-back-link" href={`/production/orders/${orderId}`}><ArrowLeft size={16}/> Volver a la orden</a>
    <PageHeader title={`Finalizar ${productionOrderNumber(orderId)}`}/>
    {loading ? <div className="production-detail-state">Preparando finalización…</div> : error && !preview ? <div className="production-message error"><AlertCircle size={18}/><span>{error}</span></div> : preview && <>
      <div className="production-finish-layout"><div className="production-finish-main"><section className="production-detail-section"><header><div><h2>Productos fabricados</h2></div></header><div className="production-finish-products">{results.map(item => <div key={item.productoId}><span className="production-product-identity"><span className="production-product-photo">{photoById.get(item.productoId) ? <EcommerceImage url={photoById.get(item.productoId)} alt={item.nombre}/> : <ImageIcon size={19}/>}</span><span><strong>{productById.get(item.productoId) ? formatProductName(productById.get(item.productoId)!) : item.nombre}</strong><small>{item.codigo}</small></span></span><span>Planificado <b>{quantity.format(item.planned)}</b></span><label><span>Cantidad real *</span><input className={valueOf(item.actual) > item.planned ? 'invalid' : ''} inputMode="decimal" value={item.actual} onChange={event => setResults(all => all.map(line => line.productoId === item.productoId ? { ...line, actual: event.target.value } : line))}/></label></div>)}</div></section>
      <section className="production-detail-section"><header><div><h2>Resumen final</h2></div></header><div className="production-summary-facts"><div><span>Productos terminados</span><strong>{quantity.format(totalProducts)} unidades</strong></div><div><span>Modelos informados</span><strong>{results.length}</strong></div><div><span>Recortes recuperados</span><strong>{cuts.length}</strong></div></div><label className="production-finish-observations"><span>Observaciones</span><textarea maxLength={250} value={observations} onChange={event => setObservations(event.target.value)}/></label><aside className="production-info-note">Al confirmar, todos los productos y recortes ingresarán al inventario en una única transacción. La operación no admite ingresos parciales.</aside></section>
</div>
      <div className="production-finish-side"><section className="production-detail-section"><header><div><h2>Recortes recuperados</h2></div><button className="button secondary" onClick={() => setCuts(all => [...all, { key: cutKey++, insumoId: '', tipoRecorteId: '', estadoRecorteId: String(states.find(state => normalized(state.descripcion) === 'disponible')?.id || ''), colorId: '', dimension: '', unidadMedidaId: '', cantidad: '', observaciones: '' }])}><Plus size={15}/> Agregar recorte</button></header>{cuts.length ? <div className="production-cut-editor">{cuts.map(item => <details className="production-finish-cut" key={item.key} open={!item.insumoId ? true : undefined}><summary><span className="production-finish-cut-label"><strong>{supplies.find(s => String(s.insumoId) === item.insumoId)?.nombre || "Nuevo recorte"}</strong><small>{types.find(t => String(t.id) === item.tipoRecorteId)?.descripcion || "Recorte"} · {item.cantidad || "—"} {units.find(u => String(u.id) === item.unidadMedidaId)?.abreviatura || ""}</small></span><span className="production-finish-cut-action">Editar</span></summary><div className="production-finish-cut-fields"><label><span>Material *</span><select value={item.insumoId} onChange={event => updateCut(item.key, { insumoId: event.target.value })}><option value="">Seleccionar</option>{supplies.map(supply => <option key={supply.insumoId} value={supply.insumoId}>{supply.codigo} · {supply.nombre}</option>)}</select></label><label><span>Tipo</span><select value={item.tipoRecorteId} onChange={event => updateCut(item.key, { tipoRecorteId: event.target.value })}><option value="">Sin especificar</option>{types.map(type => <option key={type.id} value={type.id}>{type.descripcion}</option>)}</select></label><label><span>Estado</span><select value={item.estadoRecorteId} disabled><option value="">No disponible</option>{states.map(state => <option key={state.id} value={state.id}>{state.descripcion}</option>)}</select></label><label><span>Color</span><select value={item.colorId} onChange={event => updateCut(item.key, { colorId: event.target.value })}><option value="">Sin especificar</option>{colors.map(color => <option key={color.id} value={color.id}>{color.descripcion}</option>)}</select></label><label><span>Dimensión</span><input inputMode="decimal" value={item.dimension} onChange={event => updateCut(item.key, { dimension: event.target.value })}/></label><label><span>Unidad *</span><select value={item.unidadMedidaId} onChange={event => updateCut(item.key, { unidadMedidaId: event.target.value })}><option value="">Seleccionar</option>{units.map(unit => <option key={unit.id} value={unit.id}>{unit.abreviatura}</option>)}</select></label><label><span>Cantidad *</span><input inputMode="decimal" value={item.cantidad} onChange={event => updateCut(item.key, { cantidad: event.target.value })}/></label><button className="production-remove" aria-label="Quitar recorte" onClick={() => setCuts(all => all.filter(line => line.key !== item.key))}><Trash2 size={16}/></button></div></details>)}</div> : <div className="production-inline-empty">La orden finalizará sin recortes recuperados.</div>}</section>

      </div></div>
      {validation && <div className="production-message error"><AlertCircle size={18}/><span>{validation}</span></div>}{error && <div className="production-message error"><AlertCircle size={18}/><span>{error}</span></div>}
      <footer className="production-page-actions"><a className="button secondary" href={`/production/orders/${orderId}`}>Cancelar</a><button className="button primary" disabled={Boolean(validation) || saving} onClick={() => void finish()}>{saving ? 'Finalizando…' : 'Confirmar finalización'}</button></footer>
    </>}
  </main></AppShell>;
}
