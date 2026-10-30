import React from 'react';
import ReactDOM from 'react-dom/client';
import { LoginPage } from './features/auth/LoginPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { UsersPage } from './features/users/UsersPage';
import { RolesPage } from './features/roles/RolesPage';
import { AuditPage } from './features/audit/AuditPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CommercialPage } from './features/commercial/CommercialPage';
import { BudgetsPage } from './features/commercial/pages/BudgetsPage';
import { AgendaPage } from './features/commercial/pages/AgendaPage';
import { OpportunitiesPage } from './features/commercial/pages/OpportunitiesPage';
import { ConsultationsPage } from './features/commercial/pages/ConsultationsPage';
import { WhatsAppInboxPage } from './features/commercial/pages/WhatsAppInboxPage';
import { CommercialDashboard } from './features/commercial/CommercialDashboard';
import { EcommercePage } from './features/ecommerce/EcommercePage';
import { OnlineOrdersPage } from './features/ecommerce/OnlineOrdersPage';
import { PromotionsBenefitsPage } from './features/ecommerce/PromotionsBenefitsPage';
import { EcommerceReportsPage } from './features/ecommerce/EcommerceReportsPage';
import { ProductsPage } from './features/inventory/pages/ProductsPage';
import { SuppliesPage } from './features/inventory/pages/SuppliesPage';
import { StockPage } from './features/inventory/pages/StockPage';
import { MovementsPage } from './features/inventory/pages/MovementsPage';
import { MovementCreatePage } from './features/inventory/pages/MovementCreatePage';
import { MovementDetailPage } from './features/inventory/pages/MovementDetailPage';
import { InventoryDashboardPage } from './features/inventory/InventoryDashboardPage';
import { InventoryReportsHomePage } from './features/inventory/pages/InventoryReportsHomePage';
import { InventoryReportDetailPage } from './features/inventory/pages/InventoryReportDetailPage';
import { InventoryReport3DPage } from './features/inventory/pages/InventoryReport3DPage';
import { InventoryReportGeneratePage } from './features/inventory/pages/InventoryReportGeneratePage';
import type { InventoryReportKey } from './features/inventory/types/reports';
import { ProductionRecipesPage } from './features/production/ProductionRecipesPage';
import { ProductionOrdersPage } from './features/production/ProductionOrdersPage';
import { ProductionOrderCreatePage } from './features/production/ProductionOrderCreatePage';
import { ProductionOrderDetailPage } from './features/production/ProductionOrderDetailPage';
import { ProductionOrderFinishPage } from './features/production/ProductionOrderFinishPage';
import { ProductionConfigurationPage } from './features/production/ProductionConfigurationPage';
import { ProductionReportsDashboard } from './features/production/ProductionReportsDashboard';
import { ProductionReportsPage } from './features/production/ProductionReportsPage';
import { ProductionReportGeneratePage } from './features/production/ProductionReportGeneratePage';
import { RecortesInventoryPage } from './features/recortes/pages/RecortesInventoryPage';
import { RecorteDetailPage } from './features/recortes/pages/RecorteDetailPage';
import { RecortesMovementsPage } from './features/recortes/pages/RecortesMovementsPage';
import { RecortesInteligentesPage } from './features/recortes/RecortesInteligentesPage';
import { RecorteDisenoDetailPage } from './features/recortes/pages/RecorteDisenoDetailPage';
import { RecortesFabricacionPage } from './features/recortes/pages/RecortesFabricacionPage';
import { RecortesReportsPage } from './features/recortes/pages/RecortesReportsPage';
import { SalesOrdersPage } from './features/sales/SalesOrdersPage';
import { SalesReportsHomePage } from './features/sales/SalesReportsHomePage';
import { SalesReportDetailPage } from './features/sales/SalesReportDetailPage';
import { SalesReportGeneratePage } from './features/sales/SalesReportGeneratePage';
import { SalesCustomersPage } from './features/sales/SalesCustomersPage';
import { CustomerEditorPage } from './features/sales/CustomerEditorPage';
import { CustomerDetailPage } from './features/sales/CustomerDetailPage';
import { CustomerAccountPage } from './features/sales/CustomerAccountPage';
import { SalesOrderCreatePage } from './features/sales/SalesOrderCreatePage';
import { SalesOrderDetailPage } from './features/sales/SalesOrderDetailPage';
import { SalesPricesPage } from './features/sales/SalesPricesPage';
import { SalesPriceCreatePage } from './features/sales/SalesPriceCreatePage';
import { ConfigurationPage } from './features/configuration/ConfigurationPage';
import { AddressTypesPage } from './features/configuration/AddressTypesPage';
import { CostPriceParametersPage } from './features/configuration/CostPriceParametersPage';
import { ProductionAdminPage } from './features/configuration/ProductionAdminPage';
import { ProductionCutTypesPage } from './features/configuration/ProductionCutTypesPage';
import { DailyCashPage } from './features/cash/DailyCashPage';
import { CashClosePage } from './features/cash/CashClosePage';
import { CashFixedFundPage } from './features/cash/CashFixedFundPage';
import { FinancialMovementsPage } from './features/cash/FinancialMovementsPage';
import { CashMovementCreatePage } from './features/cash/CashMovementCreatePage';
import { CashRecordDetailPage } from './features/cash/CashRecordDetailPage';
import { CashReportsPage } from './features/cash/CashReportsPage';
import { CashReportGeneratePage } from './features/cash/CashReportGeneratePage';
import { CashConceptsPage } from './features/cash/CashConceptsPage';
import { resolveCashRoute, canOpenCashRoute } from './features/cash/cashRoutes';
import { BankReconciliationsPage } from './features/cash/BankReconciliationsPage';
import { AccessDeniedPage, ModulePlaceholderPage } from './features/system/ModulePlaceholderPage';
import { getSession } from './services/session';
import { hasPermission } from './services/authorization';
import './styles/tokens.css';
import './styles/global.css';
import './styles/commercial.css';

function resolvePage(): React.ComponentType {
const params = new URLSearchParams(location.search);
const view = params.get('view');
const session = getSession();
let Page: React.ComponentType;

const routeMenus: Record<string, string> = {
  '/ventas/clientes': 'Ventas',
  '/ventas/clientes/nuevo': 'Ventas',
  '/ventas/pedidos': 'Ventas',
  '/ventas/pedidos/nuevo': 'Ventas',
  '/ventas/precios': 'Costos y precios',
  '/ventas/precios/nuevo': 'Costos y precios',
  '/configuracion/ventas': 'Configuración',
  '/configuracion/caja': 'Configuración',
  '/configuracion/caja/fondo-fijo': 'Configuración',
  '/configuracion/caja/conceptos': 'Configuración',
  '/configuracion/ventas/parametros-costos-precios': 'Configuración',
  '/configuracion/ventas/tipos-domicilio': 'Configuración',
  '/configuracion/produccion': 'Configuraci\u00f3n',
  '/configuracion/produccion/plantillas': 'Configuraci\u00f3n',
  '/configuracion/produccion/formatos': 'Configuraci\u00f3n',
  '/configuracion/produccion/parametros': 'Configuraci\u00f3n',
  '/configuracion/produccion/tipos-recorte': 'Configuraci\u00f3n',
  '/inventory/products': 'Inventario',
  '/inventory/products/new': 'Inventario',
  '/inventory/supplies': 'Inventario',
  '/inventory/supplies/new': 'Inventario',
  '/inventory/stock': 'Inventario',
  '/inventory/movements': 'Inventario',
  '/inventory/movements/new': 'Inventario',
  '/inventory/dashboard': 'Inventario',
  '/inventory/reports': 'Inventario',
  '/inventory/reports/3d': 'Inventario',
  '/inventory/reports/generate': 'Inventario',
  '/production/recipes': 'Producción',
  '/production/models-materials': 'Producción',
  '/production/orders': 'Producción',
  '/production/orders/new': 'Producción',
  '/production/reports': 'Producción',
  '/recortes/inventario': 'Recortes / GIR',
  '/recortes/movimientos': 'Recortes / GIR', '/recortes/disenos': 'Recortes / GIR',
  '/recortes/fabricacion': 'Recortes / GIR', '/recortes/reportes': 'Recortes / GIR',
  '/caja/diaria': 'Caja', '/caja/movimientos': 'Caja', '/caja/conciliaciones-bancarias': 'Caja',
  '/inicio': 'Inicio', '/comercial': 'Comercial', '/ventas': 'Ventas', '/cobros': 'Cobros',
  '/inventario': 'Inventario', '/produccion': 'Producción', '/recortes': 'Recortes / GIR', '/compras': 'Compras',
  '/proveedores': 'Proveedores', '/costos': 'Costos y precios', '/ecommerce': 'E-commerce', '/ecommerce/catalogo': 'E-commerce', '/ecommerce/actividad': 'E-commerce', '/ecommerce/panel': 'E-commerce', '/ecommerce/disponibilidad': 'E-commerce', '/ecommerce/pedidos': 'E-commerce', '/ecommerce/clientes': 'E-commerce', '/ecommerce/promociones': 'E-commerce', '/ecommerce/reportes': 'E-commerce', '/reportes': 'Reportes',
  '/usuarios': 'Usuarios', '/roles': 'Roles y accesos', '/auditoria': 'Auditoría', '/configuracion': 'Configuración',
};

const path = location.pathname === '/' ? (session?.exitoso ? '/inicio' : '/') : location.pathname;
const cashRoute = resolveCashRoute(path);
const commercialRoute = path === '/comercial' ? 'consultas' : path.startsWith('/comercial/') ? path.split('/')[2] : null;
const commercialAliases: Record<string, 'consultas' | 'oportunidades' | 'presupuestos' | 'agenda' | 'reportes'> = {
  pendientes: 'consultas', cotizaciones: 'presupuestos', analisis: 'reportes', panel: 'consultas',
};
const commercialSection = commercialRoute ? (commercialAliases[commercialRoute] ?? commercialRoute) : null;
const salesReportDetailMatch = /^\/ventas\/reportes\/detalle\/(performance|customers|operations)$/.exec(path);
const salesOrderDetailMatch = /^\/ventas\/pedidos\/([1-9]\d*)$/.exec(path);
const customerDetailMatch = /^\/ventas\/clientes\/([1-9]\d*)$/.exec(path);
const customerEditMatch = /^\/ventas\/clientes\/([1-9]\d*)\/editar$/.exec(path);
const customerAccountMatch = /^\/ventas\/clientes\/([1-9]\d*)\/cuenta-corriente$/.exec(path);
const productDetailMatch = /^\/inventory\/products\/([1-9]\d*)$/.exec(path);
const productEditMatch = /^\/inventory\/products\/([1-9]\d*)\/edit$/.exec(path);
const supplyDetailMatch = /^\/inventory\/supplies\/([1-9]\d*)$/.exec(path);
const supplyEditMatch = /^\/inventory\/supplies\/([1-9]\d*)\/edit$/.exec(path);
const budgetDetailMatch = /^\/comercial\/presupuestos\/([1-9]\d*)$/.exec(path);
const budgetEditMatch = /^\/comercial\/presupuestos\/([1-9]\d*)\/edit$/.exec(path);
const activityDetailMatch = /^\/comercial\/agenda\/([1-9]\d*)$/.exec(path);
const activityEditMatch = /^\/comercial\/agenda\/([1-9]\d*)\/edit$/.exec(path);
const opportunityDetailMatch = /^\/comercial\/oportunidades\/([1-9]\d*)$/.exec(path);
const opportunityEditMatch = /^\/comercial\/oportunidades\/([1-9]\d*)\/edit$/.exec(path);
const consultationDetailMatch = /^\/comercial\/consultas\/([1-9]\d*)$/.exec(path);
const consultationEditMatch = /^\/comercial\/consultas\/([1-9]\d*)\/edit$/.exec(path);
const movementDetailMatch = /^\/inventory\/movements\/([1-9]\d*)$/.exec(path);
const productionOrderDetailMatch = /^\/production\/orders\/([1-9]\d*)$/.exec(path);
const productionOrderFinishMatch = /^\/production\/orders\/([1-9]\d*)\/finish$/.exec(path);
const productionModelDetailMatch = /^\/production\/models-materials\/([1-9]\d*)$/.exec(path);
const productionConfigurationMatch = /^\/production\/models-materials\/([1-9]\d*)\/configurations\/new$/.exec(path);
const inventoryReportDetailMatch = /^\/inventory\/reports\/detail\/(active|critical|out|available|status|movements|risk|consumption|adjustments|product-state|supply-state)$/.exec(path);
const recorteDetailMatch = /^\/recortes\/inventario\/([1-9]\d*)$/.exec(path);
const disenoDetailMatch = /^\/recortes\/disenos\/([1-9]\d*)$/.exec(path);
const requiredMenu = commercialSection ? 'Comercial' : salesOrderDetailMatch || customerDetailMatch || customerEditMatch || customerAccountMatch ? 'Ventas' : productionOrderDetailMatch || productionOrderFinishMatch || productionModelDetailMatch || productionConfigurationMatch ? 'Producción' : productDetailMatch || productEditMatch || supplyDetailMatch || supplyEditMatch || movementDetailMatch || inventoryReportDetailMatch ? 'Inventario' : recorteDetailMatch || disenoDetailMatch ? 'Recortes / GIR' : routeMenus[path];

if (view === 'forgot-password') Page = ForgotPasswordPage;
else if (view === 'reset-password') Page = ResetPasswordPage;
else if (!session?.exitoso) Page = LoginPage;
else if (cashRoute && !canOpenCashRoute(cashRoute, hasPermission)) Page = AccessDeniedPage;
else if (cashRoute) {
  switch (cashRoute.screen) {
    case 'daily': Page = DailyCashPage; break;
    case 'close': Page = CashClosePage; break;
    case 'movements': Page = FinancialMovementsPage; break;
    case 'banks': Page = BankReconciliationsPage; break;
    case 'reports': Page = CashReportsPage; break;
    case 'reportGenerate': Page = CashReportGeneratePage; break;
    case 'concepts': Page = CashConceptsPage; break;
    case 'create': Page = CashMovementCreatePage; break;
    case 'movementDetail': Page = () => <CashRecordDetailPage source={cashRoute.source} id={cashRoute.id}/>; break;
    case 'sessionDetail': Page = () => <CashRecordDetailPage id={cashRoute.id}/>; break;
  }
}
else if (requiredMenu && !hasPermission(requiredMenu, 'Ver')) Page = AccessDeniedPage;
else if (path === '/ventas/clientes/nuevo' && !hasPermission('Ventas', 'Crear')) Page = AccessDeniedPage;
else if (customerEditMatch && !hasPermission('Ventas', 'Editar')) Page = AccessDeniedPage;
else if (customerAccountMatch && !hasPermission('Cobros', 'Ver')) Page = AccessDeniedPage;
else if (path === '/ventas/precios/nuevo' && !hasPermission('Costos y precios', 'Crear')) Page = AccessDeniedPage;
else if (path === '/configuracion/ventas/parametros-costos-precios' && !hasPermission('Costos y precios', 'Ver')) Page = AccessDeniedPage;
else if (path === '/configuracion/ventas' && !hasPermission('Costos y precios', 'Ver') && !hasPermission('Ventas', 'Ver')) Page = AccessDeniedPage;
else if (path === '/configuracion/ventas/tipos-domicilio' && !hasPermission('Ventas', 'Ver')) Page = AccessDeniedPage;
else if (path === '/configuracion/caja' && !hasPermission('Caja', 'Ver')) Page = AccessDeniedPage;
else if (path === '/configuracion/caja/conceptos' && !hasPermission('Caja', 'Ver')) Page = AccessDeniedPage;
else if (path === '/configuracion/caja/fondo-fijo' && !hasPermission('Caja', 'Editar')) Page = AccessDeniedPage;
else if (path === '/inventory/products/new' && !hasPermission('Inventario', 'Crear')) Page = AccessDeniedPage;
else if (productEditMatch && !hasPermission('Inventario', 'Editar')) Page = AccessDeniedPage;
else if (path === '/inventory/supplies/new' && !hasPermission('Inventario', 'Crear')) Page = AccessDeniedPage;
else if (supplyEditMatch && !hasPermission('Inventario', 'Editar')) Page = AccessDeniedPage;
else if (path === '/comercial/presupuestos/new' && !hasPermission('Comercial', 'Crear')) Page = AccessDeniedPage;
else if (budgetEditMatch && !hasPermission('Comercial', 'Editar')) Page = AccessDeniedPage;
else if (path === '/comercial/agenda/new' && !hasPermission('Comercial', 'Crear')) Page = AccessDeniedPage;
else if (activityEditMatch && !hasPermission('Comercial', 'Editar')) Page = AccessDeniedPage;
else if (path === '/comercial/oportunidades/new' && !hasPermission('Comercial', 'Crear')) Page = AccessDeniedPage;
else if (opportunityEditMatch && !hasPermission('Comercial', 'Editar')) Page = AccessDeniedPage;
else if (path === '/comercial/consultas/new' && !hasPermission('Comercial', 'Crear')) Page = AccessDeniedPage;
else if (consultationEditMatch && !hasPermission('Comercial', 'Editar')) Page = AccessDeniedPage;
else if (path === '/production/orders/new' && !hasPermission('Producción', 'Crear')) Page = AccessDeniedPage;
else if (productionOrderFinishMatch && !hasPermission('Producción', 'Editar')) Page = AccessDeniedPage;
else if (productionConfigurationMatch && !hasPermission('Producción', 'Editar')) Page = AccessDeniedPage;
else if (path === '/inicio') Page = DashboardPage;
else if (path === '/roles') Page = RolesPage;
else if (path === '/usuarios') Page = UsersPage;
else if (path === '/auditoria') Page = AuditPage;
else if (path === '/ventas/reportes') Page = SalesReportsHomePage;
else if (path === '/ventas/reportes/generar') Page = SalesReportGeneratePage;
else if (salesReportDetailMatch) Page = () => <SalesReportDetailPage reportKey={salesReportDetailMatch[1] as 'performance'|'customers'|'operations'} />;
else if (path === '/ventas' || path === '/ventas/pedidos') Page = SalesOrdersPage;
else if (path === '/ventas/clientes') Page = SalesCustomersPage;
else if (path === '/ventas/clientes/nuevo') Page = CustomerEditorPage;
else if (customerEditMatch) Page = () => <CustomerEditorPage customerId={Number(customerEditMatch[1])}/>;
else if (customerDetailMatch) Page = () => <CustomerDetailPage customerId={Number(customerDetailMatch[1])}/>;
else if (customerAccountMatch) Page = () => <CustomerAccountPage customerId={Number(customerAccountMatch[1])}/>;
else if (path === '/ventas/precios') Page = SalesPricesPage;
else if (path === '/ventas/precios/nuevo') Page = SalesPriceCreatePage;
else if (path === '/configuracion') Page = ConfigurationPage;
else if (path === '/configuracion/ventas') Page = () => <ConfigurationPage section="sales"/>;
else if (path === '/configuracion/caja') Page = () => <ConfigurationPage section="cash"/>;
else if (path === '/configuracion/caja/conceptos') Page = () => <CashConceptsPage configurationContext/>;
else if (path === '/configuracion/caja/fondo-fijo') Page = CashFixedFundPage;
else if (path === '/configuracion/ventas/parametros-costos-precios') Page = CostPriceParametersPage;
else if (path === '/configuracion/ventas/tipos-domicilio') Page = AddressTypesPage;
else if (path === '/configuracion/produccion') Page = ProductionAdminPage;
else if (path === '/configuracion/produccion/plantillas') Page = () => <ProductionAdminPage section="templates"/>;
else if (path === '/configuracion/produccion/formatos') Page = () => <ProductionAdminPage section="formats"/>;
else if (path === '/configuracion/produccion/parametros') Page = () => <ProductionAdminPage section="parameters"/>;
else if (path === '/configuracion/produccion/tipos-recorte') Page = ProductionCutTypesPage;
else if (path === '/ventas/pedidos/nuevo') Page = SalesOrderCreatePage;
else if (salesOrderDetailMatch) Page = () => <SalesOrderDetailPage orderId={Number(salesOrderDetailMatch[1])} />;
else if (path === '/ecommerce' || path === '/ecommerce/catalogo' || path === '/ecommerce/disponibilidad') Page = EcommercePage;
else if (path === '/ecommerce/actividad' || path === '/ecommerce/pedidos') Page = OnlineOrdersPage;
else if (path === '/ecommerce/panel' || path === '/ecommerce/clientes') Page = EcommerceReportsPage;
else if (path === '/ecommerce/promociones') Page = PromotionsBenefitsPage;
else if (path === '/ecommerce/reportes') Page = EcommerceReportsPage;
else if (path === '/production/orders' || path === '/produccion') Page = ProductionOrdersPage;
else if (path === '/production/orders/new') Page = ProductionOrderCreatePage;
else if (productionOrderDetailMatch) Page = () => <ProductionOrderDetailPage orderId={Number(productionOrderDetailMatch[1])} />;
else if (productionOrderFinishMatch) Page = () => <ProductionOrderFinishPage orderId={Number(productionOrderFinishMatch[1])} />;
else if (path === '/production/recipes' || path === '/production/models-materials') Page = ProductionRecipesPage;
else if (productionModelDetailMatch) Page = () => <ProductionRecipesPage productId={Number(productionModelDetailMatch[1])} />;
else if (productionConfigurationMatch) Page = () => <ProductionConfigurationPage productId={Number(productionConfigurationMatch[1])} />;
else if (path === '/production/reports') Page = ProductionReportsDashboard;
else if (path === '/production/reports/detail') Page = ProductionReportsPage;
else if (path === '/production/reports/generate') Page = ProductionReportGeneratePage;
else if (path === '/recortes' || path === '/recortes/inventario') Page = RecortesInventoryPage;
else if (recorteDetailMatch) Page = () => <RecorteDetailPage recorteId={Number(recorteDetailMatch[1])}/>;
else if (path === '/recortes/movimientos') Page = RecortesMovementsPage;
else if (path === '/recortes/disenos') Page = RecortesInteligentesPage;
else if (disenoDetailMatch) Page = () => <RecorteDisenoDetailPage disenoId={Number(disenoDetailMatch[1])}/>;
else if (path === '/recortes/fabricacion') Page = RecortesFabricacionPage;
else if (path === '/recortes/reportes') Page = RecortesReportsPage;
else if (path === '/inventory/products') Page = ProductsPage;
else if (path === '/inventory/products/new') Page = () => <ProductsPage mode="create" />;
else if (productEditMatch) Page = () => <ProductsPage mode="edit" productId={Number(productEditMatch[1])} />;
else if (productDetailMatch) Page = () => <ProductsPage mode="detail" productId={Number(productDetailMatch[1])} />;
else if (path === '/inventory/supplies') Page = SuppliesPage;
else if (path === '/inventory/supplies/new') Page = () => <SuppliesPage mode="create" />;
else if (supplyEditMatch) Page = () => <SuppliesPage mode="edit" supplyId={Number(supplyEditMatch[1])} />;
else if (supplyDetailMatch) Page = () => <SuppliesPage mode="detail" supplyId={Number(supplyDetailMatch[1])} />;
else if (path === '/inventory/stock') Page = StockPage;
else if (path === '/inventory/movements') Page = MovementsPage;
else if (path === '/inventory/movements/new') Page = MovementCreatePage;
else if (movementDetailMatch) Page = () => <MovementDetailPage movementId={Number(movementDetailMatch[1])} />;
else if (path === '/inventory/dashboard') Page = InventoryDashboardPage;
else if (path === '/inventory/reports') Page = InventoryReportsHomePage;
else if (path === '/inventory/reports/3d') Page = InventoryReport3DPage;
else if (path === '/inventory/reports/generate') Page = InventoryReportGeneratePage;
else if (inventoryReportDetailMatch) Page = () => <InventoryReportDetailPage reportKey={inventoryReportDetailMatch[1] as InventoryReportKey} />;
else if (path === '/comercial/presupuestos/new') Page = () => <BudgetsPage mode="create" />;
else if (budgetEditMatch) Page = () => <BudgetsPage mode="edit" budgetId={Number(budgetEditMatch[1])} />;
else if (budgetDetailMatch) Page = () => <BudgetsPage mode="detail" budgetId={Number(budgetDetailMatch[1])} />;
else if (path === '/comercial/agenda/new') Page = () => <AgendaPage mode="create" />;
else if (activityEditMatch) Page = () => <AgendaPage mode="edit" activityId={Number(activityEditMatch[1])} />;
else if (activityDetailMatch) Page = () => <AgendaPage mode="detail" activityId={Number(activityDetailMatch[1])} />;
else if (path === '/comercial/oportunidades/new') Page = () => <OpportunitiesPage mode="create" />;
else if (opportunityEditMatch) Page = () => <OpportunitiesPage mode="edit" opportunityId={Number(opportunityEditMatch[1])} />;
else if (opportunityDetailMatch) Page = () => <OpportunitiesPage mode="detail" opportunityId={Number(opportunityDetailMatch[1])} />;
else if (path === '/comercial/consultas/new') Page = () => <ConsultationsPage mode="create" />;
else if (path === '/comercial/reportes/generar') Page = CommercialDashboard;
else if (consultationEditMatch) Page = () => <ConsultationsPage mode="edit" consultationId={Number(consultationEditMatch[1])} />;
else if (consultationDetailMatch) Page = () => <ConsultationsPage mode="detail" consultationId={Number(consultationDetailMatch[1])} />;
else if (path === '/comercial' || path === '/comercial/consultas' || path === '/comercial/whatsapp') Page = WhatsAppInboxPage;
else if (commercialSection && ['consultas','oportunidades','presupuestos','agenda','reportes'].includes(commercialSection)) Page = () => <CommercialPage section={commercialSection as 'consultas'|'oportunidades'|'presupuestos'|'agenda'|'reportes'} />;
else if (requiredMenu) Page = () => <ModulePlaceholderPage title={requiredMenu} />;
else Page = AccessDeniedPage;

return Page;
}

function AppRouter() {
  const [route, setRoute] = React.useState(() => `${location.pathname}${location.search}`);
  React.useEffect(() => {
    const update = () => setRoute(`${location.pathname}${location.search}`);
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, location.href);
      if (destination.origin !== location.origin || (destination.hash && destination.pathname === location.pathname && destination.search === location.search)) return;
      event.preventDefault();
      history.pushState(null, '', `${destination.pathname}${destination.search}${destination.hash}`);
      update();
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    addEventListener('popstate', update);
    document.addEventListener('click', navigate);
    return () => { removeEventListener('popstate', update); document.removeEventListener('click', navigate); };
  }, []);
  const Page = resolvePage();
  return <Page key={route}/>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AppRouter /></React.StrictMode>);
