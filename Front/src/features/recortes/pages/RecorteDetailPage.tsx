import { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Layers3, Ruler, Warehouse, History, ArrowLeftRight, Settings2 } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { Modal } from '../../../components/data/Modal';
import { StatusBadge } from '../../../components/data/StatusBadge';
import { Toast } from '../../../components/ui/Toast';
import { apiErrorMessage } from '../../../services/apiClient';
import { hasPermission } from '../../../services/authorization';
import { recortesApi, type HistorialRecorte, type MovimientoRecorte, type RecorteDetalle } from '../../../services/recortesApi';
import type { Lookup } from '../../../services/suppliesApi';
import { recorteCodigo, recorteDate, recorteEstadoOperativo, recorteMedidas, recorteMovementTone, recorteNumber } from '../utils/recortePresentation';
import '../../inventory/styles/products.css';
import '../../inventory/styles/supplies.css';
import '../styles/recortes.css';

export function RecorteDetailPage({ recorteId }: { recorteId: number }) {
  const [record, setRecord] = useState<RecorteDetalle | null>(null);
  const [states, setStates] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { const saved = sessionStorage.getItem('gir-recorte-notice'); if (saved) { setNotice(saved); sessionStorage.removeItem('gir-recorte-notice'); } }, []);
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [stateId, setStateId] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [movementPage, setMovementPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const backHref = `/recortes/inventario${location.search}`;
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [detail, stateList] = await Promise.all([
        recortesApi.detail(recorteId), recortesApi.states(),
      ]);
      setRecord(detail); setStates(stateList);
    } catch (cause) { setError(apiErrorMessage(cause, 'No se pudo consultar el recorte.')); }
    finally { setLoading(false); }
  }, [recorteId]);
  useEffect(() => { void load(); }, [load]);
  const canEdit = hasPermission('Recortes / GIR', 'Editar');
  const destinations = states.filter(item => item.id !== record?.estadoRecorteId && recorteEstadoOperativo(item.descripcion));
  const canChangeState = !!record && record.estadoRecorteNombre.toLocaleLowerCase('es-AR') !== 'utilizado';
  const movementColumns: DataTableColumn<MovimientoRecorte>[] = [
    { key: 'date', header: 'Fecha', render: row => recorteDate(row.fechaMovimiento) },
    { key: 'type', header: 'Tipo', render: row => <StatusBadge tone={recorteMovementTone(row.tipoMovimiento)}>{row.tipoMovimiento}</StatusBadge> },
    { key: 'deposit', header: 'Depósito', render: row => row.depositoNombre },
    { key: 'amount', header: 'Cantidad', render: row => `${recorteNumber.format(row.cantidad)} ${record?.unidadMedidaAbreviatura ?? ''}` },
    { key: 'note', header: 'Observaciones', render: row => row.observaciones || '—' },
  ];
  const historyColumns: DataTableColumn<HistorialRecorte>[] = [
    { key: 'date', header: 'Fecha', render: row => recorteDate(row.fechaCambio) },
    { key: 'state', header: 'Estado', render: row => row.estadoRecorteNombre },
    { key: 'note', header: 'Motivo / observaciones', render: row => row.observaciones || '—' },
  ];
  function openStateModal() {
    setStateModalOpen(true);
    setActionError('');
    setReason('');
    setStateId('');
  }
  async function submitState() {
    if (!record || busy) return;
    if (!destinations.some(item => item.id === Number(stateId))) {
      setActionError('Seleccioná un estado destino válido.');
      return;
    }
    if (!reason.trim()) {
      setActionError('Ingresá el motivo del cambio de estado.');
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      await recortesApi.changeState(recorteId, Number(stateId), reason.trim());
      setStateModalOpen(false);
      setNotice('Estado actualizado correctamente.');
      await load();
    } catch (cause) {
      setActionError(apiErrorMessage(cause, 'No se pudo actualizar el estado.'));
    } finally {
      setBusy(false);
    }
  }
  return <AppShell title="Consultar recorte" breadcrumb="Recortes / GIR / Inventario de recortes / Consultar recorte" backHref={backHref} backLabel="Volver a Inventario de recortes">
    <main className="gir-page gir-detail-page">
      <Toast message={notice} onClose={() => setNotice('')}/>
      <PageHeader title="Consultar recorte" action={record && canEdit && canChangeState && destinations.length > 0
        ? <button className="button primary" onClick={openStateModal}>Cambiar estado</button>
        : undefined}/>
      {loading ? <div className="state-box">Cargando recorte…</div> : error || !record
        ? <div className="gir-error" role="alert">{error || 'No se encontró el recorte.'}<button className="button secondary" onClick={() => void load()}><RotateCcw size={16}/>Reintentar</button></div>
        : <>
          <div className="gir-detail-layout supply-form-layout">
            <div className="gir-detail-main product-form-main">
              <section className="gir-detail-card product-form-section">
                <h2 className="gir-detail-heading"><Layers3 size={19}/> Información principal</h2>
                <div className="gir-detail-fields product-form-grid">
                  <div className="gir-detail-field product-field"><span>Código</span><strong>{recorteCodigo(record.recorteId)}</strong></div>
                  <div className="gir-detail-field"><span>Insumo</span><strong>{record.insumoCodigo} · {record.insumoNombre}</strong></div>
                  <div className="gir-detail-field"><span>Tipo de recorte</span><strong>{record.tipoRecorteNombre ?? 'Sin tipo'}</strong></div>
                  <div className="gir-detail-field"><span>Color</span><strong>{record.colorNombre ?? 'Sin identificar'}</strong></div>
                </div>
                {record.observaciones && <div className="gir-detail-observation"><span>Observaciones</span><p>{record.observaciones}</p></div>}
              </section>
              <section className="gir-detail-card product-form-section">
                <h2 className="gir-detail-heading"><Ruler size={19}/> Características físicas</h2>
                <div className="gir-detail-fields product-form-grid">
                  <div className="gir-detail-field"><span>Medidas</span><strong>{recorteMedidas(record)}</strong></div>
                  <div className="gir-detail-field"><span>Orientación de veta</span><strong>{record.orientacionVeta ?? 'Sin registrar'}</strong></div>
                  <div className="gir-detail-field"><span>Calidad geométrica</span><strong>{record.calidadGeometrica}</strong></div>
                  <div className="gir-detail-field"><span>Cantidad registrada</span><strong>{recorteNumber.format(record.cantidad)} {record.unidadMedidaAbreviatura}</strong></div>
                </div>
              </section>
              <section className="gir-detail-card product-form-section">
                <h2 className="gir-detail-heading"><ArrowLeftRight size={19}/> Movimientos del recorte</h2>
                <DataTable rows={record.movimientos.slice((movementPage - 1) * 10, movementPage * 10)} columns={movementColumns}
                  rowKey={row => row.movimientoRecorteId} page={movementPage} pageSize={10}
                  totalRecords={record.movimientos.length} onPageChange={setMovementPage}
                  emptyState={<div className="state-box">Este recorte aún no tiene movimientos.</div>}/>
              </section>
            </div>
            <aside className="gir-detail-aside product-form-side">
              <section className="gir-detail-card product-form-section">
                <h2 className="gir-detail-heading"><Settings2 size={19}/> Estado</h2>
                <div className="gir-detail-state"><span>Estado actual</span><StatusBadge tone={record.estadoRecorteNombre === 'Disponible' ? 'success' : 'warning'}>{record.estadoRecorteNombre}</StatusBadge></div>
              </section>
              <section className="gir-detail-card product-form-section">
                <h2 className="gir-detail-heading"><Warehouse size={19}/> Existencias por depósito</h2>
                {record.stocks.length ? <div className="gir-detail-stock-list">{record.stocks.map(row =>
                  <div key={row.stockRecorteId}><span>{row.depositoNombre}</span><strong>{recorteNumber.format(row.cantidadActual)} {row.unidadMedidaAbreviatura}</strong></div>
                )}</div> : <p className="gir-detail-empty">No hay existencias registradas.</p>}
              </section>
              <section className="gir-detail-card product-form-section">
                <h2 className="gir-detail-heading"><History size={19}/> Origen y trazabilidad</h2>
                <div className="gir-detail-field"><span>Orden de producción</span><strong>{record.ordenProduccionId ? <a href={`/production/orders/${record.ordenProduccionId}`}>OP #{record.ordenProduccionId}</a> : 'Sin OP asociada'}</strong></div>
                <div className="gir-detail-field"><span>Fecha de alta</span><strong>{recorteDate(record.fechaAlta)}</strong></div>
              </section>
            </aside>
          </div>
          <section className="gir-detail-card">
            <h2 className="gir-detail-heading"><History size={19}/> Historial de estados</h2>
            <DataTable rows={record.historialEstados.slice((historyPage - 1) * 10, historyPage * 10)} columns={historyColumns}
              rowKey={row => row.historialEstadoRecorteId} page={historyPage} pageSize={10}
              totalRecords={record.historialEstados.length} onPageChange={setHistoryPage}
              emptyState={<div className="state-box">No hay cambios de estado registrados.</div>}/>
          </section>
        </>}
      {stateModalOpen && <Modal title="Cambiar estado del recorte" onClose={() => { if (!busy) setStateModalOpen(false); }}>
        <div className="gir-state-modal">
          <div className="gir-state-modal-context">
            <span>Recorte</span><strong>{record ? recorteCodigo(record.recorteId) : '—'}</strong>
            <span>Estado actual</span><strong>{record?.estadoRecorteNombre ?? '—'}</strong>
          </div>
          <label className="gir-state-modal-field"><span>Nuevo estado <b>*</b></span>
            <select value={stateId} disabled={busy} onChange={event => { setStateId(event.target.value); setActionError(''); }}>
              <option value="">Seleccioná un estado</option>
              {destinations.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}
            </select>
          </label>
          <label className="gir-state-modal-field"><span>Motivo del cambio <b>*</b></span>
            <textarea rows={3} maxLength={250} placeholder="Explicá por qué se modifica el estado…" disabled={busy}
              value={reason} onChange={event => { setReason(event.target.value); setActionError(''); }}/>
            <small>{reason.length}/250 caracteres</small>
          </label>
          {actionError && <div className="gir-state-modal-error" role="alert">{actionError}</div>}
          <div className="gir-state-modal-footer">
            <button className="button secondary" disabled={busy} onClick={() => setStateModalOpen(false)}>Cancelar</button>
            <button className="button primary" disabled={busy || !stateId || !reason.trim()} onClick={() => void submitState()}>{busy ? 'Guardando…' : 'Confirmar cambio'}</button>
          </div>
        </div>
      </Modal>}
    </main>
  </AppShell>;
}
