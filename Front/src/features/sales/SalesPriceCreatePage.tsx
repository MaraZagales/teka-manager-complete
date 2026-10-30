import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Calculator, RefreshCw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { apiErrorMessage } from '../../services/apiClient';
import { formatProductName } from '../../services/productDisplay';
import { costPriceParametersApi, type CostPriceParameter, type EstimatedProductCost, type PriceCalculation } from '../../services/costPriceParametersApi';
import { productsApi, type Product } from '../../services/productsApi';
import { salesPricesApi, type SalesPrice } from '../../services/salesPricesApi';
import { parsePrice } from './priceValidation';
import './salesPrices.css';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
type Origin = 'automatic' | 'manual';
const statusText: Record<EstimatedProductCost['estado'], string> = {
  SIN_BOM: 'El producto no tiene una lista de materiales activa.',
  LISTAS_MULTIPLES: 'Hay más de una lista de materiales activa para este producto.',
  INCOMPLETO: 'Faltan costos de compra válidos para algunos materiales.',
  SIN_PARAMETROS: 'No hay parámetros de costos y precios configurados para este producto. Configuralos desde Administración → Configuración → Ventas → Parámetros de costos y precios.',
  COMPLETO: 'El costo estimado está completo.',
};
const missingParametersMessage = statusText.SIN_PARAMETROS;

export function SalesPriceCreatePage() {
  const initialId = new URLSearchParams(location.search).get('productoId') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<SalesPrice[]>([]);
  const [parameters, setParameters] = useState<CostPriceParameter[]>([]);
  const [productId, setProductId] = useState(initialId);
  const [origin, setOrigin] = useState<Origin>('automatic');
  const [manualCost, setManualCost] = useState('');
  const [estimate, setEstimate] = useState<EstimatedProductCost | null>(null);
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null);
  const [calculationContext, setCalculationContext] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [finalEdited, setFinalEdited] = useState(false);
  const [manualTouched, setManualTouched] = useState(false);
  const [simulationError, setSimulationError] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const calculationRequest = useRef(0);
  const manualTimer = useRef<number | null>(null);
  const product = products.find(row => String(row.productoId) === productId) ?? null;
  const current = prices.find(row => row.productoId === product?.productoId && row.activo) ?? null;
  const context = `${productId}|${origin}|${origin === 'manual' ? manualCost : ''}`;
  const currentCalculation = calculationContext === context ? calculation : null;
  const appliedParameters = parameters.find(row => row.parametroCostoPrecioId === currentCalculation?.parametroCostoPrecioId);
  const hasApplicableParameters = Boolean(product && parameters.some(row => row.activo && (row.tipoProductoId === product.tipoProductoId || row.tipoProductoId === null)));
  const manualAmount = parsePrice(manualCost);
  const validFinal = parsePrice(finalPrice);
  const effectiveMargin = useMemo(() => currentCalculation && validFinal ? (validFinal - currentCalculation.costoTotal) * 100 / validFinal : null, [currentCalculation, validFinal]);
  const calculationStateText = loading ? 'Cargando productos y parámetros…'
    : !product ? 'Seleccioná un producto para determinar el precio.'
    : calculating ? 'Calculando el precio con los parámetros vigentes…'
    : simulationError || (origin === 'manual' && !hasApplicableParameters ? missingParametersMessage : '')
      || (origin === 'manual' ? (!manualCost.trim() ? 'Ingresá el costo de materiales para calcular el precio.'
        : manualAmount === null ? 'Ingresá un costo de materiales mayor que cero, con hasta dos decimales.'
          : 'Esperando el resultado de la simulación.')
        : estimate ? statusText[estimate.estado] : 'Esperando el cálculo del producto.');

  useEffect(() => { let active = true; Promise.all([productsApi.list(), salesPricesApi.list(), costPriceParametersApi.list()])
    .then(([catalog, currentPrices, configs]) => { if (active) { setProducts(catalog.filter(row => row.activo)); setPrices(currentPrices); setParameters(configs); } })
    .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudo cargar el catálogo.')); })
    .finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  useEffect(() => {
    const request = ++calculationRequest.current;
    setEstimate(null); setCalculation(null); setCalculationContext(null); setFinalPrice(''); setFinalEdited(false); setFieldError(''); setError(''); setSimulationError(''); setCalculating(false);
    const id = Number(productId);
    if (!id || origin !== 'automatic' || !product) return;
    let active = true; setCalculating(true);
    void costPriceParametersApi.estimate(id).then(result => {
      if (!active || request !== calculationRequest.current) return;
      setEstimate(result);
      if (result.estado === 'COMPLETO' && result.precio) { setCalculation(result.precio); setCalculationContext(`${productId}|automatic|`); setFinalPrice(String(result.precio.precioSugerido)); }
    }).catch(cause => { if (active && request === calculationRequest.current) setSimulationError(apiErrorMessage(cause, 'No se pudo calcular el costo estimado.')); })
      .finally(() => { if (active && request === calculationRequest.current) setCalculating(false); });
    return () => { active = false; };
  }, [productId, origin, product?.productoId]);

  useEffect(() => {
    if (origin !== 'manual') return;
    const request = ++calculationRequest.current;
    const requestContext = `${productId}|manual|${manualCost}`;
    const cost = parsePrice(manualCost);
    setEstimate(null); setCalculation(null); setCalculationContext(null); setCalculating(false); setSimulationError('');
    setFinalPrice(''); setFinalEdited(false); setFieldError('');
    if (loading || !product || cost === null || !hasApplicableParameters) return;
    let active = true;
    setCalculating(true);
    manualTimer.current = window.setTimeout(() => {
      manualTimer.current = null;
      void costPriceParametersApi.simulate(product.productoId, cost).then(result => {
        if (!active || request !== calculationRequest.current) return;
        if (result.productoId !== product.productoId || result.costoMateriales !== cost) {
          setSimulationError('La simulación no coincide con el producto o costo informado. Recalculá para continuar.');
          return;
        }
        setCalculation(result);
        setCalculationContext(requestContext);
        setFinalPrice(String(result.precioSugerido));
      }).catch(cause => {
        if (active && request === calculationRequest.current) setSimulationError(apiErrorMessage(cause, 'No se pudo simular el precio.'));
      }).finally(() => {
        if (active && request === calculationRequest.current) setCalculating(false);
      });
    }, 400);
    return () => {
      active = false;
      if (manualTimer.current !== null) { window.clearTimeout(manualTimer.current); manualTimer.current = null; }
    };
  }, [productId, product?.productoId, origin, manualCost, loading, hasApplicableParameters]);

  async function recalculate() {
    if (!product) { setFieldError('Seleccioná un producto.'); return; }
    if (origin === 'manual' && !hasApplicableParameters) { setSimulationError(missingParametersMessage); return; }
    const cost = origin === 'manual' ? parsePrice(manualCost) : null;
    if (origin === 'manual' && cost === null) {
      setManualTouched(true);
      setFieldError('Ingresá un costo de materiales mayor que cero, con hasta dos decimales.');
      return;
    }
    if (manualTimer.current !== null) { window.clearTimeout(manualTimer.current); manualTimer.current = null; }
    const request = ++calculationRequest.current;
    const requestContext = context;
    const keepFinal = finalEdited ? finalPrice : null;
    setFieldError(''); setError(''); setSimulationError(''); setCalculating(true);
    setCalculation(null); setCalculationContext(null);
    if (keepFinal === null) setFinalPrice('');
    if (origin === 'automatic') setEstimate(null);
    try {
      if (origin === 'manual') {
        if (cost === null) return;
        const result = await costPriceParametersApi.simulate(product.productoId, cost);
        if (request !== calculationRequest.current) return;
        if (result.productoId !== product.productoId || result.costoMateriales !== cost) throw new Error('La simulación no coincide con el producto o costo informado.');
        setCalculation(result); setCalculationContext(requestContext);
        if (keepFinal === null) setFinalPrice(String(result.precioSugerido));
      } else {
        const result = await costPriceParametersApi.estimate(product.productoId);
        if (request !== calculationRequest.current) return;
        setEstimate(result);
        if (result.estado === 'COMPLETO' && result.precio) {
          setCalculation(result.precio); setCalculationContext(requestContext);
          if (keepFinal === null) setFinalPrice(String(result.precio.precioSugerido));
        }
      }
    } catch (cause) {
      if (request === calculationRequest.current) setSimulationError(apiErrorMessage(cause, 'No se pudo recalcular el precio.'));
    } finally {
      if (request === calculationRequest.current) setCalculating(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (saving || calculating) return;
    const price = parsePrice(finalPrice);
    if (!product || !currentCalculation || currentCalculation.productoId !== product.productoId || price === null || (origin === 'automatic' && estimate?.estado !== 'COMPLETO') || (origin === 'manual' && (manualAmount === null || manualAmount !== currentCalculation.costoMateriales))) {
      setFieldError('Recalculá el costo e ingresá un precio final válido antes de registrar.'); return;
    }
    setFieldError(''); setError(''); setSaving(true);
    try {
      await salesPricesApi.createWithCalculation({ productoId: product.productoId, precioFinal: price, origenCostoMateriales: origin === 'automatic' ? 'BOM_ULTIMA_COMPRA_VALIDA' : 'COSTO_INFORMADO', costoMateriales: origin === 'automatic' ? null : currentCalculation.costoMateriales });
      sessionStorage.setItem('sales-prices-notice', 'El precio se registró con su cálculo de costos.');
      location.href = '/ventas/precios';
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo registrar el precio.')); setSaving(false); }
  }

  return <AppShell title="Registrar precio" breadcrumb="Ventas / Precios de venta / Registrar precio">
    <form className="sales-price-editor" onSubmit={event => void submit(event)}>
      <PageHeader title="Registrar precio" description="Determiná el precio a partir de los costos calculados por el sistema."/>
      {error && <div className="sales-prices-error" role="alert">{error}</div>}
      <section className="sales-price-section sales-price-product-section">
        <h2>1. Producto y origen del costo</h2>
        <div className="sales-price-product-layout">
          <div className="sales-price-product-fields">
            <label className="sales-price-field"><span>Producto *</span><select value={productId} disabled={loading || saving} onChange={event => setProductId(event.target.value)}><option value="">Seleccionar producto</option>{products.map(row => <option key={row.productoId} value={row.productoId}>{row.codigo} · {formatProductName(row)}</option>)}</select></label>
            {product && <div className="sales-price-info"><div><small>Código comercial</small><strong>{product.codigo}</strong></div><div><small>Nombre</small><strong>{formatProductName(product)}</strong></div><div><small>Tipo de producto</small><strong>{product.tipoProductoNombre}</strong></div><div><small>Precio vigente</small><strong>{current ? money.format(current.precio) : 'Sin precio vigente'}</strong></div></div>}
          </div>
          <div className="sales-price-origin-fields"><strong className="sales-price-group-label">Origen del costo de materiales</strong><div className="sales-price-origin"><label><input type="radio" name="origin" checked={origin === 'automatic'} onChange={() => setOrigin('automatic')}/> Automático · lista de materiales y compras válidas</label><label><input type="radio" name="origin" checked={origin === 'manual'} onChange={() => setOrigin('manual')}/> Manual · costo informado</label></div>
            {origin === 'manual' && <label className="sales-price-field"><span>Costo de materiales *</span><input inputMode="decimal" value={manualCost} onChange={event => { ++calculationRequest.current; setCalculating(false); setManualCost(event.target.value); setCalculation(null); setCalculationContext(null); setFinalPrice(''); setFinalEdited(false); setFieldError(''); setSimulationError(''); setManualTouched(true); }} onBlur={() => setManualTouched(true)} placeholder="0,00" disabled={saving}/>{manualTouched && manualCost.trim() && manualAmount === null && <small className="field-error">Ingresá un costo mayor que cero, con hasta dos decimales.</small>}</label>}
          </div>
        </div>
        {calculating && <div className="state-box">Calculando costos…</div>}
        {origin === 'automatic' && estimate && <div className={`sales-price-estimate ${estimate.estado === 'COMPLETO' ? '' : 'incomplete'}`}><strong>{statusText[estimate.estado]}</strong>{estimate.advertencias.map((warning, index) => <span key={index}><AlertTriangle size={15}/> {warning}</span>)}</div>}
      </section>
      <div className="sales-price-editor-grid">
        <section className="sales-price-section"><h2>2. Composición del costo</h2>{currentCalculation ? <div className="sales-price-breakdown"><div><span>Materiales</span><strong>{money.format(currentCalculation.costoMateriales)}</strong></div><div><span>Mano de obra {appliedParameters && `(${appliedParameters.porcentajeManoObra} %)`}</span><strong>{money.format(currentCalculation.costoManoObra)}</strong></div><div><span>Costos fijos {appliedParameters && `(${appliedParameters.porcentajeCostosFijos} %)`}</span><strong>{money.format(currentCalculation.costosFijos)}</strong></div><div><span>Otros costos variables {appliedParameters && `(${appliedParameters.porcentajeOtrosVariables} %)`}</span><strong>{money.format(currentCalculation.otrosVariables)}</strong></div><div className="total"><span>Costo total estimado</span><strong>{money.format(currentCalculation.costoTotal)}</strong></div></div> : <p className="sales-price-muted">{calculationStateText}</p>}</section>
        <section className="sales-price-section"><h2>3. Determinación del precio</h2>{currentCalculation ? <div className="sales-price-decision"><div><small>Margen objetivo</small><strong>{currentCalculation.porcentajeMargen} %</strong></div><div><small>Precio sugerido</small><strong>{money.format(currentCalculation.precioSugerido)}</strong></div></div> : <p className="sales-price-muted" role={simulationError ? 'alert' : undefined}>{calculationStateText}</p>}
          <label className="sales-price-field"><span>Precio final aprobado *</span><input inputMode="decimal" value={finalPrice} onChange={event => { setFinalPrice(event.target.value); setFinalEdited(true); setFieldError(''); }} disabled={!currentCalculation || calculating || saving} placeholder="0,00"/>{fieldError && <small className="field-error">{fieldError}</small>}</label>
          {effectiveMargin !== null && <div className="sales-price-effective"><Calculator size={17}/> Margen bruto efectivo: <strong>{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(effectiveMargin)} %</strong></div>}
        </section>
      </div>
      <div className="sales-price-editor-actions"><a className="button secondary" href="/ventas/precios">Cancelar</a>{product && <button type="button" className="button secondary" onClick={() => void recalculate()} disabled={calculating || saving}><RefreshCw size={15}/> Recalcular</button>}<button type="submit" className="button primary" disabled={!currentCalculation || saving || calculating || !validFinal || (origin === 'automatic' && estimate?.estado !== 'COMPLETO')}>{saving ? 'Registrando…' : 'Registrar precio'}</button></div>
    </form>
  </AppShell>;
}
