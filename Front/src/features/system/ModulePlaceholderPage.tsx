import { AppShell } from '../../components/layout/AppShell';

export function ModulePlaceholderPage({ title }: { title: string }) {
  return <AppShell title={title} breadcrumb={title}>
    <section className="page-header"><div><span className="eyebrow">TEKA MANAGER</span><h1>{title}</h1><p>Tenés acceso a este módulo. Su nueva versión se incorporará en las próximas etapas del proyecto.</p></div></section>
  </AppShell>;
}

export function AccessDeniedPage() {
  return <div className="auth-state-page"><div className="auth-state-card"><h1>Acceso no autorizado</h1><p>Tu rol no tiene permiso para ingresar a esta sección.</p><button className="button primary" onClick={() => history.back()}>Volver</button></div></div>;
}
