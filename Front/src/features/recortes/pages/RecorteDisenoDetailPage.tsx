import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { Modal } from '../../../components/data/Modal';
import { StatusBadge } from '../../../components/data/StatusBadge';
import { Toast } from '../../../components/ui/Toast';
import { apiErrorMessage } from '../../../services/apiClient';
import { hasPermission } from '../../../services/authorization';
import { productsApi, type Product } from '../../../services/productsApi';
import { formatProductName } from '../../../services/productDisplay';
import { productionRecipesApi, type MaterialList } from '../../../services/productionRecipesApi';
import { productionFabricationApi, type FabricationTemplate } from '../../../services/productionFabricationApi';
import { recortesApi } from '../../../services/recortesApi';
import { recortesInteligentesApi, type DetallePropuesta, type RecortesGenerationConfig } from '../../../services/recortesInteligentesApi';
import type { ColorLookup, Supply } from '../../../services/suppliesApi';
import '../recortesInteligentes.css';
import '../styles/recortes.css';

const display = (value: unknown) => value == null || value === '' ? '—' : String(value);
const number = (value: unknown) => typeof value === 'number' ? value.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : '—';
const date = (value: unknown) => {
  if (typeof value !== 'string') return display(value);
  const utc = /[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  return Number.isNaN(Date.parse(utc)) ? display(value) : new Date(utc).toLocaleString('es-AR');
};
export function RecorteDisenoDetailPage({ disenoId }: { disenoId: number }) {
  const [detail, setDetail] = useState<DetallePropuesta | null>(null);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [colors, setColors] = useState<ColorLookup[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<RecortesGenerationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [decision, setDecision] = useState<'aprobar' | 'rechazar' | 'descartar' | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [certificationOpen, setCertificationOpen] = useState(false);
  const [evidence, setEvidence] = useState<Record<number, string>>({});
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<MaterialList[]>([]);
  const [templates, setTemplates] = useState<FabricationTemplate[]>([]);
  const [productId, setProductId] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [piecePage, setPiecePage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [proposal, supplyList, colorList, settings] = await Promise.all([
        recortesInteligentesApi.detalle(disenoId), recortesApi.supplies(), recortesApi.colors(), recortesInteligentesApi.configuracion(),
      ]);
      setDetail(proposal); setSupplies(supplyList); setColors(colorList); setGenerationConfig(settings);
    }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudo consultar la propuesta.')); }
    finally { setLoading(false); }
  }, [disenoId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const reference = detail?.Imagenes.find(row => row.Tipo === 'Ilustrativa')?.Referencia;
    setImageError(false);
    setImageUrl(null);
    if (typeof reference !== 'string') { setImageUrl(null); return; }
    let live = true; let url: string | null = null;
    void recortesInteligentesApi.imagen(reference).then(blob => {
      if (!live) return;
      url = URL.createObjectURL(blob); setImageUrl(url);
    }).catch(() => { if (live) { setImageUrl(null); setImageError(true); } });
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [detail]);
  async function decide() {
    if (!decision || busy || decision !== 'aprobar' && !reason.trim()) {
      setError('Indicá el motivo de la decisión.'); return;
    }
    setBusy(true); setError('');
    try {
      await recortesInteligentesApi.decidir(disenoId, decision, reason.trim());
      setNotice('Decisión registrada.'); setDecision(null); setReason(''); await load();
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo registrar la decisión.')); }
    finally { setBusy(false); }
  }
  async function certify() {
    if (busy || !detail) return;
    const pending = detail.Validaciones[0]?.Motivos.filter(row => row.Severidad === 'Pendiente') ?? [];
    if (!pending.length || pending.some(row => (evidence[Number(row.RecorteDisenoValidacionMotivoId)] ?? '').trim().length < 20)) {
      setError('Documentá cada verificación pendiente con al menos 20 caracteres.'); return;
    }
    setBusy(true); setError('');
    try {
      await recortesInteligentesApi.certificar(disenoId, pending.map(row => ({
        motivoId: Number(row.RecorteDisenoValidacionMotivoId),
        evidencia: evidence[Number(row.RecorteDisenoValidacionMotivoId)].trim(),
      })));
      setCertificationOpen(false); setEvidence({}); setNotice('Certificación técnica registrada. La aprobación sigue siendo una decisión separada.');
      await load();
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo certificar el diseño.')); }
    finally { setBusy(false); }
  }
  async function openRecipe() {
    setRecipeOpen(true); setRecipeLoading(true); setError('');
    try {
      const [productList, recipeList, templateList] = await Promise.all([
        productsApi.list(), productionRecipesApi.lists(), productionFabricationApi.templates(),
      ]);
      setProducts(productList.filter(row => row.activo)); setRecipes(recipeList.filter(row => row.activa));
      setTemplates(templateList.filter(row => row.estado === 'Aprobada' && row.bomActiva));
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron consultar las recetas aprobadas.')); }
    finally { setRecipeLoading(false); }
  }
  async function linkRecipe() {
    if (busy || !productId || !recipeId || !templateId) return;
    setBusy(true); setError('');
    try {
      await recortesInteligentesApi.vincularReceta(disenoId, Number(productId), Number(recipeId), Number(templateId));
      setRecipeOpen(false); setNotice('Producto, BOM y plantilla vinculados al diseño.'); await load();
    } catch (cause) { setError(apiErrorMessage(cause, 'La receta no coincide con el diseño certificado.')); }
    finally { setBusy(false); }
  }
  const canEdit = hasPermission('Recortes / GIR', 'Editar');
  const canApprove = detail?.EstadoRevision === 'Validada' && detail.Validaciones[0]?.Resultado === 'Valida';
  const canReject = detail && !['Aprobada', 'Rechazada', 'Descartada'].includes(detail.EstadoRevision);
  const canCertify = !!detail && !!generationConfig?.circuitoFabricacionHabilitado && canEdit &&
    detail.EstadoRevision === 'PendienteValidacion' && detail.Validaciones[0]?.Resultado === 'PendienteGeometria' &&
    detail.Validaciones[0]?.DiagnosticoPreliminar === 'PendienteGeometria' &&
    detail.Validaciones[0]?.Motivos.some(row => row.Severidad === 'Pendiente') &&
    !detail.Validaciones[0]?.Motivos.some(row => row.Severidad === 'Error');
  const canLinkRecipe = !!detail && !!generationConfig?.circuitoFabricacionHabilitado && canEdit &&
    hasPermission('Producción', 'Editar') && detail.EstadoRevision === 'Aprobada' && !detail.VinculoReceta;
  const availableRecipes = recipes.filter(row => row.productoId === Number(productId));
  const availableTemplates = templates.filter(row => row.productoId === Number(productId) &&
    row.listaMaterialesId === Number(recipeId));
  const supplyName = (id: unknown) => supplies.find(row => row.insumoId === Number(id))?.nombre ?? `Insumo #${display(id)}`;
  const colorName = (id: unknown) => colors.find(row => row.id === Number(id))?.descripcion ?? (id == null ? 'Sin identificar' : `Color #${id}`);
  const pieceColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'name', header: 'Pieza', render: row => <strong>{display(row.Nombre)}</strong> },
    { key: 'dimensions', header: 'Medidas (mm)', render: row => `${number(row.LargoMm)} × ${number(row.AnchoMm)} × ${number(row.EspesorMm)}` },
    { key: 'amount', header: 'Cantidad', render: row => number(row.Cantidad) },
    { key: 'material', header: 'Material / color', render: row => `${supplyName(row.InsumoId)} · ${colorName(row.ColorId)}` },
    { key: 'origin', header: 'Origen / veta', render: row => `${display(row.Origen)} · ${display(row.OrientacionVeta)}` },
  ];
  const assignmentColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'piece', header: 'Pieza', render: row => `#${display(row.OrdenPieza)}` },
    { key: 'cut', header: 'Recorte', render: row => <a href={`/recortes/inventario/${row.RecorteId}`}>#{display(row.RecorteId)}</a> },
    { key: 'location', header: 'Posición (mm)', render: row => `${number(row.PosicionXmm)}, ${number(row.PosicionYmm)}` },
    { key: 'dimensions', header: 'Corte (mm)', render: row => `${number(row.LargoCorteMm)} × ${number(row.AnchoCorteMm)}` },
    { key: 'kerf', header: 'Sierra (mm)', render: row => number(row.AnchoSierraMm) },
  ];
  const latestValidation = detail?.Validaciones[0];
  const blockers = latestValidation?.Motivos.filter(row => row.Severidad === 'Error' || row.Severidad === 'Pendiente') ?? [];
  const warnings = latestValidation?.Motivos.filter(row => row.Severidad === 'Advertencia' || row.Severidad === 'Supuesto') ?? [];
  const pendingReasons = latestValidation?.Motivos.filter(row => row.Severidad === 'Pendiente') ?? [];
  return <AppShell title="Detalle de diseño" breadcrumb="Recortes / GIR / Diseños con IA / Detalle" backHref="/recortes/disenos" backLabel="Volver a Diseños con IA">
    <main className="gir-page recortes-page"><Toast message={notice} onClose={() => setNotice('')}/>
      <PageHeader title="Consultar diseño" action={detail && canEdit && <div className="gir-actions">
        {canCertify && <button className="button primary" onClick={() => { setError(''); setCertificationOpen(true); }}>Certificar técnicamente</button>}
        {canApprove && <button className="button primary" onClick={() => setDecision('aprobar')}>Aprobar propuesta</button>}
        {canLinkRecipe && <button className="button primary" onClick={() => void openRecipe()}>Vincular receta</button>}
        {detail.OrdenGIR?.OrdenProduccionId != null && <a className="button secondary" href={`/production/orders/${detail.OrdenGIR.OrdenProduccionId}`}>Seguir OP #{display(detail.OrdenGIR.OrdenProduccionId)}</a>}
        {canReject && <><button className="button secondary" title="No supera la evaluación técnica o de fabricación" onClick={() => setDecision('rechazar')}>Rechazar</button><button className="button secondary" title="Alternativa que no se continuará" onClick={() => setDecision('descartar')}>Descartar</button></>}
      </div>}/>
      {loading ? <div className="state-box">Cargando diseño…</div> : error && !detail ? <div className="gir-error" role="alert">{error}<button className="button secondary" onClick={() => void load()}>Reintentar</button></div> : detail && <>
        {error && <div className="gir-error" role="alert">{error}</div>}
        <section className="gir-section gir-design-summary" aria-labelledby="gir-design-summary-title">
          <div className="gir-design-summary-layout">
            <div className="gir-design-image">
              {imageUrl ? <img className="recortes-image" src={imageUrl} alt={`Ilustración de ${detail.Nombre}`}/> : <div className="recortes-image-empty">{imageError ? 'No se pudo cargar la imagen conceptual.' : generationConfig && !generationConfig.imagenesHabilitadas ? generationConfig.motivoImagenes || 'Las imágenes están desactivadas.' : 'Sin imagen conceptual.'}</div>}
              <small>Imagen conceptual. No reemplaza un plano técnico.</small>
            </div>
            <div className="gir-design-info">
              <div className="gir-design-heading"><div><h2 id="gir-design-summary-title">{detail.Nombre}</h2><span>Versión {detail.VersionNumero} · Generación #{detail.RecorteGeneracionId}</span></div><StatusBadge tone={detail.EstadoRevision === 'Aprobada' ? 'success' : 'warning'}>{detail.EstadoRevision === 'PendienteValidacion' ? 'Pendiente de evaluación' : detail.EstadoRevision === 'PendienteGeometria' ? 'Pendiente de validación geométrica' : detail.EstadoRevision}</StatusBadge></div>
              <p className="gir-design-description">{descriptionExpanded || detail.Descripcion.length <= 240 ? detail.Descripcion : `${detail.Descripcion.slice(0, 240).trimEnd()}…`}{detail.Descripcion.length > 240 && <button className="gir-inline-action" onClick={() => setDescriptionExpanded(value => !value)}>{descriptionExpanded ? 'Ver menos' : 'Ver más'}</button>}</p>
              <dl className="gir-design-facts"><div><dt>Dimensiones exteriores</dt><dd>{number(detail.LargoExteriorMm)} × {number(detail.AnchoExteriorMm)} × {number(detail.AltoExteriorMm)} mm</dd></div><div><dt>Material</dt><dd>{supplyName(detail.MaterialInsumoId)}</dd></div><div><dt>Color</dt><dd>{colorName(detail.ColorId)}</dd></div><div><dt>Costo estimado</dt><dd>{detail.Costos.length && detail.Costos.every(row => row.Subtotal != null) ? detail.Costos.reduce((sum, row) => sum + Number(row.Subtotal), 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : 'Incompleto'}</dd></div></dl>
            </div>
          </div>
        </section>
        <section className="gir-section"><h2>Piezas y aprovechamiento</h2><DataTable rows={detail.Piezas.slice((piecePage - 1) * 10, piecePage * 10)} columns={pieceColumns} rowKey={row => String(row.RecorteDisenoPiezaId ?? row.OrdenPieza)} page={piecePage} pageSize={10} totalRecords={detail.Piezas.length} onPageChange={setPiecePage} emptyState={<div className="state-box">Sin piezas registradas.</div>}/></section>
        <section className="gir-section"><h2>Recortes asignados</h2><DataTable rows={detail.Asignaciones.slice((assignmentPage - 1) * 10, assignmentPage * 10)} columns={assignmentColumns} rowKey={row => String(row.RecorteDisenoAsignacionId)} page={assignmentPage} pageSize={10} totalRecords={detail.Asignaciones.length} onPageChange={setAssignmentPage} emptyState={<div className="state-box">Sin asignaciones registradas.</div>}/></section>
        <section className="gir-section"><h2>Insumos y costos</h2><div className="gir-records">{detail.InsumosComplementarios.map((row, index) => <div key={`i-${index}`}><strong>{supplyName(row.InsumoId)}</strong><span>{number(row.Cantidad)} {supplies.find(item => item.insumoId === Number(row.InsumoId))?.unidadMedidaAbreviatura ?? 'u.'}</span></div>)}{detail.Costos.map((row, index) => <div key={`c-${index}`}><strong>{display(row.Tipo)}</strong><span>{row.Subtotal == null ? display(row.MotivoIncompleto) : Number(row.Subtotal).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>)}</div></section>
        <section className="gir-section"><h2>Validación técnica</h2>{latestValidation ? <div className="gir-validation"><StatusBadge tone={latestValidation.Resultado === 'Valida' ? 'success' : 'warning'}>{latestValidation.Resultado === 'PendienteGeometria' ? 'Pendiente de validación geométrica y constructiva' : display(latestValidation.Resultado)}</StatusBadge>{blockers.length > 0 && <div><strong>Qué impide aprobar</strong><ul>{blockers.map((item, index) => <li key={index}>{display(item.Detalle)}{item.OrdenPieza != null && ` · pieza #${item.OrdenPieza}`}</li>)}</ul></div>}{warnings.length > 0 && <div><strong>Advertencias y supuestos</strong><ul>{warnings.map((item, index) => <li key={index}>{display(item.Detalle)}</li>)}</ul></div>}{blockers.length === 0 && warnings.length === 0 && <span>Sin observaciones registradas.</span>}</div> : <div className="state-box">La validación técnica aún no fue registrada.</div>}</section>
        <section className="gir-section"><h2>Historial y decisiones</h2><dl className="gir-facts"><div><dt>Generación</dt><dd>#{detail.RecorteGeneracionId}</dd></div><div><dt>Fecha de creación</dt><dd>{date(detail.FechaCreacion)}</dd></div>{detail.Certificacion && <div><dt>Certificación técnica</dt><dd>{date(detail.Certificacion.FechaCertificacion)} · usuario #{display(detail.Certificacion.UsuarioId)}</dd></div>}{detail.VinculoReceta && <div><dt>Receta vinculada</dt><dd>Producto #{display(detail.VinculoReceta.ProductoId)} · BOM #{display(detail.VinculoReceta.ListaMaterialesId)} · plantilla #{display(detail.VinculoReceta.PlantillaFabricacionId)}</dd></div>}</dl><div className="gir-records">{detail.Historial?.map((row, index) => <div key={index}><strong>{display(row.EstadoNuevo)}</strong><span>{date(row.Fecha)} · {display(row.Motivo)}{row.UsuarioId != null && ` · usuario #${row.UsuarioId}`}</span></div>)}</div></section>
      </>}
      {certificationOpen && <Modal title="Certificar diseño" subtitle="Un responsable debe documentar cada comprobación pendiente. La certificación no reserva ni consume recortes." onClose={() => { if (!busy) setCertificationOpen(false); }}>
        <div className="gir-dialog">
          <p>Revisá físicamente el ensamble, acabado, estabilidad y secuencia de corte. El sistema volverá a comprobar la disponibilidad de cada recorte.</p>
          {pendingReasons.map(row => { const id = Number(row.RecorteDisenoValidacionMotivoId); return <label key={id}><span>{display(row.Detalle)}{row.OrdenPieza != null && ` · pieza #${row.OrdenPieza}`}</span><textarea rows={3} maxLength={2000} value={evidence[id] ?? ''} onChange={event => setEvidence(current => ({ ...current, [id]: event.target.value }))} placeholder="Indicá medición, plano, responsable o comprobación realizada…"/><small>{(evidence[id] ?? '').trim().length}/20 caracteres mínimos</small></label>; })}
          {error && <div className="gir-error" role="alert">{error}</div>}
          <div className="gir-actions"><button className="button secondary" disabled={busy} onClick={() => setCertificationOpen(false)}>Cancelar</button><button className="button primary" disabled={busy || pendingReasons.some(row => (evidence[Number(row.RecorteDisenoValidacionMotivoId)] ?? '').trim().length < 20)} onClick={() => void certify()}>{busy ? 'Certificando…' : 'Registrar certificación'}</button></div>
        </div>
      </Modal>}
      {recipeOpen && <Modal title="Vincular Producto y receta" subtitle="El alta del Producto y la aprobación de la plantilla son acciones explícitas de sus módulos." onClose={() => { if (!busy) setRecipeOpen(false); }}>
        <div className="gir-dialog">
          {recipeLoading ? <div className="state-box">Consultando recetas…</div> : <>
            <p>La BOM debe incluir solamente insumos complementarios; los paneles obtenidos de recortes se consumen por el plan GIR al iniciar la OP.</p>
            <label><span>Producto activo</span><select value={productId} onChange={event => { setProductId(event.target.value); setRecipeId(''); setTemplateId(''); }}><option value="">Seleccionar producto</option>{products.map(row => <option key={row.productoId} value={row.productoId}>{formatProductName(row)}</option>)}</select></label>
            <label><span>BOM activa</span><select value={recipeId} disabled={!productId} onChange={event => { setRecipeId(event.target.value); setTemplateId(''); }}><option value="">Seleccionar BOM</option>{availableRecipes.map(row => <option key={row.listaMaterialesId} value={row.listaMaterialesId}>{row.nombre} · {row.version || 'sin versión'}</option>)}</select></label>
            <label><span>Plantilla aprobada</span><select value={templateId} disabled={!recipeId} onChange={event => setTemplateId(event.target.value)}><option value="">Seleccionar plantilla</option>{availableTemplates.map(row => <option key={row.plantillaFabricacionId} value={row.plantillaFabricacionId}>{row.version} · {row.piezas} piezas</option>)}</select></label>
            <div className="gir-actions"><a className="button secondary" href="/inventory/products/new">Registrar Producto</a><a className="button secondary" href="/production/recipes">Gestionar recetas</a></div>
            {error && <div className="gir-error" role="alert">{error}</div>}
            <div className="gir-actions"><button className="button secondary" disabled={busy} onClick={() => setRecipeOpen(false)}>Cancelar</button><button className="button primary" disabled={busy || !productId || !recipeId || !templateId} onClick={() => void linkRecipe()}>{busy ? 'Vinculando…' : 'Vincular receta'}</button></div>
          </>}
        </div>
      </Modal>}
      {decision && <Modal title={decision === 'aprobar' ? 'Aprobar propuesta' : decision === 'rechazar' ? 'Rechazar propuesta' : 'Descartar propuesta'} subtitle="La decisión quedará registrada en el historial; no modifica stock." onClose={() => { if (!busy) setDecision(null); }}><div className="gir-dialog"><p>{decision === 'rechazar' ? 'Usá Rechazar si el diseño no supera la evaluación. La decisión es definitiva para esta versión.' : decision === 'descartar' ? 'Usá Descartar si no continuarás con esta alternativa. La decisión es definitiva para esta versión.' : 'La aprobación no reserva recortes ni crea una orden de producción.'}</p>{decision !== 'aprobar' && <label><span>Motivo *</span><textarea maxLength={500} value={reason} onChange={event => setReason(event.target.value)}/></label>}{error && <p className="gir-error" role="alert">{error}</p>}<div className="gir-actions"><button className="button secondary" disabled={busy} onClick={() => setDecision(null)}>Cancelar</button><button className="button primary" disabled={busy} onClick={() => void decide()}>{busy ? 'Guardando…' : 'Confirmar decisión'}</button></div></div></Modal>}
    </main>
  </AppShell>;
}
