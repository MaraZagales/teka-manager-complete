import {
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Factory,
  WalletCards,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShieldCheck,
  ScrollText,
  ShoppingBag,
  PackageCheck,
  Tags,
  FileBarChart,
  ArrowLeftRight,
  ShoppingCart,
  Store,
  CalendarDays,
  Target,
  Inbox,
  UsersRound,
  Wrench,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { hasPermission } from "../../services/authorization";

type Item = {
  label: string;
  menu: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};
const primary: Item[] = [
  {
    label: "Inicio",
    menu: "Inicio",
    href: "/inicio",
    icon: LayoutDashboard,
  },
  {
    label: "Comercial",
    menu: "Comercial",
    href: "/comercial",
    icon: Store,
  },
  {
    label: "Ventas",
    menu: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
  },
  {
    label: "Caja",
    menu: "Caja",
    href: "/caja/diaria",
    icon: WalletCards,
  },
  {
    label: "Inventario",
    menu: "Inventario",
    href: "/inventario",
    icon: Boxes,
    disabled: true,
  },
  {
    label: "Producción",
    menu: "Producción",
    href: "/production/orders",
    icon: Factory,
  },
  {
    label: "Recortes / GIR",
    menu: "Recortes / GIR",
    href: "/recortes/inventario",
    icon: PackageSearch,
  },
  {
    label: "Compras",
    menu: "Compras",
    href: "/compras",
    icon: ClipboardList,
    disabled: true,
  },
  {
    label: "Proveedores",
    menu: "Proveedores",
    href: "/proveedores",
    icon: Wrench,
    disabled: true,
  },
  {
    label: "Costos y precios",
    menu: "Costos y precios",
    href: "/costos",
    icon: CircleDollarSign,
    disabled: true,
  },
  {
    label: "E-commerce",
    menu: "E-commerce",
    href: "/ecommerce",
    icon: ShoppingBag,
  },
  {
    label: "Reportes",
    menu: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    disabled: true,
  },
];
const admin: Item[] = [
  { label: "Usuarios", menu: "Usuarios", href: "/usuarios", icon: UsersRound },
  {
    label: "Roles y accesos",
    menu: "Roles y accesos",
    href: "/roles",
    icon: ShieldCheck,
  },
  {
    label: "Auditoría",
    menu: "Auditoría",
    href: "/auditoria",
    icon: ScrollText,
  },
  {
    label: "Configuración",
    menu: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
];
const isActive = (current: string, href: string) =>
  current === href || current.startsWith(`${href}/`) ||
  (href === '/caja/movimientos' && current.startsWith('/caja/cierres/'));

export function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const current = location.pathname;
  const adminRouteActive = admin.some((item) => isActive(current, item.href));
  const [adminOpen, setAdminOpen] = useState<boolean>(true);
  const [ecommerceOpen, setEcommerceOpen] = useState<boolean>(current.startsWith("/ecommerce"));
  const [commercialOpen, setCommercialOpen] = useState<boolean>(current.startsWith("/comercial"));
  const [salesOpen, setSalesOpen] = useState<boolean>(current.startsWith("/ventas"));
  const [cashOpen, setCashOpen] = useState<boolean>(current.startsWith("/caja"));
  const [inventoryOpen, setInventoryOpen] = useState<boolean>(current.startsWith("/inventory"));
  const [productionOpen, setProductionOpen] = useState<boolean>(current.startsWith("/production") || current === "/produccion");
  const [recortesOpen, setRecortesOpen] = useState<boolean>(current.startsWith('/recortes'));
  const navRef = useRef<HTMLElement>(null);
  const visiblePrimary = primary.filter((item) =>
    hasPermission(item.menu, "Ver") || (item.menu === 'Ventas' && hasPermission('Costos y precios', 'Ver')),
  );
  const visibleAdmin = admin.filter((item) => hasPermission(item.menu, "Ver"));

  useEffect(() => {
    if (adminRouteActive) setAdminOpen(true);
  }, [adminRouteActive, current]);
  useEffect(() => {
    if (current.startsWith("/comercial")) setCommercialOpen(true);
  }, [current]);
  useEffect(() => {
    if (current.startsWith("/ecommerce")) setEcommerceOpen(true);
  }, [current]);
  useEffect(() => {
    if (current.startsWith("/inventory")) setInventoryOpen(true);
  }, [current]);
  useEffect(() => {
    if (current.startsWith("/production") || current === "/produccion") setProductionOpen(true);
  }, [current]);
  useEffect(() => { if (current.startsWith('/recortes')) setRecortesOpen(true); }, [current]);
  useEffect(() => {
    if (current.startsWith("/ventas")) setSalesOpen(true);
  }, [current]);
  useEffect(() => {
    if (current.startsWith("/caja")) setCashOpen(true);
  }, [current]);
  useEffect(() => {
    const active =
      navRef.current?.querySelector<HTMLElement>(".nav-item.active");
    active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [current, adminOpen, commercialOpen, ecommerceOpen, salesOpen, cashOpen, inventoryOpen, productionOpen, recortesOpen, collapsed]);

  const commercialChildren: Item[] = [
    { label: 'Consultas Comerciales', menu: 'Comercial', href: '/comercial/consultas', icon: Inbox },
    { label: 'Oportunidades', menu: 'Comercial', href: '/comercial/oportunidades', icon: Target },
    { label: 'Presupuestos', menu: 'Comercial', href: '/comercial/presupuestos', icon: FileBarChart },
    { label: 'Agenda', menu: 'Comercial', href: '/comercial/agenda', icon: CalendarDays },
    { label: 'Reportes', menu: 'Comercial', href: '/comercial/reportes', icon: BarChart3 },
  ];
  const inventoryChildren: Item[] = [
    { label: 'Productos terminados', menu: 'Inventario', href: '/inventory/products', icon: PackageSearch },
    { label: 'Insumos', menu: 'Inventario', href: '/inventory/supplies', icon: Boxes },
    { label: 'Existencias', menu: 'Inventario', href: '/inventory/stock', icon: PackageCheck },
    { label: 'Movimientos de stock', menu: 'Inventario', href: '/inventory/movements', icon: ArrowLeftRight },
    { label: 'Reportes', menu: 'Inventario', href: '/inventory/reports', icon: FileBarChart },
  ];
  const salesChildren: Item[] = [
    { label: 'Pedidos', menu: 'Ventas', href: '/ventas/pedidos', icon: ClipboardList },
    { label: 'Clientes', menu: 'Ventas', href: '/ventas/clientes', icon: UsersRound },
    { label: 'Precios de venta', menu: 'Costos y precios', href: '/ventas/precios', icon: Tags },
    { label: 'Reportes', menu: 'Ventas', href: '/ventas/reportes', icon: FileBarChart },
  ];
  const productionChildren: Item[] = [
    { label: 'Órdenes de producción', menu: 'Producción', href: '/production/orders', icon: ClipboardList },
    { label: 'Modelos y materiales', menu: 'Producción', href: '/production/models-materials', icon: Boxes },
    { label: 'Reportes', menu: 'Producción', href: '/production/reports', icon: FileBarChart },
  ];
  const recortesChildren: Item[] = [
    { label: 'Inventario de recortes', menu: 'Recortes / GIR', href: '/recortes/inventario', icon: PackageSearch },
    { label: 'Movimientos de recortes', menu: 'Recortes / GIR', href: '/recortes/movimientos', icon: ArrowLeftRight },
    { label: 'Diseños con IA', menu: 'Recortes / GIR', href: '/recortes/disenos', icon: Sparkles },
    { label: 'Fabricación', menu: 'Recortes / GIR', href: '/recortes/fabricacion', icon: Factory },
    { label: 'Reportes', menu: 'Recortes / GIR', href: '/recortes/reportes', icon: FileBarChart },
  ];
  const cashChildren: Item[] = [
    { label: 'Caja diaria', menu: 'Caja', href: '/caja/diaria', icon: WalletCards },
    { label: 'Movimientos', menu: 'Caja', href: '/caja/movimientos', icon: ArrowLeftRight },
    { label: 'Conciliaciones bancarias', menu: 'Caja', href: '/caja/conciliaciones-bancarias', icon: Building2 },
    { label: 'Reportes', menu: 'Caja', href: '/caja/reportes', icon: FileBarChart },
  ];
  const ecommerceChildren: Item[] = [
    { label: 'Catálogo', menu: 'E-commerce', href: '/ecommerce/catalogo', icon: ShoppingBag },
    { label: 'Actividad online', menu: 'E-commerce', href: '/ecommerce/actividad', icon: ClipboardList },
    { label: 'Promociones', menu: 'E-commerce', href: '/ecommerce/promociones', icon: Tags },
    { label: 'Reportes', menu: 'E-commerce', href: '/ecommerce/reportes', icon: FileBarChart },
  ];
  const renderItem = (item: Item) => {
    const Icon = item.icon;
    const active = ["/comercial", "/ecommerce"].includes(item.href) ? current === item.href : isActive(current, item.href);
    return (
      <a
        key={item.label}
        href={item.disabled ? undefined : item.href}
        aria-current={active ? "page" : undefined}
        onClick={item.disabled ? (e) => e.preventDefault() : onNavigate}
        className={`nav-item ${active ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={19} />
        <span>{item.label}</span>
      </a>
    );
  };
  const renderSubItem = (item: Item) => {
    const active = ["/comercial", "/ecommerce"].includes(item.href) ? current === item.href : isActive(current, item.href);
    return (
      <a
        key={item.label}
        href={item.disabled ? undefined : item.href}
        aria-current={active ? "page" : undefined}
        onClick={item.disabled ? (event) => event.preventDefault() : onNavigate}
        className={`nav-subitem ${active ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
      >
        <span className="nav-subitem-marker" aria-hidden="true">{active ? "+" : ""}</span>
        <span>{item.label}</span>
      </a>
    );
  };
  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <a className="sidebar-brand" href="/inicio" onClick={onNavigate} aria-label="Ir al inicio">
        <strong>TEKA</strong>
        <span>MANAGER</span>
      </a>
      <nav className="sidebar-nav" ref={navRef}>
        <div className="nav-section">
          {visiblePrimary.map((item) => {
            if (item.menu === "Ventas") {
              const groupActive = current === '/ventas' || current.startsWith('/ventas/');
              return <div key="sales" className="commercial-nav-group">
                {collapsed ? <a className={`nav-item ${groupActive ? 'active' : ''}`} href="/ventas/pedidos" title="Ventas" aria-label="Ventas" onClick={onNavigate}><ShoppingCart size={19} /></a> : <>
                  <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? 'has-active' : ''}`} onClick={() => setSalesOpen(open => !open)} aria-expanded={salesOpen} aria-controls="sales-submenu">
                    <span><ShoppingCart size={17} /> Ventas</span><ChevronDown size={15} className={salesOpen ? 'rotated' : ''} />
                  </button>
                  {salesOpen && <div id="sales-submenu" className="commercial-nav-children">{salesChildren.filter(item=>hasPermission(item.menu,'Ver')).map(renderSubItem)}</div>}
                </>}
              </div>;
            }
            if (item.menu === "Inventario") {
              const groupActive = current.startsWith('/inventory');
              return <div key="inventory" className="commercial-nav-group">
                {collapsed ? <a className={`nav-item ${groupActive ? 'active' : ''}`} href="/inventory/products" title="Inventario" aria-label="Inventario" onClick={onNavigate}><Boxes size={19} /></a> : <>
                  <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? 'has-active' : ''}`} onClick={() => setInventoryOpen(open => !open)} aria-expanded={inventoryOpen} aria-controls="inventory-submenu">
                    <span><Boxes size={17} /> Inventario</span><ChevronDown size={15} className={inventoryOpen ? 'rotated' : ''} />
                  </button>
                  {inventoryOpen && <div id="inventory-submenu" className="commercial-nav-children">{inventoryChildren.map(renderSubItem)}</div>}
                </>}
              </div>;
            }
            if (item.menu === "Producción") {
              const groupActive = current === '/produccion' || current.startsWith('/production');
              return <div key="production" className="commercial-nav-group">
                {collapsed ? <a className={`nav-item ${groupActive ? 'active' : ''}`} href="/production/orders" title="Producción" aria-label="Producción" onClick={onNavigate}><Factory size={19} /></a> : <>
                  <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? 'has-active' : ''}`} onClick={() => setProductionOpen(open => !open)} aria-expanded={productionOpen} aria-controls="production-submenu">
                    <span><Factory size={17} /> Producción</span><ChevronDown size={15} className={productionOpen ? 'rotated' : ''} />
                  </button>
                  {productionOpen && <div id="production-submenu" className="commercial-nav-children">{productionChildren.map(renderSubItem)}</div>}
                </>}
              </div>;
            }
            if (item.menu === 'Recortes / GIR') {
              const groupActive = current.startsWith('/recortes');
              return <div key="recortes" className="commercial-nav-group">
                {collapsed ? <a className={`nav-item ${groupActive ? 'active' : ''}`} href="/recortes/inventario" title="Recortes / GIR" aria-label="Recortes / GIR" onClick={onNavigate}><PackageSearch size={19}/></a> : <>
                  <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? 'has-active' : ''}`} onClick={() => setRecortesOpen(open => !open)} aria-expanded={recortesOpen} aria-controls="recortes-submenu">
                    <span><PackageSearch size={17}/> Recortes / GIR</span><ChevronDown size={15} className={recortesOpen ? 'rotated' : ''}/>
                  </button>
                  {recortesOpen && <div id="recortes-submenu" className="commercial-nav-children">{recortesChildren.map(renderSubItem)}</div>}
                </>}
              </div>;
            }
            if (item.menu === "Caja") {
              const groupActive = current.startsWith('/caja');
              return <div key="cash" className="commercial-nav-group">
                {collapsed ? <a className={`nav-item ${groupActive ? 'active' : ''}`} href="/caja/diaria" title="Caja" aria-label="Caja" onClick={onNavigate}><WalletCards size={19} /></a> : <>
                  <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? 'has-active' : ''}`} onClick={() => setCashOpen(open => !open)} aria-expanded={cashOpen} aria-controls="cash-submenu">
                    <span><WalletCards size={17} /> Caja</span><ChevronDown size={15} className={cashOpen ? 'rotated' : ''} />
                  </button>
                  {cashOpen && <div id="cash-submenu" className="commercial-nav-children">{cashChildren.map(renderSubItem)}</div>}
                </>}
              </div>;
            }
            if (item.menu === "E-commerce") {
              const groupActive = current === '/ecommerce' || current.startsWith('/ecommerce/');
              return <div key="ecommerce" className="commercial-nav-group">
                {collapsed ? <a className={`nav-item ${groupActive ? 'active' : ''}`} href="/ecommerce/catalogo" title="E-commerce" aria-label="E-commerce" onClick={onNavigate}><ShoppingBag size={19} /></a> : <>
                  <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? 'has-active' : ''}`} onClick={() => setEcommerceOpen(open => !open)} aria-expanded={ecommerceOpen} aria-controls="ecommerce-submenu">
                    <span><ShoppingBag size={17} /> E-commerce</span><ChevronDown size={15} className={ecommerceOpen ? 'rotated' : ''} />
                  </button>
                  {ecommerceOpen && <div id="ecommerce-submenu" className="commercial-nav-children">{ecommerceChildren.map(renderSubItem)}</div>}
                </>}
              </div>;
            }
            if (item.menu !== "Comercial") return renderItem(item);
            const groupActive = current === "/comercial" || current.startsWith("/comercial/");
            return (
              <div key="commercial" className="commercial-nav-group">
                {collapsed ? (
                  <a className={`nav-item ${groupActive ? "active" : ""}`} href="/comercial" title="Comercial" aria-label="Comercial" onClick={onNavigate}>
                    <Store size={19} />
                  </a>
                ) : (
                  <>
                    <button type="button" className={`nav-group-title commercial-nav-toggle ${groupActive ? "has-active" : ""}`}
                      onClick={() => setCommercialOpen((open) => !open)} aria-expanded={commercialOpen} aria-controls="commercial-submenu">
                      <span><Store size={17} /> Comercial</span>
                      <ChevronDown size={15} className={commercialOpen ? "rotated" : ""} />
                    </button>
                    {commercialOpen && (
                      <div id="commercial-submenu" className="commercial-nav-children">
                        {commercialChildren.map(renderSubItem)}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        {visibleAdmin.length > 0 && (
          <div className="nav-section admin-section">
            <button
              className={`nav-group-title ${adminRouteActive ? "has-active" : ""}`}
              onClick={() => setAdminOpen((v) => !v)}
            >
              <span>ADMINISTRACIÓN</span>
              <ChevronDown size={15} className={adminOpen ? "rotated" : ""} />
            </button>
            {adminOpen && visibleAdmin.map(renderItem)}
          </div>
        )}
      </nav>
      <div className="sidebar-note">
        {collapsed ? "TM" : "Del taller al cliente"}
      </div>
    </aside>
  );
}
