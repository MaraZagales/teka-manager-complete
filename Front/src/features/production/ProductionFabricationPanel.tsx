import { useEffect, useMemo, useState } from 'react';
import './productionRecipes.css';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { productionFabricationApi, type FabricationPiece, type FabricationPreview, type FabricationTemplate } from '../../services/productionFabricationApi';

const fmt = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 2 });

export function ProductionFabricationPanel({ productId, wizardView }: { productId: number; wizardView?: 'pieces' | 'cut' }) {
  const [templates, setTemplates] = useState<FabricationTemplate[]>([]);
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [margin, setMargin] = useState(5);
  const [kerf, setKerf] = useState(3);
  const [preview, setPreview] = useState<FabricationPreview | null>(null);
  const [draftPieces, setDraftPieces] = useState<FabricationPiece[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [approvalCheck, setApprovalCheck] = useState<{puedeAprobar:boolean; bloqueantes:string[]; advertencias:string[]} | null>(null);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [bomCheck, setBomCheck] = useState<{
    listaMaterialesId: number; bomActivaAnteriorId: number | null;
    puedeActivar: boolean; bloqueantes: string[];
  } | null>(null);
  const [activatingBom, setActivatingBom] = useState(false);
  const [approving, setApproving] = useState(false);
  useEffect(() => {
    let live = true;
    setLoading(true);
    productionFabricationApi.templates().then(items => {
      if (!live) return;
      const matching = items.filter(item => item.productoId === productId);
      setTemplates(matching);
      setSelected(matching.find(item => item.estado === 'Aprobada')?.plantillaFabricacionId ?? matching.find(item => item.estado === 'Borrador' && item.version !== 'EST-01')?.plantillaFabricacionId ?? matching.find(item => item.version === 'EST-01')?.plantillaFabricacionId ?? matching[0]?.plantillaFabricacionId ?? 0);
    }).catch(caught => { if (live) setError(apiErrorMessage(caught, 'No se pudieron consultar las plantillas de fabricación.')); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [productId]);
  useEffect(() => { setPreview(null); setDraftPieces([]); setApprovalCheck(null); setBomCheck(null); }, [selected, quantity, margin, kerf]);
  const current = templates.find(item => item.plantillaFabricacionId === selected);
  const showStoredPlan = quantity === 1 && margin === 5 && kerf === 3 &&
    preview?.planPersistido?.isComplete === true;
  const visiblePlan = showStoredPlan ? preview?.planPersistido : preview?.corte;
  const nameByPiece = useMemo(() => new Map(preview?.piezas.map(item => [item.piezaId, item.nombre]) ?? []), [preview]);
  async function calculate() {
    if (!selected || !Number.isInteger(quantity) || quantity <= 0 || margin < 0 || kerf < 0 || calculating) return;
    setError('');
    setCalculating(true);
    try {
      const result = await productionFabricationApi.preview({
        lineas: [{ plantillaFabricacionId: selected, cantidad: quantity }],
        vetaPlacaPorInsumo: [], margenMm: margin, anchoSierraMm: kerf,
      });
      setPreview(result); setDraftPieces(result.piezas.map(piece => ({ ...piece })));
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo calcular el plano de corte.')); }
    finally { setCalculating(false); }
  }
  async function checkApproval() {
    if (!selected || checkingApproval) return;
    setCheckingApproval(true); setError('');
    try { setApprovalCheck(await productionFabricationApi.approvalCheck(selected)); }
    catch (caught) { setError(apiErrorMessage(caught, 'No se pudo validar la plantilla.')); }
    finally { setCheckingApproval(false); }
  }
  async function approveTemplate() {
    if (!selected || approving || !approvalCheck?.puedeAprobar || !canEdit) return;
    if (!window.confirm('¿Confirmás la aprobación técnica de esta plantilla? La lista de materiales NO se activará.')) return;
    setApproving(true); setError(''); setNotice('');
    try {
      await productionFabricationApi.approve(selected);
      const updated = await productionFabricationApi.templates();
      setTemplates(updated.filter(item => item.productoId === productId));
      setApprovalCheck(null);
      setNotice('Plantilla aprobada. La lista de materiales sigue inactiva hasta su activación independiente.');
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo aprobar la plantilla.')); }
    finally { setApproving(false); }
  }
  async function checkBomActivation() {
    if (!selected) return;
    setError(''); setBomCheck(null);
    try { setBomCheck(await productionFabricationApi.bomActivationCheck(selected)); }
    catch (caught) { setError(apiErrorMessage(caught, 'No se pudo consultar la activación de materiales.')); }
  }
  async function activateBom() {
    if (!selected || !bomCheck?.puedeActivar || activatingBom) return;
    const description = bomCheck.bomActivaAnteriorId === null
      ? 'No hay una lista de materiales activa actualmente.'
      : `Se reemplazará la lista de materiales activa #${bomCheck.bomActivaAnteriorId}.`;
    if (!window.confirm(`¿Activar la lista de materiales #${bomCheck.listaMaterialesId}?\n${description}\nLa aprobación de la plantilla no modifica stock.`)) return;
    setActivatingBom(true); setError('');
    try {
      await productionFabricationApi.activateTemplateBom(selected, bomCheck.bomActivaAnteriorId);
      setNotice('Lista de materiales activada. Revisá la configuración activa del producto.');
      setBomCheck(null);
      const all = await productionFabricationApi.templates();
      setTemplates(all.filter(item => item.productoId === productId));
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo activar la lista de materiales.')); }
    finally { setActivatingBom(false); }
  }
  const canEdit = hasPermission('Producción', 'Editar');
  function updatePiece(pieceId: number, patch: Partial<FabricationPiece>) {
    setDraftPieces(items => items.map(item => item.piezaId === pieceId ? { ...item, ...patch } : item));
  }
  async function saveDraft() {
    if (!canEdit || !selected || saving || !draftPieces.length) return;
    setError(''); setNotice(''); setSaving(true);
    try {
      const created = await productionFabricationApi.createDraftVersion(selected, draftPieces);
      const all = await productionFabricationApi.templates();
      setTemplates(all.filter(item => item.productoId === productId));
      setSelected(created.plantillaFabricacionId);
      setNotice('Nueva versión en Borrador. Recalculá el plano y revisá BOM antes de habilitar.');
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo guardar la nueva versión del despiece.')); }
    finally { setSaving(false); }
  }
  return <section className="production-detail-section production-fabrication-panel">
    <header><div><h2>{wizardView === 'pieces' ? 'Despiece del mueble' : wizardView === 'cut' ? 'Plano de corte' : '1. Despiece y corte'}</h2>{!wizardView && <p>Revisá el cálculo estimado y, si corresponde, guardá las correcciones como una nueva versión. El cálculo no modifica existencias ni habilita la fabricación.</p>}</div></header>
    {loading ? <div className="production-inline-empty">Consultando plantillas de fabricación…</div> : !templates.length ? <div className="production-inline-empty">Este producto no tiene plantilla de fabricación.</div> : <>
      {!wizardView && <div className="production-info-note">Circuito: calcular y revisar el despiece → guardar una versión si hay cambios → validar y aprobar → activar la lista de materiales. La aprobación y la activación son acciones independientes.</div>}
      <div className="production-fabrication-controls">
        <label><span>Plantilla</span><select value={selected} onChange={event => setSelected(Number(event.target.value))}>{templates.map(item => <option key={item.plantillaFabricacionId} value={item.plantillaFabricacionId}>{item.version} · {item.estado}</option>)}</select></label>
        <label><span>Unidades</span><input type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(Number(event.target.value))}/></label>
        <label><span>Margen (mm)</span><input type="number" min="0" step="0.01" value={margin} onChange={event => setMargin(Number(event.target.value))}/></label>
        <label><span>Sierra (mm)</span><input type="number" min="0" step="0.01" value={kerf} onChange={event => setKerf(Number(event.target.value))}/></label>
        <button className="button secondary" disabled={calculating || quantity <= 0 || !Number.isInteger(quantity)} onClick={() => void calculate()}><RefreshCw size={15}/>{calculating ? 'Calculando…' : 'Calcular'}</button>
      </div>
      <p className="production-fabrication-state">Plantilla {current?.version} · {current?.estado} · {current?.piezas ? current.piezas + ' piezas registradas' : 'despiece preliminar calculado en memoria'}</p>
      {!wizardView && <div className="production-fabrication-editor">
        <h3>2. Validar y aprobar la plantilla</h3>
        <p>Una vez revisado y guardado el despiece, comprobá los requisitos de aprobación. Validar no aprueba ni activa materiales.</p>
        <button className="button secondary" type="button" disabled={!selected || checkingApproval} onClick={() => void checkApproval()}>
          {checkingApproval ? 'Validando…' : 'Comprobar requisitos de aprobación'}
        </button>
        {approvalCheck?.puedeAprobar && canEdit && current?.estado === 'Borrador' && <button className="button secondary" type="button" disabled={approving} onClick={() => void approveTemplate()}>{approving ? 'Aprobando…' : 'Aprobar plantilla de fabricación'}</button>}
        {approvalCheck && <div className="production-fabrication-pending">
          <strong>{approvalCheck.puedeAprobar ? 'Sin bloqueos automáticos (requiere aprobación explícita)' : 'Aprobación bloqueada'}</strong>
          {approvalCheck.bloqueantes.length > 0 && <ul>{approvalCheck.bloqueantes.map((text, i) => <li key={'b'+i}>{text}</li>)}</ul>}
          {approvalCheck.advertencias.length > 0 && <ul>{approvalCheck.advertencias.map((text, i) => <li key={'a'+i}>{text}</li>)}</ul>}
        </div>}
      </div>}
      {!wizardView && <div className="production-fabrication-editor">
        <h3>3. Habilitar los materiales para producción</h3>
        <p>Después de aprobar la plantilla, comprobá y activá su BOM. Así queda disponible para órdenes futuras, sin crear ninguna OP ni modificar stock.</p>
        <button className="button secondary" type="button" disabled={!selected} onClick={() => void checkBomActivation()}>Consultar activación de BOM</button>
        {bomCheck && <div className="production-fabrication-pending">
          <strong>Lista #{bomCheck.listaMaterialesId}</strong>
          <p>{bomCheck.bomActivaAnteriorId === null ? 'No hay BOM activa previa.' : `BOM activa anterior: #${bomCheck.bomActivaAnteriorId}`}</p>
          {bomCheck.bloqueantes.length > 0 && <ul>{bomCheck.bloqueantes.map((msg, i) => <li key={i}>{msg}</li>)}</ul>}
          {bomCheck.puedeActivar && canEdit && <button className="button secondary" type="button" disabled={activatingBom} onClick={() => void activateBom()}>{activatingBom ? 'Activando…' : 'Activar lista de materiales'}</button>}
        </div>}
      </div>}
      {notice && <div className="production-info-note">{notice}</div>}
      {error && <div className="production-message error" role="alert"><AlertCircle size={17}/>{error}</div>}
      {!preview && wizardView && <div className="production-inline-empty">Seleccioná la plantilla y presioná Calcular para consultar el {wizardView === 'pieces' ? 'despiece estimado' : 'plano de corte'}.</div>}
      {preview && <>
        <div className="production-fabrication-facts"><span><strong>{preview.piezas.reduce((sum, part) => sum + part.cantidadPorUnidad * quantity, 0)}</strong> piezas</span><span><strong>{preview.corte?.newSheetCount ?? '—'}</strong> placas nuevas</span><span><strong>{preview.corte?.plannedCutIds.length ?? '—'}</strong> recortes existentes</span><span><strong>{preview.habilitable ? 'Sí' : 'No'}</strong> habilitable</span></div>
        {wizardView !== 'cut' && <><h3>{preview.piezas.every(part => part.persistida) ? 'Piezas guardadas' : 'Piezas estimadas'}</h3>
        <div className="production-fabrication-pieces">{preview.piezas.map(part => <div key={part.piezaId}><strong>{part.nombre}</strong><span>{part.cantidadPorUnidad} por unidad · {fmt(part.largoMm)} × {fmt(part.anchoMm)} × {fmt(part.espesorMm)} mm</span><small>Insumo #{part.insumoId} · veta {part.orientacionVeta} · cantos {part.cantosTerminados || 'sin canto previsto'}{part.persistida ? '' : ' · aún no persistida'}</small>{part.observaciones && <small>{part.observaciones}</small>}</div>)}</div>
        {canEdit && <div className="production-fabrication-editor"><h3>Revisar despiece</h3><p>Las correcciones crean otra versión en Borrador. La plantilla elegida conserva sus piezas y su historial.</p>{draftPieces.map(part => <div key={part.piezaId} className="production-fabrication-edit-row"><strong>{part.nombre}</strong><label><span>Cantidad</span><input type="number" min="1" step="1" value={part.cantidadPorUnidad} onChange={event => updatePiece(part.piezaId, { cantidadPorUnidad: Number(event.target.value) })}/></label><label><span>Largo (mm)</span><input type="number" min="0.01" step="0.01" value={part.largoMm} onChange={event => updatePiece(part.piezaId, { largoMm: Number(event.target.value) })}/></label><label><span>Ancho (mm)</span><input type="number" min="0.01" step="0.01" value={part.anchoMm} onChange={event => updatePiece(part.piezaId, { anchoMm: Number(event.target.value) })}/></label><label><span>Veta</span><select value={part.orientacionVeta} onChange={event => updatePiece(part.piezaId, { orientacionVeta: event.target.value })}><option>Indiferente</option><option>Largo</option><option>Ancho</option></select></label><label><span>Cantos L1,L2,A1,A2</span><input value={part.cantosTerminados} onChange={event => updatePiece(part.piezaId, { cantosTerminados: event.target.value })}/></label><label><span>Supuesto</span><input value={part.observaciones ?? ''} onChange={event => updatePiece(part.piezaId, { observaciones: event.target.value })}/></label></div>)}<button className="button secondary" type="button" disabled={saving || !draftPieces.length} onClick={() => void saveDraft()}>{saving ? 'Guardando…' : 'Guardar como nueva versión Borrador'}</button></div>}
        </>}
        {wizardView !== 'pieces' && <><h3>{showStoredPlan ? 'Plano EST-01 persistido' : 'Distribución rectangular recalculada'}</h3>
        {showStoredPlan && <p>Se muestra el plano guardado para una unidad y los parámetros originales. La disponibilidad actual y el lote se recalculan por separado.</p>}
        {visiblePlan?.surfaces.length ? <div className="production-fabrication-plans">{visiblePlan.surfaces.map(surface => {
          const positions = visiblePlan.placements.filter(item => item.surfaceNumber === surface.number);
          return <article key={surface.number}><div><strong>{surface.cutId ? 'Recorte #' + surface.cutId : 'Placa nueva #' + surface.number}</strong><span>Insumo #{surface.supplyId} · color #{surface.colorId} · {fmt(surface.lengthMm)} × {fmt(surface.widthMm)} mm</span></div><svg viewBox={'0 0 ' + surface.lengthMm + ' ' + surface.widthMm} role="img" aria-label={'Plano de corte de ' + surface.lengthMm + ' por ' + surface.widthMm + ' milímetros'}>
            <rect x="0" y="0" width={surface.lengthMm} height={surface.widthMm} className="production-cut-board"/>
            {surface.remainders.map((rect, index) => <rect key={'r-' + index} x={rect.xmm} y={rect.ymm} width={rect.lengthMm} height={rect.widthMm} className="production-cut-remainder"/>)}
            {positions.map((part, index) => <rect key={'p-' + index} x={part.xmm} y={part.ymm} width={part.lengthMm} height={part.widthMm} className="production-cut-piece"/>)}
          </svg><ul>{positions.map((part, index) => <li key={index}>{nameByPiece.get(part.pieceId)}: ({fmt(part.xmm)}, {fmt(part.ymm)}) · {fmt(part.lengthMm)} × {fmt(part.widthMm)} mm{part.rotated ? ' · girada' : ''}</li>)}</ul><small>{surface.remainders.length} sobrantes rectangulares teóricos. Se confirman al finalizar la OP.</small></article>;
        })}</div> : <div className="production-inline-empty">No hay un plano verificable con las piezas disponibles.</div>}
        <h3>Placas y disponibilidad</h3>
        <div className="production-fabrication-pieces">{preview.materiales.map(item => <div key={item.insumoId + '-' + item.colorId}><strong>Insumo #{item.insumoId} · color #{item.colorId}</strong><span>{item.placasNuevas} placas · {fmt(item.metrosCuadrados)} m² requeridos</span><small>{item.stockDisponibleM2 == null ? 'Stock no verificable' : fmt(item.stockDisponibleM2) + ' m² disponibles · faltante ' + fmt(item.faltanteM2 ?? 0) + ' m²'}</small></div>)}</div>
        <h3>Materiales de la BOM vinculada</h3><div className="production-fabrication-pieces">{preview.insumosBom?.length ? preview.insumosBom.map(item => <div key={item.insumoId}><strong>Insumo #{item.insumoId}</strong><span>{fmt(item.cantidadRequerida)} {item.unidad} requeridos</span><small>{fmt(item.stockDisponible)} disponibles · faltante {fmt(item.faltante)} {item.unidad}</small></div>) : <div>La plantilla no tiene materiales vinculados.</div>}</div>
        <h3>Costos de BOM</h3><div className="production-fabrication-pieces">{preview.costos.length ? preview.costos.map(item => <div key={item.productoId}><strong>{item.estado}</strong><span>{item.costoMaterialesLote == null ? 'Sin fuente verificable' : '$ ' + fmt(item.costoMaterialesLote) + ' de materiales para el lote'}</span>{item.advertencias.map((message, index) => <small key={index}>{message}</small>)}</div>) : <div>La BOM aún no permite estimar costos.</div>}</div>
        {preview.pendientes.length > 0 && <aside className="production-fabrication-pending"><strong>Pendiente de revisión antes de fabricar</strong><ul>{preview.pendientes.map((item, index) => <li key={index}>{item}</li>)}</ul></aside>}
        </>}
      </>}
    </>}
  </section>;
}
