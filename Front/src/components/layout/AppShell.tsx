import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, LogOut, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { clearSession, getSession } from '../../services/session';
import { hasPermission } from '../../services/authorization';
import { logoutSession } from '../../services/authApi';

type Props = { children: ReactNode; title: string; breadcrumb?: string; backHref?: string; backLabel?: string };

export function AppShell({ children, title, breadcrumb, backHref, backLabel = 'Volver' }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const session = getSession();
  const user = session?.usuario;
  const roles = session?.roles?.map(role => role.rolNombre).join(' · ') || 'Sin rol asignado';
  const displayName = user ? `${user.nombre}${user.apellido ? ` ${user.apellido}` : ''}` : 'Usuario';
  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2) || 'TM').toUpperCase();
  }, [displayName]);
  const breadcrumbParts = (breadcrumb || title).split('/').map(part => part.trim()).filter(Boolean);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await logoutSession(session?.auditoriaSesionId); }
    catch (error) { console.warn('La sesión local se cerró, pero no fue posible registrar el cierre remoto.', error); }
    finally { clearSession(); location.href = '/'; }
  }

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
    <div className="app-workspace">
      <header className="app-header">
        <div className="header-left">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(value => !value)} aria-label="Abrir menú"><MenuIcon size={20}/></button>
          <button className="collapse-button" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}>{collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}</button>
          {backHref && <a className="header-back-link" href={backHref} aria-label={backLabel} title={backLabel}><ArrowLeft size={18}/></a>}
          <nav className="breadcrumb" aria-label="Ruta actual">{breadcrumbParts.map((part, index) => <span key={`${part}-${index}`} className={index === breadcrumbParts.length - 1 ? 'current' : ''}>{part}{index < breadcrumbParts.length - 1 && <ChevronRight size={13}/>}</span>)}</nav>
        </div>
        <div className="header-right">
          <div className="user-menu" ref={profileRef}>
            <button type="button" className="user-menu-trigger" onClick={() => setProfileOpen(open => !open)} aria-haspopup="menu" aria-expanded={profileOpen}>
              <span className="user-avatar" aria-hidden="true">{initials}</span>
              <span className="user-menu-summary"><strong>{displayName}</strong><small>{roles}</small></span>
              <ChevronDown size={16} className={profileOpen ? 'rotated' : ''}/>
            </button>
            {profileOpen && <div className="user-dropdown" role="menu">
              <div className="user-dropdown-identity"><strong>{displayName}</strong><span>{user?.email || user?.username}</span><small>{roles}</small></div>
              {hasPermission('Configuración', 'Ver') && <a href="/configuracion" role="menuitem" onClick={() => setProfileOpen(false)}><Settings size={16}/> Configuración</a>}
              <button type="button" role="menuitem" onClick={() => void logout()} disabled={loggingOut}><LogOut size={16}/>{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
            </div>}
          </div>
        </div>
      </header>
      <main className="app-content">{children}</main>
      <footer className="app-footer"><span>TEKA Manager</span><span>Gestión integral · Córdoba</span></footer>
    </div>
  </div>;
}
