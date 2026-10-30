import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../../components/data/DataTable';
import { DataTableFilters } from '../../../components/data/DataTableFilters';
import { Modal } from '../../../components/data/Modal';
import { Toast } from '../../../components/ui/Toast';
import { apiErrorMessage } from '../../../services/apiClient';
import { hasPermission } from '../../../services/authorization';
import { productionOrdersApi, type ProductionDesignValidation } from '../../../services/productionOrdersApi';
import { recortesInteligentesApi, type Propuesta, type RecortesGenerationConfig } from '../../../services/recortesInteligentesApi';
import '../styles/recortes.css';

const pageSize = 10;
export function RecortesFabricacionPage() {
  const [rows, setRows] = useState<Propuesta[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [config, setConfig] = useState<RecortesGenerationConfig | null>(null);
  const [search, setSearch] = useState('');
  const [validation, setValidation] = useState<ProductionDesignValidation | null>(null);
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const [validationError, setValidationError] = useState('');
  const validationRequest = useRef(0);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const [result, settings] = await Promise.all([recortesInteligentesApi.catalogoCompleto(), recortesInteligentesApi.configuracion()]); setRows(result.items); setTruncated(result.truncated); setConfig(settings); }
    catch (cause) { setError(apiErrorMessage(cause, 'No se pudo consultar el catálogo de diseños aprobados.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => rows.filter(row =>
    `${row.Nombre} ${row.RecorteGeneracionId}`.toLocaleLowerCase('es-AR').includes(search.toLocaleLowerCase('es-AR'))), [rows, search]);
  async function inspect(id: number) {
    const request = ++validationRequest.current;
    setValidation(null); setValidationError(''); setValidating(true);
    try { const result = await productionOrdersApi.validateDesign(id); if (request === validationRequest.current) setValidation(result); }
    catch (cause) { if (request === validationRequest.current) setValidationError(apiErrorMessage(cause, 'No se pudo validar el diseño para Producción.')); }
    finally { if (request === validationRequest.current) setValidating(false); }
  }
  async function createOrder() {
    if (!validation?.puedeContinuar || creating) return;
    setCreating(true); setValidationError('');
    try {
      const result = await productionOrdersApi.createFromDesign(validation.recorteDisenoId);
      setNotice(`OP #${result.ordenProduccionId} creada en estado Pendiente.`);
      await inspect(validation.recorteDisenoId);
    } catch (cause) { setValidationError(apiErrorMessage(cause, 'No se pudo crear la OP desde este diseño.')); }
    finally { setCreating(false); }
  }
  const canCreate = hasPermission('Producción', 'Crear') && hasPermission('Recortes / GIR', 'Editar');
  const columns: DataTableColumn<Propuesta>[] = [
    { key: 'name', header: 'Diseño aprobado', render: row => <strong>{row.Nombre}</strong> },
    { key: 'version', header: 'Versión', render: row => `v${row.VersionNumero}` },
    { key: 'date', header: 'Generación', render: row => `#${row.RecorteGeneracionId}` },
    { key: 'action', header: 'Acción', render: row => <div className="gir-actions"><a className="button secondary compact" href={`/recortes/disenos/${row.RecorteDisenoId}`}>Consultar diseño</a>{config?.circuitoFabricacionHabilitado && <button className="button secondary compact" onClick={() => void inspect(row.RecorteDisenoId)}>Verificar fabricación</button>}</div> },
  ];
  return <AppShell title="Fabricación de diseños" breadcrumb="Recortes / GIR / Fabricación">
    <main className="gir-page"><Toast message={notice} onClose={() => setNotice('')}/><PageHeader title="Fabricación"/>
      <div className="gir-notice">La OP se crea Pendiente. El recorte se verifica y consume al iniciar la fabricación desde Producción.</div>
      {!loading && !config?.circuitoFabricacionHabilitado && <div className="gir-notice" role="status">La creación de OP desde un diseño GIR requiere la migración de certificación y vinculación con Producto, BOM y plantilla. Todavía no está habilitada; los diseños aprobados se pueden consultar sin modificar stock.</div>}
      <DataTableFilters search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Buscar diseño o generación" onClear={() => { setSearch(''); setPage(1); }} clearDisabled={!search}/>
      {error ? <div className="gir-error" role="alert">{error}<button className="button secondary" onClick={() => void load()}>Reintentar</button></div> : <DataTable rows={filtered.slice((page - 1) * pageSize, page * pageSize)} columns={columns} rowKey={row => row.RecorteDisenoId} page={page} pageSize={pageSize} totalRecords={filtered.length} onPageChange={setPage} loading={loading} emptyState={<div className="state-box">No hay diseños aprobados para fabricación.</div>}/>}
      {truncated && <p className="gir-notice">La consulta alcanzó el límite de carga; se muestran los registros recuperados.</p>}
      <div className="gir-actions"><a className="button secondary" href="/production/orders">Consultar órdenes de producción</a></div>
      {(validating || validation || validationError) && <Modal title="Verificación para fabricación" onClose={() => { if (creating) return; validationRequest.current += 1; setValidation(null); setValidationError(''); setValidating(false); }}>
        {validating ? <div className="state-box">Comprobando diseño…</div> : validationError ? <div className="gir-error" role="alert">{validationError}</div> : validation && <div className="gir-dialog">
          <p>Diseño #{validation.recorteDisenoId} · {validation.cantidadSugerida} unidades · {validation.recortesAsignados} recortes físicos · {validation.cantidadInsumosComplementarios} insumos complementarios.</p>
          <p>Producto: {validation.productoId ? `#${validation.productoId}` : 'Sin vincular'} · BOM: {validation.listaMaterialesId ? `#${validation.listaMaterialesId}` : 'Sin vincular'} · Plantilla: {validation.plantillaFabricacionId ? `#${validation.plantillaFabricacionId}` : 'Sin vincular'}.</p>
          {validation.recortesNoDisponibles > 0 && <p>{validation.recortesNoDisponibles} recortes ya no están disponibles.</p>}
          {validation.bloqueantes.length > 0 ? <ul>{validation.bloqueantes.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Prevalidación sin bloqueantes. Al crear la OP no se descontará stock.</p>}
          {validation.ordenProduccionId ? <a className="button secondary" href={`/production/orders/${validation.ordenProduccionId}`}>Seguir OP #{validation.ordenProduccionId}</a> : canCreate && validation.puedeContinuar && <button className="button primary" disabled={creating} onClick={() => void createOrder()}>{creating ? 'Creando OP…' : 'Crear OP pendiente'}</button>}
        </div>}
      </Modal>}
    </main>
  </AppShell>;
}
