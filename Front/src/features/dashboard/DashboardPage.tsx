import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Boxes, ClipboardList, Factory, PackageSearch, RefreshCw, Settings, ShieldCheck, ShoppingCart, TrendingUp, UsersRound } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { hasPermission } from '../../services/authorization';
import { getSession } from '../../services/session';
import { usersApi } from '../../services/usersApi';
import { rolesApi } from '../../services/rolesApi';
import { auditApi } from '../../services/auditApi';
import { salesOrdersApi } from '../../services/salesOrdersApi';
import { obtenerFunnelOportunidades, obtenerIntereses, obtenerResumenOportunidades } from '../../services/commercialApi';
import { listarActividades, listarPresupuestos } from '../../services/commercialOperationsApi';
import { productionOrdersApi } from '../../services/productionOrdersApi';
import { inventoryStockApi } from '../../services/inventoryStockApi';
import { recortesApi } from '../../services/recortesApi';
import { apiErrorMessage } from '../../services/apiClient';
import { dashboardTitle, normalizeDashboardText, primaryDashboardProfile, profilesForRoles, scopeLabel, widgetDefinitions, type DashboardData, type DashboardProfile } from './dashboardConfig';
import './dashboard.css';

const emptyData = (): DashboardData => ({ users: [], roles: [], auditEvents: [], orders: [], documents: [], accountMovements: [], interests: [], opportunitySummary: null, opportunityFunnel: [], budgets: [], activities: [], production: [], supplies: [], cuts: [] });
const isoLocal = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = new Date();
const todayIso = isoLocal(today);
const initialRange = { from: isoLocal(new Date(today.getFullYear(), today.getMonth(), 1)), to: todayIso };
const agendaFrom = isoLocal(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30));
const agendaTo = isoLocal(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14));
const number = new Intl.NumberFormat('es-AR');
const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const shortDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('es-AR') : 'Sin fecha';
const person = (first?: string | null, last?: string | null) => [first, last].filter(Boolean).join(' ') || 'Sin cliente';
const isPendingActivity = (state: string) => !/realizad|finaliz|cancel/i.test(normalizeDashboardText(state));
const isProductionActive = (state: string) => /pendiente|proceso/i.test(normalizeDashboardText(state));
const isOrderToFulfill = (state: string) => /confirmado|en produccion|listo para entrega/i.test(normalizeDashboardText(state));
const isVoidedDocument = (state: string) => /anulad|cancelad|rechaz/i.test(normalizeDashboardText(state));
const isCreditDocument = (type: string) => /nota\s+de\s+credito|\bcredito\b/i.test(normalizeDashboardText(type));
const documentNet = (item: DashboardData['documents'][number]) => isCreditDocument(item.tipoComprobanteNombre) ? -item.importeTotal : item.importeTotal;

type OrderProductSummary = { productoId: number; nombre: string; cantidad: number };

export function DashboardPage() {
  const session = getSession();
  const roleNames = session?.roles?.map(role => role.rolNombre) || [];
  const profiles = useMemo(() => profilesForRoles(roleNames), [roleNames.join('|')]);
  const profile = primaryDashboardProfile(profiles);
  const [draftRange, setDraftRange] = useState(initialRange);
  const [range, setRange] = useState(initialRange);
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [reload, setReload] = useState(0);
  const [orderProducts, setOrderProducts] = useState<Record<number, OrderProductSummary[]>>({});

  useEffect(() => {
    let live = true;
    setLoading(true);
    setErrors([]);
    setOrderProducts({});
    const next = emptyData();
    const tasks: Array<Promise<void>> = [];
    const load = <K extends keyof DashboardData>(key: K, request: () => Promise<DashboardData[K]>, label: string) => {
      tasks.push(request().then(value => { next[key] = value; }).catch(error => {
        if (live) setErrors(current => [...current, apiErrorMessage(error, `No se pudo consultar ${label}.`)]);
      }));
    };

    if (profile === 'admin') {
      if (hasPermission('Usuarios', 'Ver')) load('users', usersApi.list, 'usuarios');
      if (hasPermission('Roles y accesos', 'Ver')) load('roles', rolesApi.list, 'roles');
      if (hasPermission('Auditoría', 'Ver')) load('auditEvents', auditApi.events, 'eventos de auditoría');
    }
    if (profile === 'management') {
      if (hasPermission('Ventas', 'Ver')) { load('orders', salesOrdersApi.list, 'pedidos'); load('documents', salesOrdersApi.documents, 'comprobantes'); }
      if (hasPermission('Cobros', 'Ver')) load('accountMovements', salesOrdersApi.accountMovements, 'cuentas corrientes');
      if (hasPermission('Producción', 'Ver')) load('production', productionOrdersApi.list, 'producción');
      if (hasPermission('Inventario', 'Ver')) load('supplies', inventoryStockApi.supplies, 'stock de insumos');
    }
    if (profile === 'commercial') {
      if (hasPermission('Comercial', 'Ver')) {
        load('interests', obtenerIntereses, 'consultas comerciales');
        load('opportunitySummary', obtenerResumenOportunidades, 'resumen de oportunidades');
        load('opportunityFunnel', obtenerFunnelOportunidades, 'embudo comercial');
        load('budgets', listarPresupuestos, 'presupuestos');
        load('activities', () => listarActividades(agendaFrom, agendaTo), 'agenda comercial');
      }
      if (hasPermission('Ventas', 'Ver')) load('orders', salesOrdersApi.list, 'pedidos');
    }
    if (profile === 'workshop-manager' || profile === 'workshop-operator') {
      if (hasPermission('Producción', 'Ver')) load('production', productionOrdersApi.list, 'órdenes de producción');
      if (hasPermission('Inventario', 'Ver')) load('supplies', inventoryStockApi.supplies, 'stock de insumos');
      if (profile === 'workshop-manager' && hasPermission('Recortes / GIR', 'Ver')) load('cuts', recortesApi.stock, 'recortes');
    }

    Promise.allSettled(tasks).then(() => { if (live) { setData(next); setLoading(false); } });
    return () => { live = false; };
  }, [profile, reload]);

  const widgets = useMemo(() => widgetDefinitions
    .map(widget => ({ widget, score: profile ? widget.profiles[profile] || 0 : 0 }))
    .filter(({ widget, score }) => score > 0 && hasPermission(widget.menu, widget.permission))
    .sort((a, b) => b.score - a.score).slice(0, 4), [profile]);
  const showsPeriod = widgets.some(({ widget }) => widget.scope === 'period');
  const activeProduction = useMemo(() => data.production.filter(item => isProductionActive(item.estadoOrdenProduccionNombre)).sort((a, b) => {
    const priority = Number(/proceso/i.test(normalizeDashboardText(b.estadoOrdenProduccionNombre))) - Number(/proceso/i.test(normalizeDashboardText(a.estadoOrdenProduccionNombre)));
    return priority || a.fechaCreacion.localeCompare(b.fechaCreacion);
  }).slice(0, 6), [data.production]);

  useEffect(() => {
    if (profile !== 'workshop-operator' || loading || !hasPermission('Producción', 'Ver') || activeProduction.length === 0) return;
    let live = true;
    void Promise.allSettled(activeProduction.map(async order => {
      const detail = await productionOrdersApi.getById(order.ordenProduccionId);
      return [order.ordenProduccionId, detail.productos.map(product => ({ productoId: product.productoId, nombre: product.productoNombre, cantidad: product.cantidadPlanificada }))] as const;
    })).then(results => {
      if (!live) return;
      const summaries: Record<number, OrderProductSummary[]> = {};
      results.forEach(result => { if (result.status === 'fulfilled') summaries[result.value[0]] = result.value[1]; });
      setOrderProducts(summaries);
    });
    return () => { live = false; };
  }, [profile, loading, activeProduction.map(item => item.ordenProduccionId).join(',')]);

  const criticalSupplies = data.supplies.filter(item => item.esStockCritico).sort((a, b) => a.cantidadActual - b.cantidadActual).slice(0, 5);
  const productionGroups = Object.entries(data.production.reduce<Record<string, number>>((groups, item) => { groups[item.estadoOrdenProduccionNombre] = (groups[item.estadoOrdenProduccionNombre] || 0) + 1; return groups; }, {}));
  const opportunityGroups = [...data.opportunityFunnel].sort((a, b) => a.orden - b.orden);
  const maxOpportunity = Math.max(1, ...opportunityGroups.map(item => item.cantidad));
  const blockedUsers = data.users.filter(item => item.bloqueado).slice(0, 5);
  const recentAudit = data.auditEvents.filter(item => item.fechaEvento.slice(0, 10) >= range.from && item.fechaEvento.slice(0, 10) <= range.to).sort((a, b) => b.fechaEvento.localeCompare(a.fechaEvento)).slice(0, 6);
  const managementOrders = data.orders.filter(item => isOrderToFulfill(item.estadoPedidoNombre)).sort((a, b) => a.fechaPedido.localeCompare(b.fechaPedido)).slice(0, 5);
  const attentionActivities = data.activities.filter(item => isPendingActivity(item.estado) && item.fechaProgramada.slice(0, 10) <= agendaTo).sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
  const attentionInterests = data.interests.filter(item => /^(pendiente|en atencion)$/.test(normalizeDashboardText(item.estadoNombre))).sort((a, b) => a.fechaAlta.localeCompare(b.fechaAlta));
  const commercialAttention = [
    ...attentionActivities.map(item => ({ key: `activity-${item.actividadComercialId}`, title: item.titulo, meta: person(item.clienteNombre, item.clienteApellido), date: item.fechaProgramada, href: `/comercial/agenda/${item.actividadComercialId}`, kind: item.fechaProgramada.slice(0, 10) < todayIso ? 'Vencida' : item.fechaProgramada.slice(0, 10) === todayIso ? 'Hoy' : 'Próxima' })),
    ...attentionInterests.map(item => ({ key: `interest-${item.interesComercialId}`, title: item.descripcion || `Consulta #${item.interesComercialId}`, meta: person(item.clienteNombre, item.clienteApellido), date: item.fechaAlta, href: `/comercial/consultas/${item.interesComercialId}`, kind: 'Sin resolver' })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const availableCuts = data.cuts.filter(item => /disponible/i.test(normalizeDashboardText(item.estadoRecorteNombre)) && item.cantidadActual > 0).sort((a, b) => b.cantidadActual - a.cantidadActual).slice(0, 5);
  const salesTrend = useMemo(() => {
    const groups = new Map<string, number>();
    data.documents.filter(item => item.fechaComprobante.slice(0, 10) >= range.from && item.fechaComprobante.slice(0, 10) <= range.to && !isVoidedDocument(item.estadoComprobante)).forEach(item => {
      const key = item.fechaComprobante.slice(0, 10); groups.set(key, (groups.get(key) || 0) + documentNet(item));
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  }, [data.documents, range.from, range.to]);
  const maxTrend = Math.max(1, ...salesTrend.map(([, value]) => Math.abs(value)));
  const quickLinks = buildQuickLinks(profile ? [profile] : profiles).filter(link => hasPermission(link.menu, link.permission)).slice(0, 5);
  const displayName = session?.usuario ? `${session.usuario.nombre}${session.usuario.apellido ? ` ${session.usuario.apellido}` : ''}` : 'Usuario';

  return <AppShell title="Inicio" breadcrumb="Inicio"><div className={`dashboard-page dashboard-profile-${profile || 'none'}`}>
    <header className="dashboard-heading">
      <div><span className="page-kicker">TEKA MANAGER</span><h1>{dashboardTitle(profile)}</h1><p>Hola, {displayName}. {profileDescription(profile)}</p></div>
      {showsPeriod && <form className="dashboard-period" onSubmit={event => { event.preventDefault(); if (draftRange.from <= draftRange.to) setRange(draftRange); }}>
        <label><span>Desde</span><input type="date" value={draftRange.from} max={draftRange.to} onChange={event => setDraftRange(value => ({ ...value, from: event.target.value }))}/></label>
        <label><span>Hasta</span><input type="date" value={draftRange.to} min={draftRange.from} onChange={event => setDraftRange(value => ({ ...value, to: event.target.value }))}/></label>
        <button className="button secondary" type="submit" disabled={draftRange.from > draftRange.to}>Aplicar período</button>
      </form>}
    </header>

    {errors.length > 0 && <div className="dashboard-warning" role="alert"><AlertTriangle size={19}/><span>Parte de la información no pudo cargarse. Los bloques afectados se muestran sin datos.</span><button type="button" onClick={() => setReload(value => value + 1)}><RefreshCw size={16}/> Reintentar</button></div>}

    {widgets.length > 0 ? <section className="dashboard-kpis" aria-label="Resumen principal">{widgets.map(({ widget }) => {
      const value = widget.value(data, range.from, range.to);
      return <a className="dashboard-kpi" href={widget.href} key={widget.id} title={value === 0 ? widget.emptyText : `Abrir ${widget.label.toLowerCase()}`}>
        <span className="dashboard-kpi-scope">{scopeLabel[widget.scope]}</span><span className="dashboard-kpi-label">{widget.label}</span>
        <strong>{loading ? '—' : widget.format === 'currency' ? currency.format(value) : number.format(value)}</strong>
        <small>{loading ? 'Consultando datos…' : value === 0 ? widget.emptyText : 'Ver detalle'} <ArrowRight size={15}/></small>
      </a>;
    })}</section> : <section className="dashboard-empty"><ShieldCheck size={28}/><h2>Inicio disponible</h2><p>No hay indicadores compatibles con los permisos efectivos de esta cuenta.</p></section>}

    <div className="dashboard-grid">
      {profile === 'admin' && <AdminSections loading={loading} recentAudit={recentAudit} blockedUsers={blockedUsers}/>} 
      {profile === 'management' && <ManagementSections loading={loading} trend={salesTrend} maxTrend={maxTrend} productionGroups={productionGroups} orders={managementOrders} criticalSupplies={criticalSupplies}/>} 
      {profile === 'commercial' && <CommercialSections loading={loading} attention={commercialAttention} funnel={opportunityGroups} maxFunnel={maxOpportunity}/>} 
      {profile === 'workshop-manager' && <WorkshopManagerSections loading={loading} orders={activeProduction} supplies={criticalSupplies} cuts={availableCuts}/>} 
      {profile === 'workshop-operator' && <WorkshopOperatorSections loading={loading} orders={activeProduction} orderProducts={orderProducts} supplies={criticalSupplies}/>} 
      {quickLinks.length > 0 && <section className="dashboard-card dashboard-quick-card">
        <header><div><span className="section-kicker">NIVEL 3</span><h2>Acciones rápidas</h2><p>Funciones frecuentes habilitadas para tu cuenta.</p></div></header>
        <div className="dashboard-quick-links">{quickLinks.map(link => { const Icon = link.icon; return <a href={link.href} key={link.href}><Icon size={20}/><span>{link.label}</span><ArrowRight size={16}/></a>; })}</div>
      </section>}
    </div>
  </div></AppShell>;
}

function AdminSections({ loading, recentAudit, blockedUsers }: { loading: boolean; recentAudit: DashboardData['auditEvents']; blockedUsers: DashboardData['users'] }) {
  return <>
    <DashboardCard kicker="NIVEL 2 · SEGURIDAD" title="Actividad relevante" href="/auditoria" link="Abrir auditoría" wide>
      <ListState loading={loading} empty="No se registraron eventos en el período.">{recentAudit.map(item => <a className="dashboard-list-row" href="/auditoria" key={item.auditoriaEventoId}><span><strong>{item.accion} · {item.modulo}</strong><small>{item.descripcion || `Registrado por ${item.username}`}</small></span><time>{shortDate(item.fechaEvento)}</time></a>)}</ListState>
    </DashboardCard>
    {hasPermission('Usuarios', 'Ver') && <DashboardCard kicker="ATENCIÓN" title="Usuarios bloqueados" href="/usuarios" link="Gestionar usuarios">
      <ListState loading={loading} empty="No hay usuarios bloqueados.">{blockedUsers.map(item => <a className="dashboard-list-row" href="/usuarios" key={item.usuarioId}><span><strong>{person(item.nombre, item.apellido)}</strong><small>@{item.username}</small></span><span className="dashboard-state danger">Bloqueado</span></a>)}</ListState>
    </DashboardCard>}
  </>;
}

function ManagementSections({ loading, trend, maxTrend, productionGroups, orders, criticalSupplies }: { loading: boolean; trend: Array<[string, number]>; maxTrend: number; productionGroups: Array<[string, number]>; orders: DashboardData['orders']; criticalSupplies: DashboardData['supplies'] }) {
  return <>
    {hasPermission('Ventas', 'Ver') && <DashboardCard kicker="NIVEL 2 · EVOLUCIÓN" title="Facturación interna del período" href="/ventas/reportes" link="Abrir reportes">
      {loading ? <CardState>Consultando comprobantes…</CardState> : trend.length ? <div className="dashboard-trend">{trend.map(([date, value]) => <div key={date}><div title={currency.format(value)}><i className={value < 0 ? 'negative' : ''} style={{ height: `${Math.max(8, Math.abs(value) / maxTrend * 100)}%` }}/></div><span>{new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span></div>)}</div> : <CardState>Sin comprobantes vigentes en el período.</CardState>}
      <p className="dashboard-footnote">Comprobantes internos vigentes; suma débitos y resta notas de crédito. No equivale a rentabilidad ni facturación fiscal.</p>
    </DashboardCard>}
    {hasPermission('Producción', 'Ver') && <DashboardCard kicker="SITUACIÓN ACTUAL" title="Estado general de producción" href="/production/orders" link="Ver producción">
      {loading ? <CardState>Consultando producción…</CardState> : productionGroups.length ? <div className="dashboard-status-grid">{productionGroups.map(([state, count]) => <div key={state}><strong>{count}</strong><span>{state}</span></div>)}</div> : <CardState>No hay órdenes de producción.</CardState>}
    </DashboardCard>}
    {hasPermission('Ventas', 'Ver') && <DashboardCard kicker="ATENCIÓN" title="Pedidos por cumplir" href="/ventas/pedidos" link="Ver pedidos">
      <ListState loading={loading} empty="No hay pedidos confirmados pendientes de entrega.">{orders.map(item => <a className="dashboard-list-row" href={`/ventas/pedidos/${item.pedidoId}`} key={item.pedidoId}><span><strong>Pedido #{item.pedidoId} · {person(item.clienteNombre, item.clienteApellido)}</strong><small>{item.canalVentaNombre}</small></span><span className="dashboard-state">{item.estadoPedidoNombre}</span></a>)}</ListState>
    </DashboardCard>}
    {hasPermission('Inventario', 'Ver') && <CriticalSuppliesCard loading={loading} supplies={criticalSupplies}/>} 
  </>;
}

function CommercialSections({ loading, attention, funnel, maxFunnel }: { loading: boolean; attention: Array<{ key:string; title:string; meta:string; date:string; href:string; kind:string }>; funnel: DashboardData['opportunityFunnel']; maxFunnel: number }) {
  return <>
    <DashboardCard kicker="NIVEL 2 · PRIORIDAD" title="Qué atender ahora" href="/comercial/agenda" link="Abrir agenda" wide>
      <ListState loading={loading} empty="No hay actividades próximas ni consultas sin resolver.">{attention.map(item => <a className="dashboard-list-row" href={item.href} key={item.key}><span><strong>{item.title}</strong><small>{item.meta}</small></span><span className={`dashboard-state ${item.kind === 'Vencida' ? 'danger' : ''}`}>{item.kind}</span><time>{shortDate(item.date)}</time></a>)}</ListState>
    </DashboardCard>
    <DashboardCard kicker="SEGUIMIENTO" title="Embudo comercial" href="/comercial/oportunidades" link="Ver oportunidades">
      {loading ? <CardState>Consultando oportunidades…</CardState> : funnel.length ? <div className="dashboard-bars">{funnel.slice(0, 6).map(item => <div key={item.estado}><span>{item.estado}</span><div><i style={{ width: `${item.cantidad / maxFunnel * 100}%` }}/></div><strong>{item.cantidad}</strong></div>)}</div> : <CardState>No hay oportunidades registradas.</CardState>}
    </DashboardCard>
  </>;
}

function WorkshopManagerSections({ loading, orders, supplies, cuts }: { loading: boolean; orders: DashboardData['production']; supplies: DashboardData['supplies']; cuts: DashboardData['cuts'] }) {
  return <>
    <ProductionPriorityCard loading={loading} orders={orders} title="Prioridades de producción" wide/>
    {hasPermission('Inventario', 'Ver') && <CriticalSuppliesCard loading={loading} supplies={supplies}/>} 
    {hasPermission('Recortes / GIR', 'Ver') && <DashboardCard kicker="REUTILIZACIÓN" title="Recortes disponibles" href="/recortes/inventario" link="Gestionar recortes">
      <ListState loading={loading} empty="No hay recortes disponibles.">{cuts.map(item => <a className="dashboard-list-row" href={`/recortes/inventario/${item.recorteId}`} key={item.recorteId}><span><strong>{item.insumoNombre}</strong><small>Recorte #{item.recorteId}</small></span><strong>{number.format(item.cantidadActual)}</strong></a>)}</ListState>
    </DashboardCard>}
  </>;
}

function WorkshopOperatorSections({ loading, orders, orderProducts, supplies }: { loading: boolean; orders: DashboardData['production']; orderProducts: Record<number, OrderProductSummary[]>; supplies: DashboardData['supplies'] }) {
  const canEdit = hasPermission('Producción', 'Editar');
  return <>
    <DashboardCard kicker="NIVEL 2 · TRABAJO OPERATIVO" title="Órdenes disponibles para trabajar" href="/production/orders" link="Ver todas" wide>
      <ListState loading={loading} empty="No hay órdenes pendientes o en proceso.">{orders.map(item => {
        const products = orderProducts[item.ordenProduccionId];
        const productText = products === undefined ? 'Consultando productos…' : products.length ? products.map(product => `${product.nombre} · ${number.format(product.cantidad)} un.`).join(' / ') : 'Sin detalle de productos disponible';
        return <a className="dashboard-work-row" href={`/production/orders/${item.ordenProduccionId}`} key={item.ordenProduccionId}><span className="dashboard-work-id">OP #{item.ordenProduccionId}</span><span><strong>{productText}</strong><small>{number.format(item.cantidadTotalPlanificada)} unidades planificadas · {shortDate(item.fechaCreacion)}</small></span><span className="dashboard-state">{item.estadoOrdenProduccionNombre}</span><span className="dashboard-row-action">{canEdit ? /pendiente/i.test(item.estadoOrdenProduccionNombre) ? 'Iniciar' : 'Actualizar' : 'Consultar'} <ArrowRight size={15}/></span></a>;
      })}</ListState>
    </DashboardCard>
    {hasPermission('Inventario', 'Ver') && supplies.length > 0 && <CriticalSuppliesCard loading={loading} supplies={supplies}/>} 
  </>;
}

function ProductionPriorityCard({ loading, orders, title, wide = false }: { loading: boolean; orders: DashboardData['production']; title: string; wide?: boolean }) {
  return <DashboardCard kicker="NIVEL 2 · ATENCIÓN" title={title} href="/production/orders" link="Ver órdenes" wide={wide}>
    <ListState loading={loading} empty="No hay órdenes pendientes o en proceso.">{orders.map(item => <a className="dashboard-list-row" href={`/production/orders/${item.ordenProduccionId}`} key={item.ordenProduccionId}><span><strong>Orden #{item.ordenProduccionId}</strong><small>{number.format(item.cantidadTotalPlanificada)} unidades · creada {shortDate(item.fechaCreacion)}</small></span><span className="dashboard-state">{item.estadoOrdenProduccionNombre}</span></a>)}</ListState>
  </DashboardCard>;
}

function CriticalSuppliesCard({ loading, supplies }: { loading: boolean; supplies: DashboardData['supplies'] }) {
  return <DashboardCard kicker="ATENCIÓN" title="Disponibilidad de materiales" href="/inventory/supplies" link="Revisar existencias">
    <ListState loading={loading} empty="No hay insumos por debajo del mínimo.">{supplies.map(item => <a className="dashboard-list-row" href={`/inventory/supplies/${item.insumoId}`} key={item.insumoId}><span><strong>{item.insumoNombre}</strong><small>Mínimo: {number.format(item.stockMinimo)}</small></span><strong className="dashboard-danger">{number.format(item.cantidadActual)}</strong></a>)}</ListState>
  </DashboardCard>;
}

function DashboardCard({ kicker, title, href, link, wide = false, children }: { kicker: string; title: string; href?: string; link?: string; wide?: boolean; children: ReactNode }) {
  return <section className={`dashboard-card ${wide ? 'dashboard-card-wide' : ''}`}><header><div><span className="section-kicker">{kicker}</span><h2>{title}</h2></div>{href && link && <a href={href}>{link} <ArrowRight size={16}/></a>}</header>{children}</section>;
}

function CardState({ children }: { children: ReactNode }) { return <div className="dashboard-card-state">{children}</div>; }
function ListState({ loading, empty, children }: { loading: boolean; empty: string; children: ReactNode[] }) {
  if (loading) return <CardState>Consultando información…</CardState>;
  if (!children.length) return <CardState>{empty}</CardState>;
  return <div className="dashboard-list">{children}</div>;
}

function profileDescription(profile?: DashboardProfile) {
  if (profile === 'admin') return 'Supervisá accesos, usuarios y actividad relevante del sistema.';
  if (profile === 'management') return 'Revisá resultados, compromisos pendientes y riesgos operativos.';
  if (profile === 'commercial') return 'Priorizá seguimientos y oportunidades que pueden convertirse en ventas.';
  if (profile === 'workshop-manager') return 'Organizá las prioridades de producción y anticipá faltantes.';
  if (profile === 'workshop-operator') return 'Identificá rápidamente el próximo trabajo disponible.';
  return 'No hay un perfil operativo asociado a esta cuenta.';
}

function buildQuickLinks(profiles: DashboardProfile[]) {
  const links = [
    { label: 'Gestionar usuarios', menu: 'Usuarios', permission: 'Ver' as const, href: '/usuarios', icon: UsersRound, scores: { admin: 100 } },
    { label: 'Roles y permisos', menu: 'Roles y accesos', permission: 'Ver' as const, href: '/roles', icon: ShieldCheck, scores: { admin: 95 } },
    { label: 'Consultar auditoría', menu: 'Auditoría', permission: 'Ver' as const, href: '/auditoria', icon: ClipboardList, scores: { admin: 90 } },
    { label: 'Configuración', menu: 'Configuración', permission: 'Ver' as const, href: '/configuracion', icon: Settings, scores: { admin: 85 } },
    { label: 'Reportes de ventas', menu: 'Ventas', permission: 'Ver' as const, href: '/ventas/reportes', icon: TrendingUp, scores: { management: 100 } },
    { label: 'Pedidos pendientes', menu: 'Ventas', permission: 'Ver' as const, href: '/ventas/pedidos', icon: ShoppingCart, scores: { management: 95, commercial: 70 } },
    { label: 'Estado de producción', menu: 'Producción', permission: 'Ver' as const, href: '/production/orders', icon: Factory, scores: { management: 90, 'workshop-manager': 100, 'workshop-operator': 100 } },
    { label: 'Revisar existencias', menu: 'Inventario', permission: 'Ver' as const, href: '/inventory/stock', icon: Boxes, scores: { management: 85, 'workshop-manager': 90, 'workshop-operator': 90 } },
    { label: 'Registrar consulta', menu: 'Comercial', permission: 'Crear' as const, href: '/comercial/consultas/new', icon: ClipboardList, scores: { commercial: 100 } },
    { label: 'Nueva oportunidad', menu: 'Comercial', permission: 'Crear' as const, href: '/comercial/oportunidades/new', icon: TrendingUp, scores: { commercial: 95 } },
    { label: 'Crear presupuesto', menu: 'Comercial', permission: 'Crear' as const, href: '/comercial/presupuestos/new', icon: ShoppingCart, scores: { commercial: 90 } },
    { label: 'Nueva orden', menu: 'Producción', permission: 'Crear' as const, href: '/production/orders/new', icon: Factory, scores: { 'workshop-manager': 95 } },
    { label: 'Gestionar recortes', menu: 'Recortes / GIR', permission: 'Ver' as const, href: '/recortes/inventario', icon: PackageSearch, scores: { 'workshop-manager': 85, 'workshop-operator': 85 } },
  ];
  return links.map(link => ({ ...link, score: Math.max(0, ...profiles.map(profile => link.scores[profile as keyof typeof link.scores] || 0)) })).filter(link => link.score > 0).sort((a, b) => b.score - a.score);
}
