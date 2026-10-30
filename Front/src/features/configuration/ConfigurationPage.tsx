import { ArrowLeft, ArrowRight, Factory, ShoppingCart, WalletCards } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { hasPermission } from '../../services/authorization';
import './configuration.css';

type Section = 'home' | 'sales' | 'cash';

export function ConfigurationPage({ section = 'home' }: { section?: Section }) {
  const sales = hasPermission('Costos y precios', 'Ver');
  const addressTypes = hasPermission('Ventas', 'Ver');
  const cash = hasPermission('Caja', 'Ver');
  const entries = section === 'home'
    ? [
        ...(sales || addressTypes ? [{ name: 'Ventas', description: 'Parámetros comerciales y tipos de domicilio.', href: '/configuracion/ventas', count: Number(sales) + Number(addressTypes), icon: ShoppingCart }] : []),
        ...(cash ? [{ name: 'Caja', description: 'Fondo fijo y conceptos de caja.', href: '/configuracion/caja', count: 2, icon: WalletCards }] : []),
        ...(hasPermission('Configuraci\u00f3n', 'Ver') ? [{ name: 'Producci\u00f3n', description: 'Plantillas t\u00e9cnicas, formatos y par\u00e1metros de corte.', href: '/configuracion/produccion', count: 4, icon: Factory }] : []),
      ]
    : section === 'sales'
      ? [...(sales ? [{ name: 'Parámetros de costos y precios', description: 'Configuración general y por tipo de producto.', href: '/configuracion/ventas/parametros-costos-precios', count: null, icon: ShoppingCart }] : []),
         ...(addressTypes ? [{ name: 'Tipos de domicilio', description: 'Catálogo utilizado en las direcciones de clientes.', href: '/configuracion/ventas/tipos-domicilio', count: null, icon: ShoppingCart }] : [])]
      : [{ name: 'Conceptos de caja', description: 'Consulta y administración de conceptos de movimientos.', href: '/configuracion/caja/conceptos', count: null, icon: WalletCards },
         ...(hasPermission('Caja','Editar')?[{ name: 'Fondo fijo', description: 'Importe de referencia para la apertura de Caja Principal.', href: '/configuracion/caja/fondo-fijo', count: null, icon: WalletCards }]:[])];
  const title = section === 'home' ? 'Configuración' : section === 'sales' ? 'Ventas' : 'Caja';
  return <AppShell title={title} breadcrumb={section === 'home' ? 'Administración / Configuración' : `Administración / Configuración / ${title}`}>
    <div className="configuration-page">
      {section !== 'home' && <a className="configuration-back" href="/configuracion"><ArrowLeft size={16}/> Configuración</a>}
      <PageHeader title={title} description={section === 'home' ? 'Administrá las configuraciones disponibles por módulo.' : undefined}/>
      {entries.length ? <div className="configuration-grid">{entries.map(entry => <a className="configuration-card" href={entry.href} key={entry.href}>
        <span className="configuration-icon"><entry.icon size={22}/></span>
        <strong>{entry.name}</strong><span>{entry.description}</span>
        <span className="configuration-card-foot">{entry.count !== null && `${entry.count} configuración disponible`}<ArrowRight size={17}/></span>
      </a>)}</div> : <div className="state-box">No hay configuraciones disponibles para tus permisos.</div>}
    </div>
  </AppShell>;
}
