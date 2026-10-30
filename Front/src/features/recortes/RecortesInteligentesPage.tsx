import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { Modal } from '../../components/data/Modal';
import { DateRangeFilter } from '../../components/data/DateRangeFilter';
import { StatusBadge } from '../../components/data/StatusBadge';
import { recorteCodigo } from './utils/recortePresentation';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { recortesApi } from '../../services/recortesApi';
import type { ColorLookup } from '../../services/suppliesApi';
import { recortesInteligentesApi, type Generacion, type Propuesta, type RecorteElegible, type RecortesGenerationConfig } from '../../services/recortesInteligentesApi';
import './recortesInteligentes.css';
import './styles/recortes.css';

const pageSize = 10;
const pendingKey = 'teka.recortes.solicitud';
const utcTime = (value: string) => Date.parse(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
const date = (value: string) => new Date(utcTime(value)).toLocaleString('es-AR');
const reviewLabel = (state: string) => state === 'PendienteValidacion' ? 'Pendiente de evaluación'
  : state === 'PendienteGeometria' ? 'Pendiente de validación geométrica' : state;
export function RecortesInteligentesPage() {
  const [config, setConfig] = useState<RecortesGenerationConfig | null>(null);
  const [eligible, setEligible] = useState<RecorteElegible[]>([]);
  const [eligibleTotal, setEligibleTotal] = useState(0);
  const [colors, setColors] = useState<ColorLookup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [eligibleSearch, setEligibleSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [minLength, setMinLength] = useState('');
  const [minWidth, setMinWidth] = useState('');
  const [confirmGeneration, setConfirmGeneration] = useState(false);
  const [generations, setGenerations] = useState<Generacion[]>([]);
  const [proposals, setProposals] = useState<Propuesta[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [eligiblePage, setEligiblePage] = useState(1);
  const [generationPage, setGenerationPage] = useState(1);
  const [tab, setTab] = useState<'propuestas' | 'generar' | 'historial'>('propuestas');
  const [reviewState, setReviewState] = useState('');
  const [generationFilter, setGenerationFilter] = useState<number | null>(null);
  const refresh = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const [settings, cuts, batches, designs, colorList] = await Promise.all([
        recortesInteligentesApi.configuracion(), recortesInteligentesApi.elegibles(),
        recortesInteligentesApi.todasGeneraciones(), recortesInteligentesApi.todasPropuestas(), recortesApi.colors(),
      ]);
      setConfig(settings); setEligible(cuts.recortes); setEligibleTotal(cuts.total);
      setColors(colorList);
      setSelectedIds(current => new Set([...current].filter(id => cuts.recortes.some(row => row.recorteId === id))));
      setGenerations(batches.items); setProposals(designs.items);
      setTruncated(batches.truncated || designs.truncated); setError('');
      if (!batches.items.some(row => row.Estado === 'PendienteGeneracion' &&
          Date.now() - utcTime(row.FechaGeneracion) < settings.pendingTimeoutMinutes * 60_000))
        sessionStorage.removeItem(pendingKey);
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo consultar Diseños con IA.')); }
    finally { if (initial) setLoading(false); }
  }, []);
  useEffect(() => { void refresh(true); }, [refresh]);
  useEffect(() => {
    const ids = generations.filter(row => row.Estado === 'PendienteGeneracion' &&
      Date.now() - utcTime(row.FechaGeneracion) < (config?.pendingTimeoutMinutes ?? 15) * 60_000)
      .map(row => row.RecorteGeneracionId);
    if (!ids.length) return;
    let active = true;
    const timer = window.setInterval(() => {
      void Promise.all(ids.map(id => recortesInteligentesApi.generacion(id))).then(updated => {
        if (!active) return;
        const byId = new Map(updated.map(row => [row.RecorteGeneracionId, row]));
        setGenerations(current => current.map(row => byId.get(row.RecorteGeneracionId) ?? row));
        if (updated.every(row => row.Estado !== 'PendienteGeneracion')) void refresh();
      }).catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudo actualizar el estado de generación.')); });
    }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [generations, refresh, config?.pendingTimeoutMinutes]);
  useEffect(() => setPage(1), [search, from, to, reviewState, generationFilter]);
  useEffect(() => setEligiblePage(1), [eligibleSearch, materialFilter, colorFilter, minLength, minWidth]);
  async function generate() {
    if (generating || !config?.habilitado || selectedIds.size === 0 || selectedIds.size > config.maxRecortes ||
      generations.some(row => row.Estado === 'PendienteGeneracion' &&
        Date.now() - utcTime(row.FechaGeneracion) < config.pendingTimeoutMinutes * 60_000)) return;
    const ids = [...selectedIds].sort((a, b) => a - b);
    let saved: { uid: string; ids: number[] } | null = null;
    try { saved = JSON.parse(sessionStorage.getItem(pendingKey) || 'null'); } catch { /* Se reemplaza una solicitud local inválida. */ }
    const uid = saved && JSON.stringify(saved.ids) === JSON.stringify(ids) ? saved.uid : crypto.randomUUID();
    sessionStorage.setItem(pendingKey, JSON.stringify({ uid, ids }));
    setConfirmGeneration(false); setGenerating(true); setError('');
    try {
      const result = await recortesInteligentesApi.generar(uid, ids);
      if (result.Estado !== 'PendienteGeneracion') sessionStorage.removeItem(pendingKey);
      await refresh();
      if (result.Estado === 'ConError') setError(result.ErrorDetalle || 'La generación terminó sin propuestas.');
      if (result.Estado === 'Registrada') { setGenerationFilter(result.RecorteGeneracionId); setTab('propuestas'); }
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron generar propuestas.')); }
    finally { setGenerating(false); }
  }
  const reviewStates = useMemo(() => [...new Set(proposals.map(row => row.EstadoRevision))].sort(), [proposals]);
  const filtered = useMemo(() => proposals.filter(row =>
    row.Nombre.toLocaleLowerCase('es-AR').includes(search.toLocaleLowerCase('es-AR')) &&
    (generationFilter == null || row.RecorteGeneracionId === generationFilter) &&
    (!reviewState || row.EstadoRevision === reviewState) &&
    (!from || row.FechaCreacion.slice(0, 10) >= from) &&
    (!to || row.FechaCreacion.slice(0, 10) <= to)), [proposals, search, from, to, reviewState, generationFilter]);
  const columns: DataTableColumn<Propuesta>[] = [
    { key: 'name', header: 'Diseño', render: row => <strong>{row.Nombre}</strong> },
    { key: 'version', header: 'Versión', render: row => `v${row.VersionNumero}` },
    { key: 'date', header: 'Generada', render: row => date(row.FechaCreacion) },
    { key: 'state', header: 'Revisión', render: row => <StatusBadge tone={row.EstadoRevision === 'Aprobada' ? 'success' : 'warning'}>{reviewLabel(row.EstadoRevision)}</StatusBadge> },
  ];
  const inProgress = generations.some(row => row.Estado === 'PendienteGeneracion' &&
    Date.now() - utcTime(row.FechaGeneracion) < (config?.pendingTimeoutMinutes ?? 15) * 60_000);
  const stalePending = generations.some(row => row.Estado === 'PendienteGeneracion' &&
    Date.now() - utcTime(row.FechaGeneracion) >= (config?.pendingTimeoutMinutes ?? 15) * 60_000);
  const latestGeneration = [...generations].sort((a, b) => utcTime(b.FechaGeneracion) - utcTime(a.FechaGeneracion))[0];
  async function recoverPending() {
    setRecovering(true); setError('');
    try { await recortesInteligentesApi.recuperarPendientes(); await refresh(); }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudieron recuperar las generaciones interrumpidas.')); }
    finally { setRecovering(false); }
  }
  const materials = useMemo(() => [...new Set(eligible.map(row => row.tipoInsumoNombre))].sort(), [eligible]);
  const eligibleFiltered = useMemo(() => eligible.filter(row =>
    `${row.recorteId} ${row.tipoInsumoNombre}`.toLocaleLowerCase('es-AR').includes(eligibleSearch.toLocaleLowerCase('es-AR')) &&
    (!materialFilter || row.tipoInsumoNombre === materialFilter) &&
    (!colorFilter || row.colorId === Number(colorFilter)) &&
    (!minLength || (row.largoMm ?? 0) >= Number(minLength)) &&
    (!minWidth || (row.anchoMm ?? 0) >= Number(minWidth))),
  [eligible, eligibleSearch, materialFilter, colorFilter, minLength, minWidth]);
  const eligibleVisible = eligibleFiltered.slice((eligiblePage - 1) * pageSize, eligiblePage * pageSize);
  function toggleSelection(id: number) {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < (config?.maxRecortes ?? 0)) next.add(id);
      return next;
    });
  }
  const eligibleColumns: DataTableColumn<RecorteElegible>[] = [
    { key: 'select', header: 'Elegir', render: row => <input type="checkbox" aria-label={`Seleccionar ${recorteCodigo(row.recorteId)}`} checked={selectedIds.has(row.recorteId)} disabled={!selectedIds.has(row.recorteId) && selectedIds.size >= (config?.maxRecortes ?? 0)} onChange={() => toggleSelection(row.recorteId)}/> },
    { key: 'cut', header: 'Recorte', render: row => recorteCodigo(row.recorteId) },
    { key: 'material', header: 'Material', render: row => row.tipoInsumoNombre },
    { key: 'color', header: 'Color', render: row => colors.find(item => item.id === row.colorId)?.descripcion ?? `#${row.colorId}` },
    { key: 'dimensions', header: 'Medidas (mm)', render: row => `${row.largoMm} × ${row.anchoMm} × ${row.espesorMm}` },
    { key: 'grain', header: 'Veta', render: row => row.orientacionVeta || '—' },
  ];
  const generationColumns: DataTableColumn<Generacion>[] = [
    { key: 'id', header: 'Generación', render: row => row.RecorteGeneracionId },
    { key: 'date', header: 'Fecha', render: row => date(row.FechaGeneracion) },
    { key: 'state', header: 'Estado', render: row => <StatusBadge tone={row.Estado === 'ConError' ? 'warning' : 'success'}>{row.Estado}</StatusBadge> },
    { key: 'count', header: 'Propuestas recibidas', render: row => row.CantidadRecibidas },
    { key: 'error', header: 'Observaciones', render: row => row.ErrorDetalle || '—' },
  ];
  const canGenerate = hasPermission('Recortes / GIR', 'Crear') && !loading && !generating && !inProgress &&
    !!config?.habilitado && selectedIds.size > 0 && selectedIds.size <= config.maxRecortes;
  return <AppShell title="Diseños con IA" breadcrumb="Recortes / GIR / Diseños con IA">
    <main className="gir-page gir-ai-page">
      <PageHeader title="Diseños con IA"/>
      {(generating || inProgress) && <div className="gir-generation-progress" role="status" aria-live="polite"><div><strong>Generación en curso</strong><span>{inProgress ? `Solicitud #${latestGeneration?.RecorteGeneracionId ?? '—'} · PendienteGeneracion` : 'Procesando solicitud de generación…'}</span></div><div className="gir-generation-progress-track" aria-hidden="true"><i/></div><small>El estado se consulta automáticamente. Podés volver a esta pantalla para ver el resultado.</small></div>}
      {!generating && !inProgress && latestGeneration?.Estado === 'Registrada' && <div className="gir-generation-result" role="status"><span>Generación #{latestGeneration.RecorteGeneracionId} completada · {latestGeneration.CantidadRecibidas} propuestas recibidas.</span><button className="button secondary compact" onClick={() => { setGenerationFilter(latestGeneration.RecorteGeneracionId); setTab('propuestas'); }}>Ver propuestas</button></div>}
      {!generating && !inProgress && latestGeneration?.Estado === 'ConError' && <div className="gir-error" role="alert">Generación #{latestGeneration.RecorteGeneracionId}: {latestGeneration.ErrorDetalle || 'No se pudieron guardar propuestas.'}</div>}
      <div className="gir-ai-tabs" role="tablist" aria-label="Secciones de diseños con IA">
        <button type="button" role="tab" aria-selected={tab === 'propuestas'} className={tab === 'propuestas' ? 'active' : ''} onClick={() => setTab('propuestas')}>Propuestas</button>
        <button type="button" role="tab" aria-selected={tab === 'generar'} className={tab === 'generar' ? 'active' : ''} onClick={() => setTab('generar')}>Generar diseños</button>
        <button type="button" role="tab" aria-selected={tab === 'historial'} className={tab === 'historial' ? 'active' : ''} onClick={() => setTab('historial')}>Historial</button>
      </div>
      {error && <div className="gir-error" role="alert">{error}<button className="button secondary" onClick={() => void refresh(true)}><RefreshCw size={15}/>Reintentar</button></div>}
      {tab === 'propuestas' && <section className="gir-ai-panel" role="tabpanel">
        {generationFilter != null && <div className="gir-generation-result"><span>Propuestas de la generación #{generationFilter}</span><button className="button secondary compact" onClick={() => setGenerationFilter(null)}>Ver todas</button></div>}
        <DataTableFilters className="gir-ai-filters" search={search} onSearchChange={setSearch} searchPlaceholder="Buscar diseño" onClear={() => { setSearch(''); setFrom(''); setTo(''); setReviewState(''); setGenerationFilter(null); }} clearDisabled={!search && !from && !to && !reviewState && generationFilter == null}>
          <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo}/>
          <label className="data-table-filter-field"><span>Estado</span><select value={reviewState} onChange={event => setReviewState(event.target.value)}><option value="">Todos</option>{reviewStates.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        </DataTableFilters>
        {truncated && <div className="gir-notice">La API devolvió un conjunto limitado de resultados; los filtros se aplican a los registros cargados.</div>}
        <DataTable rows={filtered.slice((page - 1) * pageSize, page * pageSize)} columns={columns} rowKey={row => row.RecorteDisenoId} onRowClick={row => { window.location.assign(`/recortes/disenos/${row.RecorteDisenoId}`); }} page={page} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} loading={loading} emptyState={<div className="state-box">No hay propuestas para mostrar.</div>}/>
      </section>}
      {tab === 'generar' && <section className="gir-ai-panel" role="tabpanel">
        <div className="gir-ai-generation-toolbar">
          <div className="gir-ai-generation-info" aria-live="polite">
            <span><strong>{loading ? '…' : eligibleTotal}</strong> recortes elegibles</span>
            <span className="gir-ai-info-divider" aria-hidden="true"/>
            <span><strong>{selectedIds.size}</strong> seleccionados</span>
            <span className="gir-ai-info-divider" aria-hidden="true"/>
            <span>IA: <strong>{config?.habilitado ? 'Habilitada' : 'No disponible'}</strong></span>
            <span className="gir-ai-info-divider" aria-hidden="true"/>
            <span>Máximo: <strong>{config?.maxRecortes ?? '—'}</strong></span>
          </div>
          <div className="gir-ai-generation-buttons">
            <button className="button secondary compact" type="button" onClick={() => void refresh()} disabled={loading || generating}><RefreshCw size={15}/> Actualizar</button>
            {hasPermission('Recortes / GIR', 'Crear') && <button className="button primary" type="button" disabled={!canGenerate} onClick={() => setConfirmGeneration(true)} title={!canGenerate && !loading && eligibleTotal === 0 ? 'No hay recortes elegibles para generar diseños' : undefined}><Sparkles size={17}/>{generating || inProgress ? 'Generando…' : 'Generar propuestas'}</button>}
          </div>
        </div>
        {!loading && !config?.habilitado && <div className="gir-notice">El servicio de generación no está disponible.</div>}
        {config && !config.imagenesHabilitadas && <div className="gir-notice">{config.motivoImagenes || 'La generación de imágenes está desactivada.'} Los diseños podrán consultarse sin imagen.</div>}
        {config?.imagenesHabilitadas && <div className="gir-ai-footnote">Se intentará generar hasta {config.maxImagenes} {config.maxImagenes === 1 ? 'imagen conceptual' : 'imágenes conceptuales'} por generación. Las propuestas restantes podrán consultarse sin imagen.</div>}
        {config && <div className="gir-ai-footnote">Podés elegir hasta {config.maxRecortes} recortes. El servidor volverá a comprobar su disponibilidad antes de generar.</div>}
        <DataTableFilters className="gir-eligible-filters" search={eligibleSearch} onSearchChange={setEligibleSearch} searchPlaceholder="Buscar recorte o material" onClear={() => { setEligibleSearch(''); setMaterialFilter(''); setColorFilter(''); setMinLength(''); setMinWidth(''); }} clearDisabled={!eligibleSearch && !materialFilter && !colorFilter && !minLength && !minWidth}>
          <label className="data-table-filter-field"><span>Material</span><select value={materialFilter} onChange={event => setMaterialFilter(event.target.value)}><option value="">Todos</option>{materials.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="data-table-filter-field"><span>Color</span><select value={colorFilter} onChange={event => setColorFilter(event.target.value)}><option value="">Todos</option>{colors.filter(item => eligible.some(row => row.colorId === item.id)).map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label>
          <label className="data-table-filter-field"><span>Largo mínimo (mm)</span><input type="number" min="0" value={minLength} onChange={event => setMinLength(event.target.value)}/></label>
          <label className="data-table-filter-field"><span>Ancho mínimo (mm)</span><input type="number" min="0" value={minWidth} onChange={event => setMinWidth(event.target.value)}/></label>
        </DataTableFilters>
        <div className="gir-ai-generation-buttons"><button type="button" className="button secondary compact" disabled={!eligibleVisible.length} onClick={() => setSelectedIds(current => { const next = new Set(current); eligibleVisible.forEach(row => { if (next.size < (config?.maxRecortes ?? 0)) next.add(row.recorteId); }); return next; })}>Seleccionar visibles</button><button type="button" className="button secondary compact" disabled={!selectedIds.size} onClick={() => setSelectedIds(new Set())}>Limpiar selección</button></div>
        <DataTable rows={eligibleVisible} columns={eligibleColumns} rowKey={row => row.recorteId} page={eligiblePage} pageSize={pageSize} totalRecords={eligibleFiltered.length} onPageChange={setEligiblePage} loading={loading} emptyState={<div className="state-box">No hay recortes elegibles para estos filtros.</div>}/>

      </section>}
      {tab === 'historial' && <section className="gir-ai-panel" role="tabpanel">
        <div className="gir-ai-generation-header"><h2>Historial de generaciones</h2><div className="gir-ai-generation-buttons">{stalePending && hasPermission('Recortes / GIR', 'Editar') && <button className="button secondary compact" disabled={recovering} onClick={() => void recoverPending()}>{recovering ? 'Recuperando…' : 'Cerrar generaciones interrumpidas'}</button>}<button className="button secondary compact" onClick={() => void refresh()}><RefreshCw size={15}/> Actualizar</button></div></div>
        {truncated && <div className="gir-notice">La API devolvió un conjunto limitado de generaciones.</div>}
        <DataTable rows={generations.slice((generationPage - 1) * pageSize, generationPage * pageSize)} columns={generationColumns} rowKey={row => row.RecorteGeneracionId} page={generationPage} pageSize={pageSize} totalRecords={generations.length} onPageChange={setGenerationPage} loading={loading} emptyState={<div className="state-box">Todavía no hay generaciones registradas.</div>}/>
      </section>}
      {confirmGeneration && <Modal title="Generar propuestas" onClose={() => setConfirmGeneration(false)}><div className="gir-dialog"><p>Se enviarán <strong>{selectedIds.size} recortes seleccionados</strong>. Se guardará una captura de sus medidas y disponibilidad antes de consultar OpenAI. No se reservará ni consumirá stock.</p><div className="gir-actions"><button className="button secondary" onClick={() => setConfirmGeneration(false)}>Cancelar</button><button className="button primary" disabled={!canGenerate} onClick={() => void generate()}>Confirmar generación</button></div></div></Modal>}
    </main>
  </AppShell>;
}
