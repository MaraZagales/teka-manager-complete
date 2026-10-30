import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../../components/data/Modal';
import { AlertCircle, ArrowLeft, Check, ChevronLeft, ChevronRight, ClipboardList, Image as ImageIcon, Info, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/data/PageHeader';
import { AppShell } from '../../components/layout/AppShell';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { obtenerResumenCatalogoEcommerce, resolverUrlImagenEcommerce, type ResumenCatalogoEcommerce } from '../../services/ecommerceApi';
import { inventoryStockApi, type StockSupply } from '../../services/inventoryStockApi';
import { formatProductName } from '../../services/productDisplay';
import { productsApi, type Product } from '../../services/productsApi';
import { productionRecipesApi, type MaterialDetail, type MaterialList } from '../../services/productionRecipesApi';
import { productionOrdersApi, type ProductionLookup, type ProductionTemplate } from '../../services/productionOrdersApi';
import { suppliesApi, type Supply } from '../../services/suppliesApi';
import { productionSupportApi, type CutStock } from '../../services/productionSupportApi';
import { quantity } from './productionOrderUtils';
import { recortesInteligentesApi, type Propuesta, type DetallePropuesta } from '../../services/recortesInteligentesApi';
import './productionOrders.css';

type Step = 1 | 2 | 3 | 4;
type Line = { product: Product; recipeId: number; quantity: string };
type Errors = { type?: string; observations?: string; models?: string; quantities?: Record<number, string>; recipes?: Record<number, string> };
type MaterialTotal = MaterialDetail & { required: number; available: number | null; unit: string };
const CATALOG_PAGE_SIZE = 4;
const quantityPattern = /^\d{1,15}(?:[.,]\d{1,2})?$/;
const quantityValue = (value: string) => Number(value.replace(',', '.')) || 0;

export function ProductionOrderCreatePage() {
  const canCreate = hasPermission('Producción', 'Crear');
  const rawDesignId = new URLSearchParams(window.location.search).get('recorteDisenoId');
  const designId = rawDesignId && /^\d+$/.test(rawDesignId) && Number(rawDesignId) > 0 ? Number(rawDesignId) : null;
  const fromDesign = rawDesignId !== null;
  const [designValidation, setDesignValidation] = useState<Awaited<ReturnType<typeof productionOrdersApi.validateDesign>> | null>(null);
  const [designError, setDesignError] = useState('');
  const [designLoading, setDesignLoading] = useState(fromDesign);
  const [step, setStep] = useState<Step>(1);
  const [materialPage, setMaterialPage] = useState(1);
  const MATERIAL_PAGE_SIZE = 6;
  const [designs, setDesigns] = useState<Propuesta[]>([]);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [designsError, setDesignsError] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(designId);
  const [designDetail, setDesignDetail] = useState<DetallePropuesta | null>(null);
  const [designDetailLoading, setDesignDetailLoading] = useState(false);
  const [designQuantity, setDesignQuantity] = useState('1');
  const [types, setTypes] = useState<ProductionLookup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<MaterialList[]>([]);
  const [materials, setMaterials] = useState<Record<number, MaterialDetail[] | 'loading' | 'error'>>({});
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [supplyStock, setSupplyStock] = useState<StockSupply[] | null>(null);
  const [covers, setCovers] = useState<ResumenCatalogoEcommerce[]>([]);
  const [templates, setTemplates] = useState<ProductionTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [cutStock, setCutStock] = useState<CutStock[]>([]);
  const [selectedCuts, setSelectedCuts] = useState<number[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [typeId, setTypeId] = useState('');
  const [observations, setObservations] = useState('');
  const [query, setQuery] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([productionOrdersApi.types(), productsApi.list(), productionRecipesApi.lists()])
      .then(async ([typeResult, productResult, recipeResult]) => {
        if (!active) return;
        setTypes(typeResult); setProducts(productResult.filter(item => item.activo)); setRecipes(recipeResult);
        const optional = await Promise.allSettled([suppliesApi.list(), inventoryStockApi.supplies(), obtenerResumenCatalogoEcommerce(), productionOrdersApi.templates(), productionSupportApi.cutStock()]);
        if (!active) return;
        if (optional[0].status === 'fulfilled') setSupplies(optional[0].value);
        if (optional[1].status === 'fulfilled') setSupplyStock(optional[1].value);
        if (optional[2].status === 'fulfilled') setCovers(optional[2].value);
        if (optional[3].status === 'fulfilled') setTemplates(optional[3].value.filter(item => item.activa));
        if (optional[4].status === 'fulfilled') setCutStock(optional[4].value.filter(item => item.cantidadActual > 0));
      })
      .catch(error => { if (active) setCatalogError(apiErrorMessage(error, 'No se pudieron consultar los datos necesarios para crear la orden.')); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!fromDesign) return;
    if (!designId) { setDesignError('El identificador del diseño es inválido.'); setDesignLoading(false); return; }
    let active = true;
    void productionOrdersApi.validateDesign(designId)
      .then(result => { if (active) setDesignValidation(result); })
      .catch(error => { if (active) setDesignError(apiErrorMessage(error, 'No se pudo validar el diseño.')); })
      .finally(() => { if (active) setDesignLoading(false); });
    return () => { active = false; };
  }, [fromDesign, designId]);

  useEffect(() => {
    if (!isCutTypeSelected(typeId, types) && !fromDesign) return;
    let active = true;
    setDesignsLoading(true);
    setDesignsError('');
    void recortesInteligentesApi.todasPropuestas()
      .then(result => {
        if (!active) return;
        setDesigns(result.items.filter(item => item.EstadoRevision === 'Aprobada'));
        if (result.truncated) setDesignsError('El listado es parcial. Buscá el diseño desde Gestión de Recortes si no aparece.');
      })
      .catch(error => { if (active) setDesignsError(apiErrorMessage(error, 'No se pudieron consultar los diseños aprobados.')); })
      .finally(() => { if (active) setDesignsLoading(false); });
    return () => { active = false; };
  }, [typeId, types, fromDesign]);

  useEffect(() => {
    if (!selectedDesignId) { setDesignDetail(null); setDesignValidation(null); return; }
    let active = true;
    setDesignDetail(null);
    setDesignValidation(null);
    setDesignError('');
    setDesignDetailLoading(true);
    void Promise.all([recortesInteligentesApi.detalle(selectedDesignId), productionOrdersApi.validateDesign(selectedDesignId)])
      .then(([detail, validation]) => { if (active) { setDesignDetail(detail); setDesignValidation(validation); } })
      .catch(error => { if (active) setDesignError(apiErrorMessage(error, 'No se pudo consultar o validar el diseño seleccionado.')); })
      .finally(() => { if (active) setDesignDetailLoading(false); });
    return () => { active = false; };
  }, [selectedDesignId]);

  useEffect(() => {
    if (!fromDesign || typeId || !types.length) return;
    const cutType = types.find(item => /recort/i.test(item.descripcion));
    if (cutType) setTypeId(String(cutType.id));
  }, [fromDesign, typeId, types]);

  const activeRecipes = useMemo(() => recipes.filter(item => item.activa), [recipes]);
  const recipesByProduct = useMemo(() => {
    const result = new Map<number, MaterialList[]>();
    activeRecipes.forEach(recipe => result.set(recipe.productoId, [...(result.get(recipe.productoId) ?? []), recipe]));
    return result;
  }, [activeRecipes]);
  const coverByProduct = useMemo(() => new Map(covers.map(item => [item.productoId, resolverUrlImagenEcommerce(item.urlPortada)])), [covers]);
  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es-AR');
    return products.filter(product => !lines.some(line => line.product.productoId === product.productoId) && (!normalized || `${product.codigo} ${formatProductName(product)} ${product.tipoProductoNombre}`.toLocaleLowerCase('es-AR').includes(normalized)));
  }, [products, query, lines]);
  const catalogTotalPages = Math.max(1, Math.ceil(matches.length / CATALOG_PAGE_SIZE));
  const currentCatalogPage = Math.min(catalogPage, catalogTotalPages);
  const visibleCatalogProducts = useMemo(
    () => matches.slice((currentCatalogPage - 1) * CATALOG_PAGE_SIZE, currentCatalogPage * CATALOG_PAGE_SIZE),
    [matches, currentCatalogPage],
  );
  const selectedType = types.find(item => item.id === Number(typeId));
  const isCutProduction = fromDesign || /recort/i.test(selectedType?.descripcion ?? '');
  const chosenDesign = designs.find(item => item.RecorteDisenoId === selectedDesignId);
  const totalPlanned = lines.reduce((sum, line) => sum + quantityValue(line.quantity), 0);
  const hasDraft = Boolean(typeId || observations.trim() || lines.length);

  useEffect(() => {
    if (step < 3) return;
    [...new Set(lines.map(line => line.recipeId))].forEach(id => {
      if (materials[id]) return;
      setMaterials(current => ({ ...current, [id]: 'loading' }));
      void productionRecipesApi.details(id).then(result => setMaterials(current => ({ ...current, [id]: result }))).catch(() => setMaterials(current => ({ ...current, [id]: 'error' })));
    });
  }, [step, lines, materials]);

  const materialTotals = useMemo(() => {
    const totals = new Map<number, MaterialTotal>();
    const supplyById = new Map(supplies.map(item => [item.insumoId, item]));
    const stockById = new Map<number, number>();
    supplyStock?.forEach(item => stockById.set(item.insumoId, (stockById.get(item.insumoId) ?? 0) + item.cantidadActual));
    lines.forEach(line => {
      const detail = materials[line.recipeId];
      if (!Array.isArray(detail)) return;
      detail.forEach(item => {
        const current = totals.get(item.insumoId);
        const supply = supplyById.get(item.insumoId);
        totals.set(item.insumoId, { ...item, required: (current?.required ?? 0) + item.cantidad * quantityValue(line.quantity), available: supplyStock ? stockById.get(item.insumoId) ?? 0 : null, unit: supply?.unidadMedidaAbreviatura || supply?.unidadMedidaNombre || '' });
      });
    });
    return [...totals.values()].sort((a, b) => a.insumoNombre.localeCompare(b.insumoNombre, 'es-AR'));
  }, [lines, materials, supplies, supplyStock]);
  const requiredSupplyIds = useMemo(() => new Set(materialTotals.map(item => item.insumoId)), [materialTotals]);
  const eligibleCuts = cutStock.filter(cut => requiredSupplyIds.has(cut.insumoId));
  const materialsPending = lines.some(line => materials[line.recipeId] === 'loading' || !materials[line.recipeId]);
  const materialsError = lines.some(line => materials[line.recipeId] === 'error');

  function addProduct(product: Product) { const available = recipesByProduct.get(product.productoId) ?? []; if (!available.length) return; setLines(current => [...current, { product, recipeId: available[0].listaMaterialesId, quantity: '1' }]); setErrors(current => ({ ...current, models: undefined })); }
  async function applyTemplate(value: string) {
    setTemplateId(value); if (!value) return;
    try {
      const template = await productionOrdersApi.template(Number(value));
      const templateLines: Line[] = [];
      for (const detail of template.detalles) {
        const product = products.find(item => item.productoId === detail.productoId && item.activo);
        const recipe = recipesByProduct.get(detail.productoId)?.[0];
        if (!product || !recipe) throw new Error(`${detail.productoNombre} no tiene una configuración activa disponible.`);
        templateLines.push({ product, recipeId: recipe.listaMaterialesId, quantity: String(detail.cantidad) });
      }
      setLines(templateLines); setErrors(current => ({ ...current, models: undefined }));
    } catch (caught) { setSubmitError(apiErrorMessage(caught, 'No se pudo aplicar la plantilla.')); setTemplateId(''); }
  }
  function validate(target: Step): Errors {
    const next: Errors = {};
    if (!typeId || !types.some(item => item.id === Number(typeId))) next.type = 'Seleccioná un tipo de producción.';
    if (observations.length > 500) next.observations = 'Las observaciones no pueden superar 500 caracteres.';
    if (target >= 2 && isCutProduction) {
      if (!selectedDesignId || !designDetail || !designValidation || !designValidation.puedeContinuar) next.models = 'Seleccioná un diseño aprobado, con producto asociado y sin bloqueantes.';
      if (!/^[1-9]\d*$/.test(designQuantity)) next.quantities = { 0: 'La cantidad debe ser un número entero positivo.' };
    }
    if (target >= 2 && !isCutProduction) {
      if (!lines.length) next.models = 'Agregá al menos un modelo a la orden.';
      const quantities: Record<number, string> = {}; const recipeErrors: Record<number, string> = {};
      lines.forEach(line => {
        if (!quantityPattern.test(line.quantity.trim()) || quantityValue(line.quantity) <= 0) quantities[line.product.productoId] = 'Ingresá una cantidad mayor a cero, con hasta dos decimales.';
        if (!(recipesByProduct.get(line.product.productoId) ?? []).some(item => item.listaMaterialesId === line.recipeId)) recipeErrors[line.product.productoId] = 'Seleccioná una configuración activa.';
      });
      if (Object.keys(quantities).length) next.quantities = quantities;
      if (Object.keys(recipeErrors).length) next.recipes = recipeErrors;
    }
    return next;
  }
  function nextStep() { const nextErrors = validate(step); setErrors(nextErrors); if (Object.keys(nextErrors).length) return; setStep(current => Math.min(4, current + 1) as Step); }
  function cancel() { if (hasDraft) { setCancelOpen(true); return; } location.href = '/production/orders'; }
  async function save() {
    if (isCutProduction || !canCreate || submitting.current || materialsPending || materialsError) return;
    const nextErrors = validate(4); setErrors(nextErrors); setSubmitError(''); if (Object.keys(nextErrors).length) return;
    submitting.current = true; setSaving(true);
    try {
      const result = await productionOrdersApi.create({ tipoProduccionId: Number(typeId), observaciones: observations.trim() || null, productos: lines.map(line => ({ productoId: line.product.productoId, listaMaterialesId: line.recipeId, cantidadPlanificada: quantityValue(line.quantity) })), recortes: selectedCuts.filter(id => requiredSupplyIds.has(cutStock.find(item => item.recorteId === id)?.insumoId ?? -1)).map(id => { const cut = cutStock.find(item => item.recorteId === id)!; return { recorteId: id, cantidad: cut.cantidadActual }; }) });
      sessionStorage.setItem('production-order-notice', `Orden OP-${String(result.ordenProduccionId).padStart(6, '0')} creada en estado Pendiente.`);
      location.href = `/production/orders/${result.ordenProduccionId}`;
    } catch (error) { setSubmitError(apiErrorMessage(error, 'No se pudo crear la orden de producción. Los datos ingresados se conservaron.')); }
    finally { submitting.current = false; setSaving(false); }
  }
  const materialPages = Math.max(1, Math.ceil(materialTotals.length / MATERIAL_PAGE_SIZE));
  const currentMaterialPage = Math.min(materialPage, materialPages);
  const materialsTable = <div className="production-material-summary" role="table" aria-label="Materiales requeridos"><div className="production-material-head" role="row"><span>Material</span><span>Necesario</span><span>Disponible</span><span>Estado</span></div>{materialTotals.slice((currentMaterialPage - 1) * MATERIAL_PAGE_SIZE, currentMaterialPage * MATERIAL_PAGE_SIZE).map(item => { const shortage = item.available !== null && item.available < item.required; return <div key={item.insumoId} role="row"><span><strong>{item.insumoNombre}</strong><small>{item.insumoCodigo}</small></span><b>{quantity.format(item.required)} {item.unit}</b><span>{item.available === null ? 'No consultado' : `${quantity.format(item.available)} ${item.unit}`}</span><span><StatusBadgeText label={item.available === null ? 'Sin validar' : shortage ? 'Insuficiente' : 'Disponible'} tone={item.available === null ? 'neutral' : shortage ? 'danger' : 'success'}/></span></div>; })}{!materialTotals.length && !materialsPending && <div className="production-inline-empty">Las configuraciones seleccionadas no informan materiales.</div>}{materialPages > 1 && <div className="production-material-pagination"><span>Mostrando {(currentMaterialPage - 1) * MATERIAL_PAGE_SIZE + 1}–{Math.min(currentMaterialPage * MATERIAL_PAGE_SIZE, materialTotals.length)} de {materialTotals.length}</span><div><button type="button" className="button secondary" disabled={currentMaterialPage === 1} onClick={() => setMaterialPage(page => Math.max(1, page - 1))}>Anterior</button><span>Página {currentMaterialPage} de {materialPages}</span><button type="button" className="button secondary" disabled={currentMaterialPage === materialPages} onClick={() => setMaterialPage(page => Math.min(materialPages, page + 1))}>Siguiente</button></div></div>}</div>;

  return <AppShell title="Registrar orden de producción" breadcrumb="Producción / Órdenes de producción / Registrar orden"><main className="production-orders-page production-create-page">
    <button type="button" className="production-back-link button-link" onClick={cancel}><ArrowLeft size={16}/> Volver a órdenes</button>
    <PageHeader title="Registrar orden de producción"/>
    <nav className="production-stepper" aria-label="Etapas de la nueva orden">{(['Datos generales', isCutProduction ? 'Diseños' : 'Productos', 'Materiales', 'Resumen'] as const).map((label, index) => { const number = index + 1; return <button key={label} type="button" className={step === number ? 'active' : step > number ? 'complete' : ''} onClick={() => number < step && setStep(number as Step)} aria-current={step === number ? 'step' : undefined}><span>{step > number ? <Check size={15}/> : number}</span><strong>{label}</strong></button>; })}</nav>
    {(catalogLoading ? <div className="production-detail-state">Consultando productos y configuraciones…</div> : catalogError ? <div className="production-message error" role="alert"><AlertCircle size={18}/><span>{catalogError}</span></div> : <section className="production-wizard-card">
      {step === 1 && <div className="production-form-section"><header><ClipboardList size={20}/><div><h2>Datos generales</h2></div></header><div className="production-form-grid"><label className={errors.type ? 'field-invalid' : ''}><span>Tipo de producción *</span><select value={typeId} onChange={event => { setTypeId(event.target.value); setErrors(current => ({ ...current, type: undefined })); }}><option value="">Seleccionar tipo</option>{types.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.type && <small>{errors.type}</small>}</label>{!isCutProduction && <label><span>Plantilla opcional</span><select value={templateId} onChange={event => void applyTemplate(event.target.value)}><option value="">Sin plantilla</option>{templates.map(item => <option key={item.plantillaOrdenProduccionId} value={item.plantillaOrdenProduccionId}>{item.nombre} · {item.cantidadModelos} modelos</option>)}</select></label>}<label className="production-observation-field"><span>Observaciones</span><textarea maxLength={500} value={observations} onChange={event => setObservations(event.target.value)} placeholder="Indicaciones generales para esta orden"/><small className={errors.observations ? 'field-error' : ''}>{errors.observations || `${observations.length}/500 caracteres`}</small></label></div>{submitError && <div className="production-message error"><AlertCircle size={18}/><span>{submitError}</span></div>}</div>}
      {step === 2 && !isCutProduction && <div className="production-model-step"><section><header><div><h2>Productos disponibles para fabricar</h2></div></header><label className="production-catalog-search"><Search size={17}/><input value={query} onChange={event => { setQuery(event.target.value); setCatalogPage(1); }} placeholder="Buscar producto por nombre o código"/></label><div className="production-product-list">{visibleCatalogProducts.map(product => { const available = recipesByProduct.get(product.productoId) ?? []; const cover = coverByProduct.get(product.productoId); return <div key={product.productoId}>{cover ? <img className="production-model-thumb" src={cover} alt=""/> : <span className="production-model-placeholder"><ImageIcon size={20}/></span>}<span><strong>{formatProductName(product)}</strong><small>{product.codigo} · {product.tipoProductoNombre}</small></span><button type="button" className="button secondary" disabled={!available.length} onClick={() => addProduct(product)}>{available.length ? <><Plus size={15}/> Agregar</> : 'Sin configuración'}</button></div>; })}{!matches.length && <div className="production-inline-empty">No hay productos para esta búsqueda.</div>}</div><div className="production-catalog-pagination" aria-label="Paginación de productos"><span>{matches.length ? `Mostrando ${(currentCatalogPage - 1) * CATALOG_PAGE_SIZE + 1}–${Math.min(currentCatalogPage * CATALOG_PAGE_SIZE, matches.length)} de ${matches.length} productos` : '0 productos'}</span><div><span>Página {currentCatalogPage} de {catalogTotalPages}</span><button type="button" aria-label="Página anterior de productos" disabled={currentCatalogPage === 1} onClick={() => setCatalogPage(page => Math.max(1, page - 1))}><ChevronLeft size={16}/></button><button type="button" aria-label="Página siguiente de productos" disabled={currentCatalogPage >= catalogTotalPages} onClick={() => setCatalogPage(page => Math.min(catalogTotalPages, page + 1))}><ChevronRight size={16}/></button></div></div></section><section><header><div><h2>Productos seleccionados <span className="production-count">{lines.length}</span></h2></div></header><div className="production-selected-models">{lines.length ? lines.map(line => <div key={line.product.productoId}><div><strong>{formatProductName(line.product)}</strong><small>{line.product.codigo}</small></div><label className={errors.recipes?.[line.product.productoId] ? 'field-invalid' : ''}><span>Configuración</span><select value={line.recipeId} onChange={event => setLines(current => current.map(item => item.product.productoId === line.product.productoId ? { ...item, recipeId: Number(event.target.value) } : item))}>{(recipesByProduct.get(line.product.productoId) ?? []).map(recipe => <option key={recipe.listaMaterialesId} value={recipe.listaMaterialesId}>{recipe.nombre}{recipe.version ? ` · v${recipe.version}` : ''}</option>)}</select>{errors.recipes?.[line.product.productoId] && <small>{errors.recipes[line.product.productoId]}</small>}</label><label className={errors.quantities?.[line.product.productoId] ? 'field-invalid' : ''}><span>Cantidad *</span><input inputMode="decimal" value={line.quantity} onChange={event => setLines(current => current.map(item => item.product.productoId === line.product.productoId ? { ...item, quantity: event.target.value } : item))}/>{errors.quantities?.[line.product.productoId] && <small>{errors.quantities[line.product.productoId]}</small>}</label><button type="button" className="production-remove" aria-label={`Quitar ${formatProductName(line.product)}`} onClick={() => setLines(current => current.filter(item => item.product.productoId !== line.product.productoId))}><Trash2 size={16}/></button></div>) : <div className="production-inline-empty">Agregá uno o más productos desde el catálogo.</div>}</div>{errors.models && <p className="field-error">{errors.models}</p>}</section></div>}
      {step === 3 && !isCutProduction && <div className="production-form-section production-material-step"><header><Info size={20}/><div><h2>Materiales requeridos</h2></div></header>{materialsPending ? <div className="production-inline-empty">Calculando materiales…</div> : materialsError ? <div className="production-inline-empty error-text">No se pudo consultar una configuración. Volvé a Modelos y elegí una configuración válida.</div> : materialsTable}</div>}
      {step === 4 && !isCutProduction && <div className="production-form-section production-summary-step"><header><Check size={20}/><div><h2>Resumen de la orden</h2></div></header><div className="production-summary-facts"><div><span>Tipo de producción</span><strong>{selectedType?.descripcion ?? '—'}</strong></div><div><span>Modelos</span><strong>{lines.length}</strong></div><div><span>Total planificado</span><strong>{quantity.format(totalPlanned)} unidades</strong></div></div><div className="production-summary-lines">{lines.map(line => { const recipe = recipes.find(item => item.listaMaterialesId === line.recipeId); return <div key={line.product.productoId}><span><strong>{formatProductName(line.product)}</strong><small>{line.product.codigo} · {recipe?.nombre ?? `Configuración ${line.recipeId}`}{recipe?.version ? ` · v${recipe.version}` : ''}</small></span><b>{quantity.format(quantityValue(line.quantity))}</b></div>; })}</div><div className="production-summary-facts"><div><span>Consumo al crear</span><strong>No</strong></div><div><span>Estado inicial</span><strong>Pendiente</strong></div></div><div className="production-summary-observations"><span>Observaciones</span><p>{observations.trim() || 'Sin observaciones.'}</p></div><aside className="production-info-note">La orden quedará Pendiente. Se congelan materiales y recortes previstos; no se generan movimientos de stock.</aside>{submitError && <div className="production-message error" role="alert"><AlertCircle size={18}/><span>{submitError}</span></div>}</div>}
      {isCutProduction && step === 1 && <aside className="production-pending-note"><Info size={18}/><div><strong>Fabricación desde recortes</strong><span>En el siguiente paso vas a seleccionar un diseño aprobado. La creación de la orden no modifica existencias.</span></div></aside>}
      {isCutProduction && step === 2 && <div className="production-form-section production-design-step"><header><ClipboardList size={20}/><div><h2>Diseños aprobados</h2><p>Seleccioná un diseño validado por el responsable. El producto resultante debe estar asociado previamente.</p></div></header>
        {designsLoading ? <p>Consultando diseños…</p> : designsError && <p className="field-error">{designsError}</p>}
        {!designsLoading && !designs.length && <div className="production-inline-empty">No hay diseños aprobados disponibles. Primero aprobá uno desde Gestión de Recortes.</div>}
        <div className="production-design-grid">{designs.map(item => <button type="button" key={item.RecorteDisenoId} className={`production-design-option ${selectedDesignId === item.RecorteDisenoId ? 'selected' : ''}`} onClick={() => setSelectedDesignId(item.RecorteDisenoId)}><strong>{item.Nombre}</strong><small>Diseño #{item.RecorteDisenoId} · Versión {item.VersionNumero} · {item.EstadoRevision}</small></button>)}</div>
        {selectedDesignId && <div className="production-design-info">{designDetailLoading ? 'Consultando detalle y validaciones…' : designError ? <p className="field-error">{designError}</p> : designValidation && <><strong>{designDetail?.Nombre ?? chosenDesign?.Nombre ?? `Diseño #${selectedDesignId}`}</strong><p>Producto vinculado: {designValidation.productoId ?? 'Pendiente'} · Asignaciones: {designValidation.cantidadAsignaciones} · Insumos complementarios: {designValidation.cantidadInsumosComplementarios}</p>{designValidation.bloqueantes.length > 0 && <div className="production-message error">{designValidation.bloqueantes.join(' · ')}</div>}</>}</div>}
        <label className="production-design-quantity"><span>Cantidad a fabricar *</span><input inputMode="numeric" value={designQuantity} onChange={event => setDesignQuantity(event.target.value)}/></label>
        {errors.models && <p className="field-error">{errors.models}</p>}{errors.quantities?.[0] && <p className="field-error">{errors.quantities[0]}</p>}
      </div>}
      {isCutProduction && step === 3 && <div className="production-form-section production-design-step"><header><Info size={20}/><div><h2>Materiales del diseño</h2></div></header>
        {designDetail ? <DesignRows title="Insumos complementarios" rows={designDetail.InsumosComplementarios}/> : <div className="production-inline-empty">No se pudo recuperar el detalle del diseño.</div>}
        
      </div>}
      {isCutProduction && step === 4 && <div className="production-form-section production-summary-step"><header><Check size={20}/><div><h2>Resumen de fabricación desde recortes</h2></div></header>
        <div className="production-summary-facts"><div><span>Diseño aprobado</span><strong>{designDetail?.Nombre ?? '—'}</strong></div><div><span>Versión</span><strong>{designDetail?.VersionNumero ?? '—'}</strong></div><div><span>Producto vinculado</span><strong>{designValidation?.productoId ?? 'Sin vincular'}</strong></div><div><span>Cantidad planificada</span><strong>{designQuantity}</strong></div></div>
        <div className="production-summary-observations"><span>Observaciones</span><p>{observations.trim() || 'Sin observaciones.'}</p></div>
        <aside className="production-pending-note warning"><Info size={18}/><div><strong>Confirmación pendiente de API</strong><span>La planificación puede revisarse, pero no se habilita Crear orden hasta contar con el POST transaccional. No se realizaron movimientos de stock.</span></div></aside>
      </div>}
      <footer className="production-wizard-actions"><button type="button" className="button secondary" onClick={step === 1 ? cancel : () => setStep(current => Math.max(1, current - 1) as Step)}><ChevronLeft size={16}/>{step === 1 ? 'Cancelar' : 'Anterior'}</button>{step < 4 ? <button type="button" className="button primary" onClick={nextStep}>Siguiente <ChevronRight size={16}/></button> : isCutProduction ? <button type="button" className="button primary" disabled title="Pendiente de implementar la creación transaccional en API">Crear orden (pendiente de API)</button> : <button type="button" className="button primary" disabled={!canCreate || saving || materialsPending || materialsError} onClick={() => void save()}>{saving ? 'Creando orden…' : 'Crear orden'}</button>}</footer>
    </section>)}
    {cancelOpen && <Modal title="Descartar nueva orden" subtitle="Los datos cargados todavía no fueron guardados." onClose={() => setCancelOpen(false)}><div className="production-cancel-dialog"><p>¿Querés salir y descartar esta planificación?</p><footer><button type="button" className="button secondary" onClick={() => setCancelOpen(false)}>Seguir editando</button><button type="button" className="button danger" onClick={() => { location.href = '/production/orders'; }}>Descartar orden</button></footer></div></Modal>}
  </main></AppShell>;
}

function StatusBadgeText({ label, tone }: { label: string; tone: 'neutral' | 'danger' | 'success' }) { return <span className={`production-material-state ${tone}`}>{label}</span>; }


function isCutTypeSelected(typeId: string, types: ProductionLookup[]) {
  return /recort/i.test(types.find(item => item.id === Number(typeId))?.descripcion ?? '');
}

function DesignRows({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  return <section className="production-design-rows"><h3>{title} <span className="production-count">{rows.length}</span></h3>{rows.length ? <div className="production-design-table">{rows.map((row, index) => <div key={index}>{Object.entries(row).filter(([key, value]) => value !== null && typeof value !== 'object' && !/^(id|recortedisenoid)$/i.test(key)).slice(0, 7).map(([key, value]) => <span key={key}><small>{key.replace(/([a-z])([A-Z])/g, '$1 $2')}</small><strong>{String(value)}</strong></span>)}</div>)}</div> : <p className="production-inline-empty">No hay registros para este apartado.</p>}</section>;
}
