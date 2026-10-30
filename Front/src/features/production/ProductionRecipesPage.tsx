import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Image as ImageIcon, Pencil, Plus, Power, Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { Modal } from '../../components/data/Modal';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { AppShell } from '../../components/layout/AppShell';
import { Toast } from '../../components/ui/Toast';
import { apiErrorMessage } from '../../services/apiClient';
import { hasPermission } from '../../services/authorization';
import { obtenerResumenCatalogoEcommerce, resolverUrlImagenEcommerce, type ResumenCatalogoEcommerce } from '../../services/ecommerceApi';
import { formatProductName } from '../../services/productDisplay';
import { productsApi, type Product } from '../../services/productsApi';
import { productionRecipesApi, type ExpectedCut, type MaterialDetail, type MaterialList } from '../../services/productionRecipesApi';
import { ProductionFabricationPanel } from './ProductionFabricationPanel';
import { suppliesApi, type Supply } from '../../services/suppliesApi';
import './productionRecipes.css';

const pageSize = 8;
const versionOrder = (a: MaterialList, b: MaterialList) => (Number(b.version) || 0) - (Number(a.version) || 0) || b.listaMaterialesId - a.listaMaterialesId;
const fmt = (n: number | null | undefined) => n == null ? 'Sin registrar' : `${n.toLocaleString('es-AR')} cm`;

export function ProductionRecipesPage({ productId }: { productId?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [lists, setLists] = useState<MaterialList[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [covers, setCovers] = useState<ResumenCatalogoEcommerce[]>([]);
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('todos'); const [configFilter, setConfigFilter] = useState('todos'); const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'materials' | 'versions' | 'info' | 'cuts' | 'fabrication'>('materials');
  const [confirmVersion, setConfirmVersion] = useState<{ version: MaterialList; model: string } | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerProductId, setRegisterProductId] = useState('');
  const [registerSearch, setRegisterSearch] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [details, setDetails] = useState<MaterialDetail[]>([]); const [cuts, setCuts] = useState<ExpectedCut[]>([]);
  const [loading, setLoading] = useState(true); const [sectionLoading, setSectionLoading] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const canEdit = hasPermission('Producción', 'Editar');
  const canDeactivate = hasPermission('Producción', 'Inactivar');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [p, l] = await Promise.all([productsApi.list(), productionRecipesApi.lists()]); setProducts(p); setLists(l);
      const optional = await Promise.allSettled([suppliesApi.list(), obtenerResumenCatalogoEcommerce()]);
      if (optional[0].status === 'fulfilled') setSupplies(optional[0].value); if (optional[1].status === 'fulfilled') setCovers(optional[1].value);
      if (productId) { const productLists = l.filter(item => item.productoId === productId).sort(versionOrder); setSelectedListId(current => current && productLists.some(item => item.listaMaterialesId === current) ? current : productLists.find(item => item.activa)?.listaMaterialesId ?? productLists[0]?.listaMaterialesId ?? null); }
    } catch (caught) { setError(apiErrorMessage(caught, 'No se pudieron consultar los modelos y materiales.')); }
    finally { setLoading(false); }
  }, [productId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const saved = sessionStorage.getItem('production-model-notice'); if (saved) { setNotice(saved); sessionStorage.removeItem('production-model-notice'); } }, []);

  const byProduct = useMemo(() => { const map = new Map<number, MaterialList[]>(); for (const list of lists) map.set(list.productoId, [...(map.get(list.productoId) || []), list]); for (const value of map.values()) value.sort(versionOrder); return map; }, [lists]);
  const coverByProduct = useMemo(() => new Map(covers.map(item => [item.productoId, resolverUrlImagenEcommerce(item.urlPortada)])), [covers]);
  const supplyById = useMemo(() => new Map(supplies.map(item => [item.insumoId, item])), [supplies]);
  const rows = useMemo(() => products.filter(p => { const versions = byProduct.get(p.productoId) || []; return (filter === 'todos' || (filter === 'activos' ? p.activo : !p.activo)) && (configFilter === 'todos' || (configFilter === 'configurados' ? versions.some(v => v.activa) : !versions.some(v => v.activa))) && `${p.codigo} ${formatProductName(p)}`.toLocaleLowerCase('es-AR').includes(query.trim().toLocaleLowerCase('es-AR')); }).sort((a, b) => a.codigo.localeCompare(b.codigo, 'es-AR', { numeric: true })), [products, byProduct, filter, configFilter, query]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))); const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const product = productId ? products.find(item => item.productoId === productId) : undefined; const versions = productId ? byProduct.get(productId) || [] : []; const current = versions.find(item => item.listaMaterialesId === selectedListId);

  useEffect(() => {
    if (!selectedListId) { setDetails([]); setCuts([]); return; } let live = true; setSectionLoading(true);
    Promise.all([productionRecipesApi.details(selectedListId), productionRecipesApi.expectedCuts(selectedListId)]).then(([d, c]) => { if (live) { setDetails(d); setCuts(c); } }).catch(caught => { if (live) setError(apiErrorMessage(caught, 'No se pudo consultar la versión.')); }).finally(() => { if (live) setSectionLoading(false); }); return () => { live = false; };
  }, [selectedListId]);

  async function changeState(version: MaterialList) { try { if (version.activa) await productionRecipesApi.deactivate(version.listaMaterialesId); else await productionRecipesApi.activate(version.listaMaterialesId); setNotice(version.activa ? 'Configuración inactivada.' : 'Configuración activada.'); await load(); } catch (caught) { setError(apiErrorMessage(caught, 'No se pudo cambiar el estado de la configuración.')); } }
  // Las acciones de esta grilla afectan a la configuración de materiales (BOM), no al producto.
  // No se puede editar una configuración en el lugar: el contrato vigente crea una nueva versión.
  async function deactivateFromList(item: Product) {
    const activeVersion = byProduct.get(item.productoId)?.find(version => version.activa);
    if (!activeVersion || !canDeactivate) return;
    setConfirmVersion({ version: activeVersion, model: formatProductName(item) });
  }
  const columns: DataTableColumn<Product>[] = [
    { key: 'model', header: 'Modelo', width: '36%', render: item => <div className="production-model-cell">{coverByProduct.get(item.productoId) ? <img src={coverByProduct.get(item.productoId)!} alt=""/> : <span><ImageIcon size={19}/></span>}<div><strong>{formatProductName(item)}</strong><small>{item.codigo}</small></div></div> },
    { key: 'category', header: 'Categoría', width: '18%', render: item => item.tipoProductoNombre },
    { key: 'version', header: 'Versión activa', width: '18%', render: item => byProduct.get(item.productoId)?.find(version => version.activa)?.version || '—' },
    { key: 'state', header: 'Estado', width: '16%', render: item => <StatusBadge tone={item.activo ? 'success' : 'danger'}>{item.activo ? 'Activo' : 'Inactivo'}</StatusBadge> },
    { key: 'actions', header: 'Acciones', width: '12%', render: item => {
      const activeVersion = byProduct.get(item.productoId)?.find(version => version.activa);
      return <div className="production-model-row-actions" onClick={event => event.stopPropagation()}>
        {canEdit && item.activo && activeVersion && <a href={`/production/models-materials/${item.productoId}/configurations/new?source=${activeVersion.listaMaterialesId}`} title="Editar configuración creando una nueva versión" aria-label={`Crear nueva versión de materiales de ${formatProductName(item)}`}><Pencil size={17}/></a>}
        {canDeactivate && activeVersion && <button type="button" onClick={() => void deactivateFromList(item)} title="Inactivar configuración activa" aria-label={`Inactivar configuración de ${formatProductName(item)}`}><Power size={17}/></button>}
        {!activeVersion && <span className="production-model-no-actions" title="No hay una configuración activa para editar o inactivar">—</span>}
      </div>;
    } },
  ];

  if (productId) return <AppShell title="Detalle de modelo" breadcrumb="Producción / Modelos y materiales / Detalle"><main className="production-recipes"><Toast message={notice} onClose={() => setNotice('')}/><a className="production-back-link" href="/production/models-materials"><ArrowLeft size={16}/> Volver al listado</a>
    {loading ? <div className="production-detail-state">Consultando configuración…</div> : error && !product ? <div className="production-message error"><AlertCircle size={18}/><span>{error || 'El modelo solicitado no existe.'}</span></div> : product && <>
      <section className="pr-detail-title"><div className="production-model-title">{coverByProduct.get(product.productoId) ? <img src={coverByProduct.get(product.productoId)!} alt=""/> : <span><ImageIcon size={28}/></span>}<div><small>{product.codigo}</small><h1>{formatProductName(product)}</h1></div></div><div className="production-heading-actions"><StatusBadge tone={product.activo ? 'success' : 'danger'}>{product.activo ? 'Activo' : 'Inactivo'}</StatusBadge></div></section>
      {error && <div className="production-message error"><AlertCircle size={18}/><span>{error}</span></div>}
      <nav className="production-tabs">{([['materials', 'Materiales'], ['versions', 'Versiones'], ['info', 'Información'], ['cuts', 'Recortes previstos'], ['fabrication', 'Despiece y corte']] as const).map(([key, label]) => <button type="button" key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</nav>
      {current && tab !== 'versions' && <div className="production-version-selector"><label><span>Versión consultada</span><select value={current.listaMaterialesId} onChange={event => setSelectedListId(Number(event.target.value))}>{versions.map(version => <option key={version.listaMaterialesId} value={version.listaMaterialesId}>{version.version || 'Sin versión'} · {version.nombre}{version.activa ? ' · Activa' : ''}</option>)}</select></label>{canEdit && <a className="button secondary" href={`/production/models-materials/${productId}/configurations/new?source=${current.listaMaterialesId}`}>Crear nueva versión desde ésta</a>}</div>}
      {tab === 'materials' && <section className="production-detail-section"><header><div><h2>Materiales por unidad</h2></div></header>{sectionLoading ? <div className="production-inline-empty">Consultando materiales…</div> : !current ? <div className="production-inline-empty">Este modelo no tiene configuración.</div> : <div className="pr-material-table"><div><strong>Material</strong><strong>Unidad</strong><strong>Cantidad</strong></div>{details.map(detail => { const supply = supplyById.get(detail.insumoId); return <div key={detail.detalleListaMaterialesId}><span><strong>{detail.insumoNombre}</strong><small>{detail.insumoCodigo}</small></span><span>{supply?.unidadMedidaAbreviatura || '—'}</span><b>{detail.cantidad.toLocaleString('es-AR')}</b></div>; })}</div>}</section>}
      {tab === 'versions' && <section className="production-detail-section"><header><div><h2>Historial de versiones</h2><p>Las versiones utilizadas por órdenes se preservan; los cambios se realizan creando una versión nueva.</p></div></header><div className="production-version-list">{versions.map(version => <div key={version.listaMaterialesId}><button className="production-version-main" onClick={() => { setSelectedListId(version.listaMaterialesId); setTab('materials'); }}><strong>{version.version || 'Sin versión'} · {version.nombre}</strong><small>Alta {new Date(version.fechaAlta).toLocaleDateString('es-AR')}</small></button><StatusBadge tone={version.activa ? 'success' : 'neutral'}>{version.activa ? 'Activa' : 'Inactiva'}</StatusBadge>{canEdit && <button className="button secondary compact" onClick={() => void changeState(version)}>{version.activa ? 'Inactivar' : 'Activar'}</button>}</div>)}</div></section>}
      {tab === 'info' && <section className="production-detail-section"><header><div><h2>Información del modelo</h2></div></header><div className="pr-dimensions"><div><small>Ancho</small><strong>{fmt(product.anchoCm)}</strong></div><div><small>Alto</small><strong>{fmt(product.altoCm)}</strong></div><div><small>Profundidad</small><strong>{fmt(product.profundidadCm)}</strong></div></div><p className="production-observations">{product.descripcion || 'Sin descripción registrada.'}</p></section>}
      {tab === 'cuts' && <section className="production-detail-section"><header><div><h2>Recortes previstos por unidad</h2></div></header>{sectionLoading ? <div className="production-inline-empty">Consultando previsiones…</div> : cuts.length ? <div className="production-record-list">{cuts.map(cut => <div key={cut.listaMaterialesRecortePrevistoId}><span><strong>{cut.insumoNombre}</strong><small>{cut.tipoRecorteNombre || 'Sin tipo'} · dimensión {cut.dimension ?? '—'} {cut.unidadMedidaAbreviatura}</small></span><b>{cut.cantidadPorUnidad.toLocaleString('es-AR')} {cut.unidadMedidaAbreviatura}</b></div>)}</div> : <div className="production-inline-empty">Esta versión no prevé recortes recuperables.</div>}</section>}
      {tab === 'fabrication' && <ProductionFabricationPanel productId={product.productoId}/>}
    </>}
  </main></AppShell>;

  return <AppShell title="Modelos y materiales" breadcrumb="Producción / Modelos y materiales"><main className="production-recipes"><PageHeader title="Modelos y materiales"/>{canEdit && <div className="production-register-action"><button type="button" className="button primary" onClick={() => { setRegisterProductId(''); setRegisterSearch(''); setShowRegister(true); }}><Plus size={16}/> Registrar configuración de fabricación</button></div>}<section className="pr-toolbar"><label><Search size={16}/><input placeholder="Buscar por nombre o código" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></label><select value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }}><option value="todos">Todos los estados</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select><select value={configFilter} onChange={event => { setConfigFilter(event.target.value); setPage(1); }}><option value="todos">Todas las configuraciones</option><option value="configurados">Con configuración activa</option><option value="sin-configurar">Sin configuración activa</option></select>{(query || filter !== 'todos' || configFilter !== 'todos') && <button className="button secondary" onClick={() => { setQuery(''); setFilter('todos'); setConfigFilter('todos'); setPage(1); }}>Limpiar filtros</button>}</section>{error && <div className="production-message error"><AlertCircle size={18}/><span>{error}</span></div>}<DataTable rows={visible} columns={columns} rowKey={item => item.productoId} loading={loading} page={currentPage} pageSize={pageSize} totalRecords={rows.length} onPageChange={setPage} onRowClick={item => { location.href = `/production/models-materials/${item.productoId}`; }} emptyState={<div className="state-box">No hay modelos para los filtros seleccionados.</div>}/>{confirmVersion && <Modal title="Inactivar configuración" onClose={() => setConfirmVersion(null)}><div className="production-confirm-body"><p>¿Querés inactivar la configuración <strong>{confirmVersion.version.version || confirmVersion.version.nombre}</strong> de <strong>{confirmVersion.model}</strong>?</p><p>El producto permanecerá activo. La configuración dejará de estar disponible para nuevas operaciones, según las reglas de la API.</p><div className="production-confirm-actions"><button type="button" className="button secondary" onClick={() => setConfirmVersion(null)}>Cancelar</button><button type="button" className="button primary" onClick={() => { const selected = confirmVersion.version; setConfirmVersion(null); void changeState(selected); }}>Inactivar configuración</button></div></div></Modal>}{showRegister && <Modal title="Registrar configuración de fabricación" onClose={() => setShowRegister(false)}><div className="production-confirm-body"><div className="production-register-field"><label htmlFor="production-model-search">Buscar producto por nombre o código</label><div className="production-register-search"><Search size={17}/><input id="production-model-search" autoComplete="off" value={registerSearch} onChange={event => { setRegisterSearch(event.target.value); setRegisterProductId(''); }} placeholder="Escribí para buscar un producto…"/></div>{!registerProductId && <div className="production-register-results" role="listbox" aria-label="Productos encontrados">{products.filter(item => item.activo && (!registerSearch.trim() || `${item.codigo} ${formatProductName(item)} ${item.colorNombre || ''}`.toLocaleLowerCase('es-AR').includes(registerSearch.trim().toLocaleLowerCase('es-AR')))).sort((a,b) => formatProductName(a).localeCompare(formatProductName(b),'es-AR')).slice(0, 30).map(item => <button key={item.productoId} type="button" role="option" aria-selected={registerProductId === String(item.productoId)} className={`production-register-option ${registerProductId === String(item.productoId) ? 'selected' : ''}`} onClick={() => { setRegisterProductId(String(item.productoId)); setRegisterSearch(`${item.codigo} · ${formatProductName(item)}`); }}><span><strong>{formatProductName(item)}</strong><small>{item.codigo}{item.colorNombre ? ` · ${item.colorNombre}` : ''}</small></span>{registerProductId === String(item.productoId) && <Check size={17}/>}</button>)}{!products.some(item => item.activo && `${item.codigo} ${formatProductName(item)} ${item.colorNombre || ''}`.toLocaleLowerCase('es-AR').includes(registerSearch.trim().toLocaleLowerCase('es-AR'))) && <div className="production-register-empty">No se encontraron productos activos.</div>}</div>}{registerProductId && <div className="production-register-selected"><Check size={16}/> Producto seleccionado <button type="button" onClick={() => { setRegisterProductId(''); setRegisterSearch(''); }}>Cambiar</button></div>}</div><div className="production-confirm-actions"><button type="button" className="button secondary" onClick={() => setShowRegister(false)}>Cancelar</button><button type="button" className="button primary" disabled={!registerProductId} onClick={() => { if (registerProductId) location.href = `/production/models-materials/${registerProductId}/configurations/new`; }}>Continuar</button></div></div></Modal>}</main></AppShell>;
}

