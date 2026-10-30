import { Toast } from '../../components/ui/Toast';
import { useEffect, useMemo, useState } from 'react';
import { Ban, ChevronLeft, ChevronRight, KeyRound, Download,LockKeyhole, Mail, Pencil, Plus, RotateCcw, Search, ShieldCheck, UserRoundCheck, UserRoundX, X, UserRound, CalendarDays, Clock3 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Modal } from '../../components/data/Modal';
import { PageHeader } from '../../components/data/PageHeader';
import { StatusBadge } from '../../components/data/StatusBadge';
import { usersAccessExcel, usersAccessPdf } from '../../services/securityReports';
import { auditApi, type AuditEvent, type AuditSession } from '../../services/auditApi';
import { usersApi, type Lookup, type Role, type User, type UserPayload } from '../../services/usersApi';

type FormState = UserPayload;
type FormErrors = Partial<Record<'username' | 'nombre' | 'apellido' | 'email' | 'roles', string>>;
type DeactivationErrors = Partial<Record<'reason' | 'note', string>>;

const usernameRegex = /^[A-Za-z0-9._-]+$/;
const personNameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserField(field: keyof FormErrors, form: FormState): string | undefined {
  if (field === 'username') {
    const value = form.username.trim();
    if (!value) return 'El nombre de usuario es obligatorio.';
    if (/\s/.test(form.username)) return 'El nombre de usuario no puede contener espacios.';
    if (!usernameRegex.test(form.username)) return 'Solo puede contener letras, números, punto, guion bajo y guion medio.';
    if (value.length < 3) return 'Debe tener al menos 3 caracteres.';
    if (value.length > 50) return 'No puede superar 50 caracteres.';
  }
  if (field === 'nombre') {
    const value = form.nombre.trim();
    if (!value) return 'El nombre es obligatorio.';
    if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (!personNameRegex.test(value)) return 'Solo puede contener letras, espacios, acentos y ñ.';
    if (value.length > 100) return 'El nombre no puede superar 100 caracteres.';
  }
  if (field === 'apellido') {
    const value = (form.apellido || '').trim();
    if (!value) return undefined;
    if (!personNameRegex.test(value)) return 'Solo puede contener letras, espacios, acentos y ñ.';
    if (value.length > 100) return 'El apellido no puede superar 100 caracteres.';
  }
  if (field === 'email') {
    const value = form.email.trim();
    if (!value) return 'El email es obligatorio.';
    if (/\s/.test(form.email)) return 'El email no puede contener espacios.';
    if (value.length > 150) return 'El email no puede superar 150 caracteres.';
    if (!emailRegex.test(value)) return 'Ingresá un email válido.';
  }
  if (field === 'roles' && form.rolIds.length !== 1) return 'Seleccioná un único rol.';
  return undefined;
}

function validateUserForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  (['username', 'nombre', 'apellido', 'email', 'roles'] as const).forEach((field) => {
    const message = validateUserField(field, form);
    if (message) errors[field] = message;
  });
  return errors;
}

function validateDeactivation(reasonId: string, note: string): DeactivationErrors {
  const errors: DeactivationErrors = {};
  if (!reasonId) errors.reason = 'Seleccioná un motivo de inactivación.';
  if (note && !note.trim()) errors.note = 'La observación no puede contener solo espacios.';
  else if (note.trim().length > 250) errors.note = 'La observación no puede superar 250 caracteres.';
  return errors;
}

const emptyForm: FormState = { username: '', nombre: '', apellido: '', email: '', rolIds: [] };
const PAGE_SIZE = 10;

function formatDate(value?: string) {
  if (!value) return 'Sin accesos registrados';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
function fullName(user: User) { return `${user.nombre}${user.apellido ? ` ${user.apellido}` : ''}`; }

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [reasons, setReasons] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditSessions, setAuditSessions] = useState<AuditSession[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'access' | 'security' | 'activity'>('info');
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formSubmitError, setFormSubmitError] = useState('');
  const [deactivating, setDeactivating] = useState<User | null>(null);
  const [reasonId, setReasonId] = useState('');
  const [reasonNote, setReasonNote] = useState('');
  const [deactivationErrors, setDeactivationErrors] = useState<DeactivationErrors>({});
  const [deactivationSubmitError, setDeactivationSubmitError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [u, r, m] = await Promise.all([usersApi.list(), usersApi.roles(), usersApi.inactivationReasons()]);
      setUsers(u); setRoles(r.filter((x) => x.activo)); setReasons(m);
      if (selected) setSelected(u.find((x) => x.usuarioId === selected.usuarioId) || null);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar los usuarios.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    Promise.all([auditApi.sessions(), auditApi.events()])
      .then(([sessions, events]) => { setAuditSessions(sessions); setAuditEvents(events); })
      .catch(() => { setAuditSessions([]); setAuditEvents([]); });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('es-AR');
    return users.filter((u) => {
      const text = `${u.username} ${u.nombre} ${u.apellido || ''} ${u.email}`.toLocaleLowerCase('es-AR');
      if (q && !text.includes(q)) return false;
      if (roleFilter && !u.roles.some((r) => String(r.rolId) === roleFilter)) return false;
      if (statusFilter === 'active' && !u.activo) return false;
      if (statusFilter === 'inactive' && u.activo) return false;
      if (accessFilter === 'blocked' && !u.bloqueado) return false;
      if (accessFilter === 'enabled' && u.bloqueado) return false;
      if (fromDate && (!u.ultimoLogin || new Date(u.ultimoLogin) < new Date(`${fromDate}T00:00:00`))) return false;
      if (toDate && (!u.ultimoLogin || new Date(u.ultimoLogin) > new Date(`${toDate}T23:59:59`))) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter, accessFilter, fromDate, toDate]);
  const filteredIds = useMemo(() => new Set(filtered.map(u => u.usuarioId)), [filtered]);
  const reportSessions = useMemo(() => auditSessions.filter(s => {
    if (!filteredIds.has(s.usuarioId)) return false;
    const date = new Date(s.fechaLogin);
    if (fromDate && date < new Date(`${fromDate}T00:00:00`)) return false;
    if (toDate && date > new Date(`${toDate}T23:59:59.999`)) return false;
    return true;
  }), [auditSessions, filteredIds, fromDate, toDate]);
  const reportEvents = useMemo(() => auditEvents.filter(e => {
    if (!filteredIds.has(e.usuarioId)) return false;
    const date = new Date(e.fechaEvento);
    if (fromDate && date < new Date(`${fromDate}T00:00:00`)) return false;
    if (toDate && date > new Date(`${toDate}T23:59:59.999`)) return false;
    return true;
  }), [auditEvents, filteredIds, fromDate, toDate]);
  const blockedCount = filtered.filter(u => u.bloqueado).length;
  const noLoginCount = filtered.filter(u => !u.ultimoLogin).length;
  const failedAttempts = filtered.reduce((sum,u) => sum + (u.intentosFallidos || 0), 0);
  const reportFilters = `Rol: ${roles.find(r => String(r.rolId) === roleFilter)?.nombre || 'Todos'} · Estado: ${statusFilter || 'Todos'} · Acceso: ${accessFilter || 'Todos'} · Período de acceso: ${fromDate || 'Inicio'} a ${toDate || 'Hoy'}`;

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, roleFilter, statusFilter, accessFilter, fromDate, toDate]);

  function openCreate() { setForm(emptyForm); setFormErrors({}); setFormSubmitError(''); setEditing('new'); }
  function openEdit(user: User) {
    setForm({ username: user.username, nombre: user.nombre, apellido: user.apellido || '', email: user.email, rolIds: user.roles.map((r) => r.rolId) });
    setFormErrors({});
    setFormSubmitError('');
    setEditing(user);
  }
  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    const next = { ...form, [field]: value };
    setForm(next);
    const errorKey = field === 'rolIds' ? 'roles' : field as keyof FormErrors;
    if (formErrors[errorKey]) setFormErrors((current) => ({ ...current, [errorKey]: validateUserField(errorKey, next) }));
  }
  function blurField(field: keyof FormErrors) {
    setFormErrors((current) => ({ ...current, [field]: validateUserField(field, form) }));
  }
  function selectRole(id: number) {
    updateForm('rolIds', [id]);
  }
  async function saveUser(e: React.FormEvent) {
    e.preventDefault(); setFormSubmitError('');
    const validation = validateUserForm(form);
    setFormErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        const result = await usersApi.create({ ...form, username: form.username.trim(), nombre: form.nombre.trim(), email: form.email.trim() });
        setNotice(result.mailEnviado ? 'Usuario creado. Enviamos un mail para que configure su contraseña.' : (result.mensaje || 'Usuario creado, pero no se pudo enviar el mail de acceso. Podés reenviarlo desde Seguridad.'));
      } else if (editing) {
        await usersApi.update(editing.usuarioId, form);
        setNotice('Los datos del usuario se actualizaron correctamente.');
      }
      setFormErrors({}); setEditing(null); await load();
    } catch (e) { setFormSubmitError(e instanceof Error ? e.message : 'No se pudo guardar el usuario.'); }
    finally { setSaving(false); }
  }
  async function run(action: () => Promise<unknown>, success: string) {
    setError('');
    try { await action(); setNotice(success); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la acción.'); }
  }
  function clearFilters() { setSearch(''); setRoleFilter(''); setStatusFilter(''); setAccessFilter(''); setFromDate(''); setToDate(''); }

  return <AppShell title="Usuarios" breadcrumb="Administración / Usuarios">
    <PageHeader kicker="ADMINISTRACIÓN" title="Usuarios" description="Administrá quién utiliza TEKA Manager, sus roles, estado y seguridad." action={<div className="report-actions"><button className="button secondary" onClick={() => usersAccessExcel(filtered, reportSessions, reportEvents, reportFilters)}> <Download size={16} /> Exportar Excel</button><button className="button primary" onClick={() => usersAccessPdf(filtered, reportSessions, reportEvents, reportFilters)}>Generar reporte</button><button className="button primary" onClick={openCreate}><Plus size={18}/> Ingresar usuario</button></div>} />
    <Toast message={notice} onClose={() => setNotice('')} />
    {error && <div className="inline-alert error"><Ban size={18}/><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}

    <section className="audit-filter-card users-filter-card">
      <div className="audit-filter-search"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por usuario, nombre o email"/></div>
      <label><span>Rol</span><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="">Todos</option>{roles.map((r) => <option key={r.rolId} value={r.rolId}>{r.nombre}</option>)}</select></label>
      <label><span>Estado</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
      <label><span>Acceso</span><select value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)}><option value="">Todos</option><option value="enabled">Habilitado</option><option value="blocked">Bloqueado</option></select></label>
      <label><span>Último acceso desde</span><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}/></label>
      <label><span>Hasta</span><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}/></label>
      <button className="button ghost audit-clear" onClick={clearFilters}><RotateCcw size={16}/> Limpiar</button>
    </section>

    <section className="audit-summary-strip users-summary-strip" aria-label="Resumen de usuarios filtrados">
      <div><UserRoundCheck/><span><b>{filtered.length}</b> usuarios</span></div>
      <div><ShieldCheck/><span><b>{reportSessions.length}</b> accesos en el período</span></div>
      <div className={blockedCount ? "attention" : ""}><LockKeyhole/><span><b>{blockedCount}</b> bloqueados</span></div>
      <div className={failedAttempts ? "attention" : ""}><ShieldCheck/><span><b>{failedAttempts}</b> intentos fallidos</span></div>
      <div><CalendarDays/><span><b>{noLoginCount}</b> sin acceso registrado</span></div>
      <p>Resumen calculado sobre los usuarios y fechas seleccionados.</p>
    </section>

    <div className={`users-master-detail ${selected ? 'with-detail' : ''}`}>
      <section className="table-card users-table-card">
        <div className="table-summary"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}<span>Seleccioná un usuario para consultar su detalle.</span></div>
        {loading ? <div className="state-box">Cargando usuarios…</div> : !visible.length ? <div className="state-box"><UsersEmpty/></div> : <div className="table-scroll"><table className="data-table"><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol/es</th><th>Estado</th><th>Último acceso</th><th></th></tr></thead><tbody>{visible.map((u) => <tr key={u.usuarioId} className={selected?.usuarioId === u.usuarioId ? 'selected-row' : ''} onClick={() => { setSelected(u); setDetailTab('info'); }}><td><strong>{u.username}</strong><small>{u.email}</small></td><td>{fullName(u)}</td><td><div className="role-list">{u.roles.length ? u.roles.map((r) => <span key={r.rolId}>{r.rolNombre}</span>) : <em>Sin rol</em>}</div></td><td><div className="status-stack"><StatusBadge tone={u.activo ? 'success' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</StatusBadge>{u.bloqueado && <StatusBadge tone="danger">Bloqueado</StatusBadge>}</div></td><td>{formatDate(u.ultimoLogin)}</td><td><button className="row-action compact" onClick={(e) => { e.stopPropagation(); setSelected(u); setDetailTab('info'); }} aria-label={`Ver detalle de ${fullName(u)}`}><ChevronRight size={17}/></button></td></tr>)}</tbody></table></div>}
        <div className="pagination"><span><strong>Mostrando {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} registros</strong> · Página {page} de {pages}</span><div><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={17}/></button><button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={17}/></button></div></div>
      </section>

      {selected && <aside className="user-detail-panel" aria-label={`Detalle de ${fullName(selected)}`}>
        <header className="detail-panel-header">
          <div className="detail-person">
            <span className="detail-avatar"><UserRound size={22}/></span>
            <div><h2>{fullName(selected)}</h2><p>{selected.email}</p></div>
          </div>
          <button className="detail-close" onClick={() => setSelected(null)} aria-label="Cerrar detalle"><X size={18}/></button>
          <div className="detail-account-state"><span>Cuenta</span><div className="status-stack"><StatusBadge tone={selected.activo ? 'success' : 'neutral'}>{selected.activo ? 'Activo' : 'Inactivo'}</StatusBadge>{selected.bloqueado && <StatusBadge tone="danger">Bloqueado</StatusBadge>}</div></div>
          <p className="detail-last-login"><Clock3 size={14}/> Último acceso: {formatDate(selected.ultimoLogin)}</p>
        </header>

        <div className="detail-tabs" role="tablist" aria-label="Detalle del usuario">
          <button className={detailTab === 'info' ? 'active' : ''} onClick={() => setDetailTab('info')}>Información</button>
          <button className={detailTab === 'access' ? 'active' : ''} onClick={() => setDetailTab('access')}>Accesos</button>
          <button className={detailTab === 'security' ? 'active' : ''} onClick={() => setDetailTab('security')}>Seguridad</button>
          <button className={detailTab === 'activity' ? 'active' : ''} onClick={() => setDetailTab('activity')}>Actividad</button>
        </div>

        <div className="detail-panel-body">
          {detailTab === 'info' && <section className="detail-tab-section">
            <Detail label="Usuario" value={selected.username}/>
            <Detail label="Nombre completo" value={fullName(selected)}/>
            <Detail label="Email" value={selected.email}/>
            <Detail label="Fecha de alta" value={formatDate(selected.fechaAlta)}/>
            {!selected.activo && <><Detail label="Motivo de inactivación" value={selected.motivoInactivacionUsuarioNombre || 'Sin información'}/><Detail label="Observación" value={selected.observacionInactivacion || 'Sin observación'}/></>}
          </section>}

          {detailTab === 'access' && <section className="detail-tab-section">
            <div className="detail-section-title"><ShieldCheck size={18}/><div><h3>Roles asignados</h3><p>Los permisos efectivos se administran desde Roles y accesos.</p></div></div>
            <div className="detail-role-list">{selected.roles.length ? selected.roles.map((role) => <span key={role.rolId}>{role.rolNombre}</span>) : <p className="muted-copy">Este usuario no tiene roles asignados.</p>}</div>
          </section>}

          {detailTab === 'security' && <section className="detail-tab-section">
            <div className="detail-section-title"><ShieldCheck size={18}/><div><h3>Seguridad de la cuenta</h3><p>Administrá el acceso sin conocer ni visualizar la contraseña.</p></div></div>
            <div className="security-facts vertical"><span><b>Intentos fallidos</b>{selected.intentosFallidos}</span><span><b>Acceso</b>{selected.bloqueado ? 'Bloqueado' : 'Habilitado'}</span></div>
            <div className="detail-actions vertical"><button className="button secondary" onClick={() => run(() => usersApi.sendPasswordRecovery(selected.usuarioId), 'Enviamos el mail para restablecer la contraseña.')}><Mail size={17}/> Enviar mail de restablecimiento</button>{selected.bloqueado ? <button className="button secondary" onClick={() => run(() => usersApi.unblock(selected.usuarioId), 'Usuario desbloqueado correctamente.')}><UserRoundCheck size={17}/> Desbloquear usuario</button> : <button className="button secondary" onClick={() => run(() => usersApi.block(selected.usuarioId), 'Usuario bloqueado correctamente.')}><LockKeyhole size={17}/> Bloquear acceso</button>}</div>
          </section>}

          {detailTab === 'activity' && <section className="detail-tab-section">
            <div className="detail-section-title"><CalendarDays size={18}/><div><h3>Actividad disponible</h3><p>Resumen construido únicamente con información real del usuario.</p></div></div>
            <div className="activity-list"><div><span>Alta de la cuenta</span><strong>{formatDate(selected.fechaAlta)}</strong></div><div><span>Último acceso</span><strong>{formatDate(selected.ultimoLogin)}</strong></div>{selected.fechaInactivacion && <div><span>Inactivación</span><strong>{formatDate(selected.fechaInactivacion)}</strong></div>}</div>
          </section>}
        </div>

        <footer className="detail-panel-footer">
          <button className="button secondary" onClick={() => openEdit(selected)}><Pencil size={16}/> Editar usuario</button>
          {selected.activo ? <button className="button danger-ghost" onClick={() => { setDeactivating(selected); setSelected(null); }}><UserRoundX size={17}/> Inactivar</button> : <button className="button secondary" onClick={() => run(() => usersApi.activate(selected.usuarioId), 'Usuario activado correctamente.')}><UserRoundCheck size={17}/> Activar</button>}
        </footer>
      </aside>}
    </div>

    {editing && <Modal title={editing === 'new' ? 'Ingresar usuario' : 'Editar usuario'} subtitle={editing === 'new' ? 'Creá el acceso y asigná sus funciones dentro de TEKA.' : 'Actualizá los datos y roles asignados.'} onClose={() => { setEditing(null); setFormErrors({}); setFormSubmitError(''); }}><form className="user-form" onSubmit={saveUser} noValidate>{formSubmitError && <div className="form-alert" role="alert"><Ban size={17}/><span>{formSubmitError}</span></div>}<div className="form-grid"><Field label="Usuario" required value={form.username} maxLength={50} error={formErrors.username} onBlur={() => blurField('username')} onChange={(v) => updateForm('username',v)}/><Field label="Nombre" required value={form.nombre} maxLength={100} error={formErrors.nombre} onBlur={() => blurField('nombre')} onChange={(v) => updateForm('nombre',v)}/><Field label="Apellido" value={form.apellido || ''} maxLength={100} error={formErrors.apellido} onBlur={() => blurField('apellido')} onChange={(v) => updateForm('apellido',v)}/><Field label="Email" required type="email" value={form.email} maxLength={150} error={formErrors.email} onBlur={() => blurField('email')} onChange={(v) => updateForm('email',v)}/></div><fieldset className={`role-picker ${formErrors.roles ? 'field-invalid' : ''}`}><legend>Roles <span className="required-mark">*</span></legend><p>Seleccioná una única función. Los permisos se administran desde Roles y accesos.</p>{roles.map((r) => <label key={r.rolId}><input type="radio" name="usuario-rol" checked={form.rolIds[0] === r.rolId} onChange={() => selectRole(r.rolId)} onBlur={() => blurField('roles')}/><span><b>{r.nombre}</b>{r.descripcion && <small>{r.descripcion}</small>}</span></label>)}{formErrors.roles && <p className="field-error">{formErrors.roles}</p>}</fieldset>{editing === 'new' && <div className="form-info"><KeyRound size={18}/><span>No definís una contraseña. Al crear el usuario, TEKA le enviará un mail seguro para que configure la suya.</span></div>}<div className="modal-actions"><button type="button" className="button ghost" onClick={() => { setEditing(null); setFormErrors({}); setFormSubmitError(''); }}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Guardando…' : editing === 'new' ? 'Crear usuario' : 'Guardar cambios'}</button></div></form></Modal>}

    {deactivating && <Modal title="Inactivar usuario" subtitle={`El acceso de ${fullName(deactivating)} quedará deshabilitado.`} onClose={() => { setDeactivating(null); setDeactivationErrors({}); setDeactivationSubmitError(''); }}><div className="user-form">{deactivationSubmitError && <div className="form-alert" role="alert"><Ban size={17}/><span>{deactivationSubmitError}</span></div>}<label className={`plain-field ${deactivationErrors.reason ? 'field-invalid' : ''}`}><span>Motivo <span className="required-mark">*</span></span><select value={reasonId} aria-invalid={Boolean(deactivationErrors.reason)} onChange={(e) => { setReasonId(e.target.value); if (deactivationErrors.reason) setDeactivationErrors((current) => ({...current, reason: e.target.value ? undefined : 'Seleccioná un motivo de inactivación.'})); }} onBlur={() => setDeactivationErrors((current) => ({...current, reason: reasonId ? undefined : 'Seleccioná un motivo de inactivación.'}))}><option value="">Seleccioná un motivo</option>{reasons.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}</select>{deactivationErrors.reason && <p className="field-error">{deactivationErrors.reason}</p>}</label><label className={`plain-field ${deactivationErrors.note ? 'field-invalid' : ''}`}><span>Observación</span><textarea maxLength={250} aria-invalid={Boolean(deactivationErrors.note)} value={reasonNote} onChange={(e) => { setReasonNote(e.target.value); if (deactivationErrors.note) setDeactivationErrors((current) => ({...current, note: validateDeactivation(reasonId, e.target.value).note})); }} onBlur={() => setDeactivationErrors((current) => ({...current, note: validateDeactivation(reasonId, reasonNote).note}))} placeholder="Información adicional (opcional)"/>{deactivationErrors.note && <p className="field-error">{deactivationErrors.note}</p>}</label><div className="modal-actions"><button className="button ghost" onClick={() => { setDeactivating(null); setDeactivationErrors({}); }}>Cancelar</button><button className="button danger" disabled={saving} onClick={async () => { const validation = validateDeactivation(reasonId, reasonNote); setDeactivationErrors(validation); if (Object.keys(validation).length) return; setSaving(true); setDeactivationSubmitError(''); try { await usersApi.deactivate(deactivating.usuarioId, Number(reasonId), reasonNote.trim()); setNotice('Usuario inactivado correctamente.'); setDeactivating(null); setReasonId(''); setReasonNote(''); setDeactivationErrors({}); await load(); } catch (e) { setDeactivationSubmitError(e instanceof Error ? e.message : 'No se pudo inactivar el usuario.'); } finally { setSaving(false); } }}>{saving ? 'Inactivando…' : 'Inactivar usuario'}</button></div></div></Modal>}
  </AppShell>;
}

function Field({ label, value, onChange, onBlur, type='text', error, required=false, maxLength }: { label:string; value:string; onChange:(v:string)=>void; onBlur?:()=>void; type?:string; error?:string; required?:boolean; maxLength?:number }) { return <label className={`plain-field ${error ? 'field-invalid' : ''}`}><span>{label}{required && <span className="required-mark"> *</span>}</span><input type={type} value={value} maxLength={maxLength} aria-invalid={Boolean(error)} onChange={(e)=>onChange(e.target.value)} onBlur={onBlur}/>{error && <p className="field-error">{error}</p>}</label>; }
function Detail({label,value}:{label:string;value:string}) { return <div className="detail-row"><span>{label}</span><strong>{value}</strong></div>; }
function UsersEmpty(){ return <><UserRoundCheck size={28}/><strong>No encontramos usuarios</strong><span>Probá cambiando o limpiando los filtros.</span></>; }
