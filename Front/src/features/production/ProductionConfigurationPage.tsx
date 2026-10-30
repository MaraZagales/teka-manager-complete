import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/data/PageHeader';
import { AppShell } from '../../components/layout/AppShell';
import { apiErrorMessage } from '../../services/apiClient';
import { productsApi, type Product } from '../../services/productsApi';
import { formatProductName } from '../../services/productDisplay';
import { productionRecipesApi, type MaterialDetail } from '../../services/productionRecipesApi';
import { productionSupportApi, type Lookup } from '../../services/productionSupportApi';
import { suppliesApi, type ColorLookup, type Supply, type UnitLookup } from '../../services/suppliesApi';
import { ProductionFabricationPanel } from './ProductionFabricationPanel';
import './productionOrders.css';
import './productionConfigurationWizard.css';

type MaterialLine = { key: number; insumoId: string; cantidad: string; observaciones: string };
type CutLine = { key: number; insumoId: string; tipoRecorteId: string; colorId: string; dimension: string; unidadMedidaId: string; cantidadPorUnidad: string; observaciones: string };
let nextKey = 1;
const numberValue = (value: string) => Number(value.replace(',', '.'));
const decimal2Pattern = /^\d{1,15}(?:[.,]\d{1,2})?$/;
const decimal4Pattern = /^\d{1,13}(?:[.,]\d{1,4})?$/;

export function ProductionConfigurationPage({ productId }: { productId: number }) {
  const sourceId = Number(new URLSearchParams(location.search).get('source')) || null;
  const [product, setProduct] = useState<Product | null>(null);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [units, setUnits] = useState<UnitLookup[]>([]);
  const [colors, setColors] = useState<ColorLookup[]>([]);
  const [cutTypes, setCutTypes] = useState<Lookup[]>([]);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [activate, setActivate] = useState(false);
  const [materials, setMaterials] = useState<MaterialLine[]>([{ key: nextKey++, insumoId: '', cantidad: '', observaciones: '' }]);
  const [cuts, setCuts] = useState<CutLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(0);
  const steps = ['Configuración', 'Despiece', 'Plano de corte', 'Materiales', 'Recortes', 'Revisión'];

  useEffect(() => {
    let live = true;
    Promise.all([productsApi.getById(productId), suppliesApi.list(), suppliesApi.units(), suppliesApi.colors(), productionSupportApi.cutTypes(), productionRecipesApi.lists()]).then(async ([p, s, u, c, t, existingLists]) => {
      if (!live) return; setProduct(p); setSupplies(s.filter(item => item.activo)); setUnits(u); setColors(c); setCutTypes(t);
      // La API requiere la versión en el payload. Se propone automáticamente
      // el siguiente entero libre entre las versiones existentes del modelo.
      const usedVersions = new Set(existingLists.filter(item => item.productoId === productId).map(item => (item.version || '').trim()));
      let nextVersion = 1;
      while (usedVersions.has(String(nextVersion))) nextVersion += 1;
      setVersion(String(nextVersion));
      if (sourceId) {
        const [source, sourceMaterials, sourceCuts] = await Promise.all([productionRecipesApi.lists().then(all => all.find(item => item.listaMaterialesId === sourceId)), productionRecipesApi.details(sourceId), productionRecipesApi.expectedCuts(sourceId)]);
        if (!live) return;
        if (source?.productoId !== productId) throw new Error('La configuración de origen no corresponde al modelo.');
        setName(source.nombre);
        setMaterials(sourceMaterials.map(item => ({ key: nextKey++, insumoId: String(item.insumoId), cantidad: String(item.cantidad), observaciones: item.observaciones || '' })));
        setCuts(sourceCuts.map(item => ({ key: nextKey++, insumoId: String(item.insumoId), tipoRecorteId: item.tipoRecorteId ? String(item.tipoRecorteId) : '', colorId: item.colorId ? String(item.colorId) : '', dimension: item.dimension == null ? '' : String(item.dimension), unidadMedidaId: String(item.unidadMedidaId), cantidadPorUnidad: String(item.cantidadPorUnidad), observaciones: item.observaciones || '' })));
      }
    }).catch(caught => { if (live) setError(apiErrorMessage(caught, 'No se pudo preparar la configuración.')); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [productId, sourceId]);

  const duplicateMaterials = useMemo(() => materials.some((item, index) => item.insumoId && materials.findIndex(other => other.insumoId === item.insumoId) !== index), [materials]);
  function validate() {
    if (!name.trim() || !version.trim()) return 'No se pudo determinar el nombre o la versión de la configuración.';
    if (!materials.length || materials.some(item => !item.insumoId || !decimal2Pattern.test(item.cantidad.trim()) || !(numberValue(item.cantidad) > 0))) return 'Todos los materiales necesitan un insumo y una cantidad positiva con hasta dos decimales.';
    if (duplicateMaterials) return 'Un mismo insumo no puede aparecer dos veces.';
    if (cuts.some(item => !item.insumoId || !item.unidadMedidaId || !decimal4Pattern.test(item.cantidadPorUnidad.trim()) || !(numberValue(item.cantidadPorUnidad) > 0) || (item.dimension !== '' && (!decimal2Pattern.test(item.dimension.trim()) || !(numberValue(item.dimension) > 0))))) return 'Revisá los recortes: dimensión admite dos decimales y cantidad por unidad hasta cuatro.';
    return '';
  }
  function nextStep() {
    setFormError('');
    if (step === 0 && (!name.trim() || !version.trim())) { setFormError('Completá el nombre de la configuración.'); return; }
    if (step === 3 && (!materials.length || materials.some(item => !item.insumoId || !decimal2Pattern.test(item.cantidad.trim()) || !(numberValue(item.cantidad) > 0)) || duplicateMaterials)) { setFormError('Revisá los materiales: seleccioná un insumo, ingresá cantidades positivas y evitá duplicados.'); return; }
    if (step === 4 && cuts.some(item => !item.insumoId || !item.unidadMedidaId || !decimal4Pattern.test(item.cantidadPorUnidad.trim()) || !(numberValue(item.cantidadPorUnidad) > 0) || (item.dimension !== '' && (!decimal2Pattern.test(item.dimension.trim()) || !(numberValue(item.dimension) > 0))))) { setFormError('Revisá las cantidades y unidades de los recortes previstos.'); return; }
    setStep(value => Math.min(5, value + 1));
  }
  async function save() {
    const validation = validate(); setFormError(validation); if (validation || saving) return;
    setSaving(true);
    try {
      await productionRecipesApi.createVersion({ productoId: productId, nombre: name.trim(), version: version.trim(), activar: activate, materiales: materials.map(item => ({ insumoId: Number(item.insumoId), cantidad: numberValue(item.cantidad), observaciones: item.observaciones.trim() || null })), recortesPrevistos: cuts.map(item => ({ insumoId: Number(item.insumoId), tipoRecorteId: item.tipoRecorteId ? Number(item.tipoRecorteId) : null, colorId: item.colorId ? Number(item.colorId) : null, dimension: item.dimension ? numberValue(item.dimension) : null, unidadMedidaId: Number(item.unidadMedidaId), cantidadPorUnidad: numberValue(item.cantidadPorUnidad), observaciones: item.observaciones.trim() || null })) });
      sessionStorage.setItem('production-model-notice', `Versión ${version.trim()} creada correctamente.`); location.href = '/production/models-materials';
    } catch (caught) { setFormError(apiErrorMessage(caught, 'No se pudo guardar la configuración.')); }
    finally { setSaving(false); }
  }
  const updateMaterial = (key: number, patch: Partial<MaterialLine>) => setMaterials(all => all.map(item => item.key === key ? { ...item, ...patch } : item));
  const updateCut = (key: number, patch: Partial<CutLine>) => setCuts(all => all.map(item => item.key === key ? { ...item, ...patch } : item));

  return <AppShell title="Nueva configuración" breadcrumb="Producción / Modelos y materiales / Nueva configuración"><main className="production-orders-page production-create-page">
    <a className="production-back-link" href="/production/models-materials"><ArrowLeft size={16}/> Volver al listado</a>
    <PageHeader title="Registrar configuración de fabricación"/>
    {loading ? <div className="production-detail-state">Preparando configuración…</div> : error ? <div className="production-message error"><AlertCircle size={18}/><span>{error}</span></div> : <>
      {product && <div className="production-config-product"><div className="production-config-product-main"><span className="production-config-product-label">Producto a configurar</span><strong>{product.codigo} · {formatProductName(product)}</strong></div><div className="production-config-product-color"><span>Color</span><strong>{product.colorNombre || 'Sin especificar'}</strong>{product.codigoHex && <span className="production-config-color-dot" style={{ backgroundColor: product.codigoHex }} aria-hidden="true"/>}</div></div>}
      <nav className="production-wizard-steps" aria-label="Etapas de configuración">{steps.map((label, index) => <button key={label} type="button" className={`production-wizard-step ${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`} onClick={() => { if (index < step) { setStep(index); setFormError(''); } }} aria-current={index === step ? 'step' : undefined}><span className="production-wizard-number">{index < step ? <Check size={16}/> : index + 1}</span><span>{label}</span></button>)}</nav>
      {step === 0 && <section className="production-detail-section production-config-form"><header><div><h2>Datos de la configuración</h2></div></header><div className="production-config-grid"><label><span>Nombre *</span><input value={name} maxLength={120} onChange={event => setName(event.target.value)}/></label><label><span>Versión asignada automáticamente</span><input value={version || 'Calculando…'} readOnly aria-label="Versión automática"/></label><label className="production-config-activation"><input type="checkbox" checked={activate} onChange={event => setActivate(event.target.checked)}/><span>Activar la lista de materiales al guardar</span></label></div></section>}
      <div className={step === 1 || step === 2 ? "production-wizard-planning" : "production-wizard-planning-hidden"}><ProductionFabricationPanel productId={productId} wizardView={step === 2 ? "cut" : "pieces"}/></div>
      {step === 3 && <section className="production-detail-section production-config-entry-section"><header><div><h2>Materiales necesarios</h2></div><button className="button secondary" onClick={() => setMaterials(all => [...all, { key: nextKey++, insumoId: '', cantidad: '', observaciones: '' }])}><Plus size={15}/> Agregar material</button></header><div className="production-config-lines">{materials.map(item => <div key={item.key}><label><span>Insumo *</span><select value={item.insumoId} onChange={event => updateMaterial(item.key, { insumoId: event.target.value })}><option value="">Seleccionar</option>{supplies.map(supply => <option key={supply.insumoId} value={supply.insumoId}>{supply.codigo} · {supply.nombre}</option>)}</select></label><label><span>Cantidad por unidad *</span><input inputMode="decimal" value={item.cantidad} onChange={event => updateMaterial(item.key, { cantidad: event.target.value })}/></label><label><span>Observaciones</span><input value={item.observaciones} maxLength={250} onChange={event => updateMaterial(item.key, { observaciones: event.target.value })}/></label><button className="production-remove" aria-label="Quitar material" disabled={materials.length === 1} onClick={() => setMaterials(all => all.filter(line => line.key !== item.key))}><Trash2 size={16}/></button></div>)}</div></section>}
      {step === 4 && <section className="production-detail-section production-config-entry-section"><header><div><h2>Recortes previstos</h2></div><button className="button secondary" onClick={() => setCuts(all => [...all, { key: nextKey++, insumoId: '', tipoRecorteId: '', colorId: '', dimension: '', unidadMedidaId: '', cantidadPorUnidad: '', observaciones: '' }])}><Plus size={15}/> Agregar recorte</button></header>{cuts.length ? <div className="production-config-lines production-config-cut-lines">{cuts.map(item => <div key={item.key}><label><span>Material *</span><select value={item.insumoId} onChange={event => updateCut(item.key, { insumoId: event.target.value })}><option value="">Seleccionar</option>{supplies.map(supply => <option key={supply.insumoId} value={supply.insumoId}>{supply.codigo} · {supply.nombre}</option>)}</select></label><label><span>Tipo</span><select value={item.tipoRecorteId} onChange={event => updateCut(item.key, { tipoRecorteId: event.target.value })}><option value="">Sin especificar</option>{cutTypes.map(type => <option key={type.id} value={type.id}>{type.descripcion}</option>)}</select></label><label><span>Color</span><select value={item.colorId} onChange={event => updateCut(item.key, { colorId: event.target.value })}><option value="">Sin especificar</option>{colors.map(color => <option key={color.id} value={color.id}>{color.descripcion}</option>)}</select></label><label><span>Dimensión</span><input inputMode="decimal" value={item.dimension} onChange={event => updateCut(item.key, { dimension: event.target.value })}/></label><label><span>Unidad *</span><select value={item.unidadMedidaId} onChange={event => updateCut(item.key, { unidadMedidaId: event.target.value })}><option value="">Seleccionar</option>{units.map(unit => <option key={unit.id} value={unit.id}>{unit.abreviatura} · {unit.descripcion}</option>)}</select></label><label><span>Cantidad por unidad *</span><input inputMode="decimal" value={item.cantidadPorUnidad} onChange={event => updateCut(item.key, { cantidadPorUnidad: event.target.value })}/></label><button className="production-remove" aria-label="Quitar recorte" onClick={() => setCuts(all => all.filter(line => line.key !== item.key))}><Trash2 size={16}/></button></div>)}</div> : <div className="production-inline-empty">No se prevén recortes recuperables para esta versión.</div>}</section>}
      {step === 5 && <section className="production-detail-section production-wizard-review"><header><div><h2>Revisar configuración</h2><p>Confirmá los datos antes de registrar esta versión.</p></div></header><div className="production-wizard-summary"><div><span>Modelo</span><strong>{product?.codigo} · {product ? formatProductName(product) : ''}</strong></div><div><span>Color del producto</span><strong>{product?.colorNombre || 'Sin especificar'}</strong></div><div><span>Configuración</span><strong>{name} · Versión {version}</strong></div><div><span>Materiales registrados</span><strong>{materials.length}</strong></div><div><span>Recortes previstos</span><strong>{cuts.length}</strong></div><div><span>Activación solicitada</span><strong>{activate ? 'Sí' : 'No'}</strong></div></div><p className="production-wizard-hint"><AlertCircle size={16}/> El despiece y el plano se calcularon con los servicios existentes. La lista de materiales se registra con las cantidades ingresadas; el cálculo visual no modifica automáticamente la BOM. La aprobación técnica y su activación se realizan por separado.</p></section>}
      {formError && <div className="production-message error"><AlertCircle size={18}/><span>{formError}</span></div>}
      <footer className="production-page-actions production-wizard-actions"><a className="button secondary" href="/production/models-materials">Cancelar</a><div className="production-wizard-navigation">{step > 0 && <button className="button secondary" onClick={() => { setStep(value => value - 1); setFormError(''); }}><ChevronLeft size={16}/> Anterior</button>}{step < 5 ? <button className="button primary" onClick={nextStep}>Continuar <ChevronRight size={16}/></button> : <button className="button primary" disabled={saving} onClick={() => void save()}>{saving ? 'Guardando…' : 'Guardar configuración'}</button>}</div></footer>
    </>}
  </main></AppShell>;
}
