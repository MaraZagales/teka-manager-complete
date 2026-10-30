import { EcommerceImage } from './EcommerceImage';
import { useEffect, useMemo, useState } from 'react';
import { Download, Search, FileText, RotateCcw } from 'lucide-react';
import { EcommerceProductEditor } from './EcommerceProductEditor';
import { exportCatalogExcel, exportCatalogPdf, type CatalogReportRow } from '../../services/ecommerceReports';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable } from '../../components/data/DataTable';
import { PageHeader } from '../../components/data/PageHeader';
import { obtenerCatalogoEcommerce, obtenerDisponibilidadOnline, obtenerResumenCatalogoEcommerce, type DisponibilidadOnline, type ResumenCatalogoEcommerce, type ProductoEcommerce, type PrecioEcommerce, type StockEcommerce } from '../../services/ecommerceApi';
import './ecommerce.css';

type Fila = ProductoEcommerce & { stock: number; precio: number | null; depositos: string; estado: string; cupoOnline: number | null | undefined };
const moneda = (valor: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
const hoy = () => new Date();

export function EcommercePage() {
  const [productos, setProductos] = useState<ProductoEcommerce[]>([]);
  const [stock, setStock] = useState<StockEcommerce[]>([]);
  const [precios, setPrecios] = useState<PrecioEcommerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<Record<number, ResumenCatalogoEcommerce>>({});
  const [disponibilidad, setDisponibilidad] = useState<Record<number, DisponibilidadOnline>>({});
  const [cupoError, setCupoError] = useState('');
  const [cuposReady, setCuposReady] = useState(false);
  const [filtroPublicacion, setFiltroPublicacion] = useState('todos');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [deposito, setDeposito] = useState('todos');
  const [productoEditando, setProductoEditando] = useState<ProductoEcommerce | null>(null);

  async function cargar() {
    setLoading(true); setError('');
    try {
      const [datos, resumenes, cupos] = await Promise.all([obtenerCatalogoEcommerce(), obtenerResumenCatalogoEcommerce(), obtenerDisponibilidadOnline().catch(() => null)]);
      setProductos(datos.productos); setStock(datos.stock); setPrecios(datos.precios);
      setResumen(Object.fromEntries(resumenes.map(r => [r.productoId, r])));
      setDisponibilidad(Object.fromEntries((cupos || []).map(item => [item.productoId, item])));
      setCuposReady(Boolean(cupos));
      setCupoError(cupos ? '' : 'No se pudo consultar el resumen de cupos por una dependencia obsoleta de la API. Podés abrir cada ficha para consultar o editar su configuración real.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo consultar el catálogo.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void cargar(); }, []);

  const depositos = useMemo(() => [...new Map(stock.map(s => [s.depositoId, s.depositoNombre])).entries()], [stock]);
  const filas = useMemo<Fila[]>(() => productos.filter(p => p.activo).map(p => {
    const existencias = stock.filter(s => s.productoId === p.productoId && (deposito === 'todos' || String(s.depositoId) === deposito));
    const cantidad = existencias.reduce((total, s) => total + s.cantidadActual, 0);
    const ahora = hoy().getTime();
    const vigentes = precios.filter(v => v.productoId === p.productoId && v.activo && new Date(v.fechaVigenciaDesde).getTime() <= ahora && (!v.fechaVigenciaHasta || new Date(v.fechaVigenciaHasta).getTime() >= ahora));
    vigentes.sort((a, b) => new Date(b.fechaVigenciaDesde).getTime() - new Date(a.fechaVigenciaDesde).getTime());
    const precio = vigentes[0]?.precio ?? null;
    const estado = precio === null ? 'Sin precio vigente' : cantidad <= 0 ? 'Sin existencias' : 'Con datos completos';
    const online = disponibilidad[p.productoId];
    return { ...p, stock: cantidad, precio, depositos: existencias.map(s => s.depositoNombre).join(', ') || '—', estado, cupoOnline: online?.cupoOnline ?? (cuposReady ? null : undefined) };
  }), [productos, stock, precios, deposito, disponibilidad, cuposReady]);
  async function actualizarFicha() {
    try {
      const [resumenes, cupos] = await Promise.all([obtenerResumenCatalogoEcommerce(), obtenerDisponibilidadOnline().catch(() => null)]);
      setResumen(Object.fromEntries(resumenes.map(r => [r.productoId, r])));
      setDisponibilidad(Object.fromEntries((cupos || []).map(item => [item.productoId, item])));
      setCuposReady(Boolean(cupos));
      setCupoError(cupos ? '' : 'No se pudo actualizar el resumen de cupos por una dependencia pendiente en la API.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo actualizar el catálogo.'); }
  }
  const visibles = useMemo(() => filas.filter(p => {
    const texto = `${p.codigo} ${p.nombre} ${p.tipoProductoNombre}`.toLocaleLowerCase('es-AR');
    return texto.includes(busqueda.toLocaleLowerCase('es-AR').trim()) && (filtroPublicacion === 'todos' || (filtroPublicacion === 'publicados' ? resumen[p.productoId]?.publicado === true : filtroPublicacion === 'ocultos' ? resumen[p.productoId]?.configurado === true && resumen[p.productoId]?.publicado === false : resumen[p.productoId]?.configurado === false)) && (filtro === 'todos' || filtro === 'activos' || (filtro === 'sin-precio' ? p.precio === null : filtro === 'sin-stock' ? p.stock <= 0 : false));
  }), [filas, busqueda, filtro, filtroPublicacion, resumen]);
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / 10));
  const paginaActual = Math.min(pagina, totalPaginas);

  useEffect(() => {
    const requestedId = Number(new URLSearchParams(location.search).get('productoId'));
    if (!requestedId || productoEditando || !productos.length) return;
    const requested = productos.find(item => item.productoId === requestedId);
    if (requested) setProductoEditando(requested);
  }, [productos, productoEditando]);

  const reportRows = useMemo<CatalogReportRow[]>(() => visibles.map(p => {
    const publicacion = resumen[p.productoId];
    return {
      codigo: p.codigo, producto: p.nombre, tipo: p.tipoProductoNombre,
      color: p.colorNombre || '',
      publicacion: !publicacion ? 'Sin consultar' : !publicacion.configurado ? 'Sin configurar' : publicacion.publicado ? 'Publicado' : 'Oculto',
      precio: p.precio, stock: p.stock, cupoOnline: p.cupoOnline, depositos: p.depositos,
      diagnostico: p.estado, portada: publicacion?.urlPortada || '',
    };
  }), [visibles, resumen]);
  const reportFilters = {
    busqueda: busqueda.trim(),
    estado: ({ todos: 'Todos', activos: 'Activos', 'sin-precio': 'Sin precio vigente', 'sin-stock': 'Sin existencias' } as Record<string, string>)[filtro] || filtro,
    publicacion: ({ todos: 'Todas', publicados: 'Publicados', ocultos: 'Ocultos', 'sin-configurar': 'Sin configurar' } as Record<string, string>)[filtroPublicacion] || filtroPublicacion,
    deposito: deposito === 'todos' ? 'Todos' : depositos.find(([id]) => String(id) === deposito)?.[1] || deposito,
  };
  const filtersActive = Boolean(busqueda || filtro !== 'todos' || filtroPublicacion !== 'todos' || deposito !== 'todos');
  function limpiarFiltros() {
    setBusqueda(''); setFiltro('todos'); setFiltroPublicacion('todos'); setDeposito('todos'); setPagina(1);
  }
  function exportar() { exportCatalogExcel(reportRows, reportFilters); }
  function generarReporte() { exportCatalogPdf(reportRows, reportFilters); }
  return <AppShell title="E-commerce" breadcrumb="E-commerce / Catálogo">
    <div className="ec-page">
      <PageHeader kicker="E-COMMERCE" title="Catálogo" description="Administrá la publicación, presentación y cupo online de los productos reales del sistema." action={<div className="ec-report-actions"><button className="button secondary" onClick={exportar} disabled={loading || Boolean(error) || !visibles.length}><Download size={16}/> Exportar Excel</button><button className="button primary" onClick={generarReporte} disabled={loading || Boolean(error) || !visibles.length}><FileText size={16}/> Generar reporte</button></div>} />
      <div className={`ec-master-detail ${productoEditando ? 'with-detail' : ''}`}><section className="ec-section"><div className="ec-section-header"><div><h2>Productos</h2></div><span>{visibles.length} resultados</span></div><div className="ec-filters"><label className="ec-search"><Search size={17}/><input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} placeholder="Buscar por código, nombre o tipo…" aria-label="Buscar productos" /></label><select value={filtro} onChange={e => { setFiltro(e.target.value); setPagina(1); }} aria-label="Filtrar productos"><option value="todos">Todos los estados</option><option value="activos">Activos</option><option value="sin-precio">Sin precio vigente</option><option value="sin-stock">Sin existencias</option></select><select value={filtroPublicacion} onChange={e => { setFiltroPublicacion(e.target.value); setPagina(1); }} aria-label="Filtrar publicación"><option value="todos">Todas las publicaciones</option><option value="publicados">Publicados</option><option value="ocultos">Ocultos</option><option value="sin-configurar">Sin configurar</option></select><select value={deposito} onChange={e => { setDeposito(e.target.value); setPagina(1); }} aria-label="Seleccionar depósito"><option value="todos">Todos los depósitos</option>{depositos.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select>{filtersActive && <button type="button" className="ec-clear-filters" onClick={limpiarFiltros}><RotateCcw size={15}/> Limpiar</button>}</div>
      {error && <div className="ec-error" role="alert">{error} <button onClick={() => void cargar()}>Reintentar</button></div>}
      {cupoError && <div className="ec-error" role="status">{cupoError}</div>}
      {!loading && !error && <div className="ec-catalog-summary" aria-label="Resumen del catálogo filtrado"><strong>{visibles.length}</strong> productos · <strong>{reportRows.filter(r => r.publicacion === 'Publicado').length}</strong> publicados · <strong>{reportRows.filter(r => r.publicacion === 'Oculto').length}</strong> ocultos · <strong>{reportRows.filter(r => r.publicacion === 'Sin configurar').length}</strong> sin configurar <span>Resumen calculado con los filtros aplicados.</span></div>}
      <DataTable<Fila>
        rows={error ? [] : visibles.slice((paginaActual - 1) * 10, paginaActual * 10)}
        columns={[
          { key: 'producto', header: 'Producto', render: p => <div className="ec-product-with-image">
            {resumen[p.productoId]?.urlPortada ? <EcommerceImage className="ec-product-thumb" url={resumen[p.productoId].urlPortada} alt={p.nombre} /> : <span className="ec-product-thumb ec-product-no-photo">Sin foto</span>}
            <div className="ec-product"><strong>{p.nombre}</strong><small>{p.codigo} · {p.tipoProductoNombre}{p.colorNombre ? ` · ${p.colorNombre}` : ''}</small></div>
          </div> },
          { key: 'publicacion', header: 'Publicación', render: p => <span className={`ec-status ${resumen[p.productoId]?.publicado ? 'ok' : 'warn'}`}>{!resumen[p.productoId] ? 'Sin consultar' : !resumen[p.productoId].configurado ? 'Sin configurar' : resumen[p.productoId].publicado ? 'Publicado' : 'Oculto'}</span> },
          { key: 'precio', header: 'Precio', render: p => p.precio === null ? '—' : moneda(p.precio) },
          { key: 'stock', header: 'Stock físico', render: p => new Intl.NumberFormat('es-AR', {maximumFractionDigits:2}).format(p.stock) },
          { key: 'cupo', header: 'Cupo online', render: p => p.cupoOnline === undefined ? 'No disponible' : p.cupoOnline === null ? 'Sin configurar' : new Intl.NumberFormat('es-AR', {maximumFractionDigits:2}).format(p.cupoOnline) },
          { key: 'detalle', header: 'Detalle', render: () => <span aria-hidden="true">›</span> },
        ]}
        rowKey={p => p.productoId}
        onRowClick={p => setProductoEditando(p)}
        selectedRowKey={productoEditando?.productoId ?? null}
        loading={loading}
        emptyState={<div className="state-box">{error ? 'No se pudieron recuperar los productos. Reintentá la consulta.' : 'No hay productos activos para los filtros seleccionados.'}</div>}
        page={paginaActual} totalRecords={visibles.length} onPageChange={setPagina}
      />
      </section>
      {productoEditando && <EcommerceProductEditor key={productoEditando.productoId} producto={productoEditando} stock={stock} onClose={() => setProductoEditando(null)} onSaved={() => void actualizarFicha()} />}
      </div>
    </div>
  </AppShell>;
}
