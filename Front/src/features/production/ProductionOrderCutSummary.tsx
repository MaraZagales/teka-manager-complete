import { useEffect, useState } from 'react';
import { AlertCircle, Scissors } from 'lucide-react';
import { apiErrorMessage } from '../../services/apiClient';
import { productionFabricationApi, type FabricationPreview, type FabricationTemplate } from '../../services/productionFabricationApi';
import './productionRecipes.css';

export function ProductionOrderCutSummary({ lines }: { lines: Array<{ productoId: number; listaMaterialesId: number; cantidad: number }> }) {
  const [templates, setTemplates] = useState<FabricationTemplate[]>([]);
  const [preview, setPreview] = useState<FabricationPreview | null>(null);
  const [margin, setMargin] = useState(5);
  const [kerf, setKerf] = useState(3);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    productionFabricationApi.templates().then(data => { if (active) setTemplates(data); })
      .catch(caught => { if (active) setError(apiErrorMessage(caught, 'No se pudieron consultar plantillas de corte.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => { setPreview(null); }, [lines, margin, kerf]);
  const selected = lines.map(line => {
    const template = templates.find(item => item.productoId === line.productoId &&
      item.listaMaterialesId === line.listaMaterialesId && item.estado === 'Aprobada');
    return { template, quantity: line.cantidad };
  });
  const missing = selected.some(item => !item.template || item.quantity <= 0 || !Number.isInteger(item.quantity));
  async function calculate() {
    if (missing || working || margin < 0 || kerf < 0) return;
    setError(''); setWorking(true);
    try {
      const result = await productionFabricationApi.preview({
        lineas: selected.map(item => ({ plantillaFabricacionId: item.template!.plantillaFabricacionId, cantidad: item.quantity })),
        vetaPlacaPorInsumo: [], margenMm: margin, anchoSierraMm: kerf,
      });
      setPreview(result);
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo calcular el corte del lote.')); }
    finally { setWorking(false); }
  }
  return <section className="production-order-cut-summary">
    <header><Scissors size={17}/><div><h3>Corte preliminar del lote</h3><p>Combina los modelos seleccionados. Los recortes se revalidan al iniciar; esta consulta no reserva stock.</p></div></header>
    {loading ? <div className="production-inline-empty">Consultando plantillas…</div> : missing ? <div className="production-inline-empty">La BOM elegida no tiene una plantilla de fabricación aprobada y vinculada, o la cantidad no es entera. El plano queda pendiente.</div> : <>
      <div className="production-fabrication-controls"><label><span>Margen (mm)</span><input type="number" min="0" step="0.01" value={margin} onChange={event => setMargin(Number(event.target.value))}/></label><label><span>Sierra (mm)</span><input type="number" min="0" step="0.01" value={kerf} onChange={event => setKerf(Number(event.target.value))}/></label><button type="button" className="button secondary" disabled={working} onClick={() => void calculate()}>{working ? 'Calculando…' : 'Calcular corte'}</button></div>
      <div className="production-summary-lines">{selected.map(item => <div key={item.template!.productoId}><span><strong>{item.template!.productoNombre}</strong><small>{item.template!.version} · {item.template!.estado}</small></span><b>{item.quantity} unidades</b></div>)}</div>
      {error && <div className="production-message error" role="alert"><AlertCircle size={16}/>{error}</div>}
      {preview && <><div className="production-fabrication-facts"><span><strong>{preview.piezas.reduce((sum, part) => sum + part.cantidadPorUnidad * (lines.find(line => line.productoId === part.productoId)?.cantidad ?? 0), 0)}</strong> piezas</span><span><strong>{preview.corte?.newSheetCount ?? '—'}</strong> placas nuevas</span><span><strong>{preview.corte?.plannedCutIds.length ?? '—'}</strong> recortes aprovechables</span><span><strong>{preview.corte?.surfaces.reduce((sum, item) => sum + item.remainders.length, 0) ?? '—'}</strong> sobrantes teóricos</span></div><div className="production-fabrication-pieces">{preview.materiales.map(item => <div key={item.insumoId + '-' + item.colorId}><strong>Insumo #{item.insumoId} · color #{item.colorId}</strong><span>{item.placasNuevas} placas · {item.metrosCuadrados.toLocaleString('es-AR')} m²</span><small>Faltante: {item.faltanteM2 == null ? 'no verificable' : item.faltanteM2.toLocaleString('es-AR') + ' m²'}</small></div>)}</div>{preview.pendientes.length > 0 && <aside className="production-fabrication-pending"><strong>No es receta habilitada</strong><ul>{preview.pendientes.map((item, index) => <li key={index}>{item}</li>)}</ul></aside>}</>}
    </>}
  </section>;
}
