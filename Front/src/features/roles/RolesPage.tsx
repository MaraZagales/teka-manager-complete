import { Toast } from '../../components/ui/Toast';
import { useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Plus, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Modal } from '../../components/data/Modal';
import { PageHeader } from '../../components/data/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { DataTableFilters } from '../../components/data/DataTableFilters';
import { rolesApi, type Menu, type Permission, type Role, type RolePermission, type RolePayload, type User } from '../../services/rolesApi';

type RoleFormErrors = Partial<Record<'nombre' | 'descripcion', string>>;
const emptyRole: RolePayload = { nombre: '', descripcion: '', activo: true };
const PAGE_SIZE = 10;

function validateRole(form: RolePayload): RoleFormErrors {
  const errors: RoleFormErrors = {};
  const name = form.nombre.trim();
  const description = (form.descripcion || '').trim();
  if (!name) errors.nombre = 'El nombre del rol es obligatorio.';
  else if (name.length < 3) errors.nombre = 'Debe tener al menos 3 caracteres.';
  else if (name.length > 50) errors.nombre = 'No puede superar 50 caracteres.';
  if ((form.descripcion || '').length > 250) errors.descripcion = 'La descripción no puede superar 250 caracteres.';
  else if (form.descripcion && !description) errors.descripcion = 'La descripción no puede contener solo espacios.';
  return errors;
}

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Role | null>(null);
  const [assigned, setAssigned] = useState<RolePermission[]>([]);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Role | 'new' | null>(null);
  const [form, setForm] = useState<RolePayload>(emptyRole);
  const [formErrors, setFormErrors] = useState<RoleFormErrors>({});
  const [formSubmitError, setFormSubmitError] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [showAssignedUsers, setShowAssignedUsers] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const [r, m, p, u] = await Promise.all([rolesApi.list(), rolesApi.menus(), rolesApi.permissions(), rolesApi.users()]);
      setRoles(r); setMenus(m.filter(x => x.activo)); setPermissions(p.filter(x => x.activo)); setUsers(u);
      if (selected) setSelected(r.find(x => x.rolId === selected.rolId) || null);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar Roles y accesos.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function selectRole(role: Role) {
    setSelected(role); setMatrixLoading(true); setError('');
    try {
      const rp = await rolesApi.rolePermissions(role.rolId);
      setAssigned(rp);
      setDraft(new Set(rp.map(x => `${x.menuId}:${x.permisoId}`)));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar los permisos del rol.'); }
    finally { setMatrixLoading(false); }
  }

  const filtered = useMemo(() => roles.filter(role => {
    const q = search.trim().toLocaleLowerCase('es-AR');
    if (q && !`${role.nombre} ${role.descripcion || ''}`.toLocaleLowerCase('es-AR').includes(q)) return false;
    if (status === 'active' && !role.activo) return false;
    if (status === 'inactive' && role.activo) return false;
    return true;
  }), [roles, search, status]);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, status]);

  const activePermissions = permissions.slice().sort((a,b) => a.permisoId - b.permisoId);
  const activeMenus = menus.slice().sort((a,b) => a.ordenVisual - b.ordenVisual || a.nombre.localeCompare(b.nombre));
  const assignedKeys = useMemo(() => new Set(assigned.map(x => `${x.menuId}:${x.permisoId}`)), [assigned]);
  const dirty = assignedKeys.size !== draft.size || [...draft].some(k => !assignedKeys.has(k));
  const userCount = (roleId: number) => users.filter(u => u.activo && u.roles.some(r => r.rolId === roleId)).length;

  function toggle(menuId: number, permissionId: number) {
    if (!selected?.activo) return;
    const key = `${menuId}:${permissionId}`;
    setDraft(current => { const next = new Set(current); next.has(key) ? next.delete(key) : next.add(key); return next; });
  }

  async function saveMatrix() {
    if (!selected || !dirty) return;
    setSavingMatrix(true); setError('');
    try {
      const toAdd = [...draft].filter(k => !assignedKeys.has(k));
      const toRemove = assigned.filter(x => !draft.has(`${x.menuId}:${x.permisoId}`));
      for (const item of toRemove) await rolesApi.removePermission(item.rolPermisoId);
      for (const key of toAdd) {
        const [menuId, permissionId] = key.split(':').map(Number);
        await rolesApi.addPermission(selected.rolId, menuId, permissionId);
      }
      const rp = await rolesApi.rolePermissions(selected.rolId);
      setAssigned(rp); setDraft(new Set(rp.map(x => `${x.menuId}:${x.permisoId}`)));
      setNotice('Permisos del rol actualizados correctamente.');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron guardar los permisos.'); }
    finally { setSavingMatrix(false); }
  }

  function openCreate() { setForm(emptyRole); setFormErrors({}); setFormSubmitError(''); setEditing('new'); }
  function openEdit(role: Role) { setForm({ nombre: role.nombre, descripcion: role.descripcion || '', activo: role.activo }); setFormErrors({}); setFormSubmitError(''); setEditing(role); }
  async function saveRole(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateRole(form); setFormErrors(validation); setFormSubmitError('');
    if (Object.keys(validation).length) return;
    setSavingRole(true);
    try {
      if (editing === 'new') {
        await rolesApi.create({ ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() || undefined });
        setNotice('Rol creado correctamente. Ahora podés configurar sus accesos.');
      } else if (editing) {
        await rolesApi.update(editing.rolId, { ...form, nombre: form.nombre.trim(), descripcion: form.descripcion?.trim() || undefined });
        setNotice('Rol actualizado correctamente.');
      }
      setEditing(null); await load();
    } catch (e) { setFormSubmitError(e instanceof Error ? e.message : 'No se pudo guardar el rol.'); }
    finally { setSavingRole(false); }
  }

  const roleColumns: DataTableColumn<Role>[] = [
    { key: 'role', header: 'Rol', render: role => <><strong>{role.nombre}</strong><small>{role.descripcion || 'Sin descripción'}</small></> },
    { key: 'users', header: 'Usuarios', render: role => <button className="role-users-link" onClick={(e) => { e.stopPropagation(); setSelected(role); setShowAssignedUsers(true); }}><UsersRound size={15}/>{userCount(role.rolId)}</button> },
    { key: 'status', header: 'Estado', render: role => <span className={`status-badge ${role.activo ? 'success' : 'neutral'}`}>{role.activo ? 'Activo' : 'Inactivo'}</span> },
    { key: 'detail', header: '', className: 'chevron-cell', render: () => '›' },
  ];

  return <AppShell title="Roles y accesos" breadcrumb="Administración / Roles y accesos">
    <PageHeader kicker="ADMINISTRACIÓN" title="Roles y accesos" description="Definí qué áreas y operaciones puede utilizar cada función dentro de TEKA." action={<button className="button primary" onClick={openCreate}><Plus size={18}/> Ingresar rol</button>} />
    <Toast message={notice} onClose={() => setNotice('')} />
    {error && <div className="inline-alert error"><ShieldCheck size={18}/><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}

    <DataTableFilters
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por nombre o descripción"
      onClear={() => { setSearch(''); setStatus('active'); }}
      className="roles-filter-card"
    >
      <label className="data-table-filter-field"><span>Estado</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
    </DataTableFilters>

    <div className={`roles-workbench ${selected ? 'with-role-detail' : ''}`}>
      <DataTable<Role>
        rows={visible}
        columns={roleColumns}
        rowKey={role => role.rolId}
        loading={loading}
        loadingText="Cargando roles…"
        emptyState={<div className="state-box"><ShieldCheck size={28}/><strong>No encontramos roles</strong><span>Probá cambiando los filtros.</span></div>}
        summary={<><strong>{filtered.length}</strong> {filtered.length === 1 ? 'rol encontrado' : 'roles encontrados'}<span>Seleccioná un rol para configurar sus accesos.</span></>}
        page={page}
        pageSize={PAGE_SIZE}
        totalRecords={filtered.length}
        onPageChange={setPage}
        onRowClick={role => void selectRole(role)}
        selectedRowKey={selected?.rolId}
        className="roles-list-card"
        tableClassName="roles-table"
      />

      {selected && <aside className="role-access-panel">
        <header className="role-access-header"><div className="role-icon"><ShieldCheck size={22}/></div><div><span>ROL</span><h2>{selected.nombre}</h2><p>{selected.descripcion || 'Sin descripción'}</p></div><button className="detail-close" onClick={() => setSelected(null)}><X size={18}/></button></header>
        <div className="role-access-meta"><span className={`status-badge ${selected.activo ? 'success' : 'neutral'}`}>{selected.activo ? 'Activo' : 'Inactivo'}</span><span><UserRound size={15}/> {userCount(selected.rolId)} {userCount(selected.rolId) === 1 ? 'usuario asignado' : 'usuarios asignados'}</span><button className="button secondary compact" onClick={() => openEdit(selected)}><Pencil size={15}/> Editar rol</button></div>
        <div className="matrix-heading"><div><h3>Matriz de accesos</h3><p>Marcá las operaciones habilitadas para cada menú. Los identificadores técnicos permanecen ocultos.</p></div>{dirty && <span className="pending-badge">Cambios sin guardar</span>}</div>
        {matrixLoading ? <div className="state-box">Cargando permisos…</div> : <div className="permission-matrix-wrap"><table className="permission-matrix"><thead><tr><th>Menú</th>{activePermissions.map(permission => <th key={permission.permisoId} title={permission.descripcion}>{permission.nombre}</th>)}</tr></thead><tbody>{activeMenus.map(menu => <tr key={menu.menuId}><td><strong>{menu.nombre}</strong><small>{menu.modulo}</small></td>{activePermissions.map(permission => { const key = `${menu.menuId}:${permission.permisoId}`; const checked = draft.has(key); return <td key={permission.permisoId}><button type="button" disabled={!selected.activo} className={`matrix-check ${checked ? 'checked' : ''}`} aria-label={`${permission.nombre} en ${menu.nombre}`} aria-pressed={checked} onClick={() => toggle(menu.menuId, permission.permisoId)}>{checked && <Check size={15}/>}</button></td>; })}</tr>)}</tbody></table></div>}
        <footer className="matrix-actions"><button className="button ghost" disabled={!dirty || savingMatrix} onClick={() => setDraft(new Set(assigned.map(x => `${x.menuId}:${x.permisoId}`)))}>Descartar cambios</button><button className="button primary" disabled={!dirty || savingMatrix || !selected.activo} onClick={() => void saveMatrix()}>{savingMatrix ? 'Guardando…' : 'Guardar accesos'}</button></footer>
      </aside>}
    </div>

    {editing && <Modal title={editing === 'new' ? 'Ingresar rol' : 'Editar rol'} subtitle="Definí la función de negocio. Los accesos se configuran luego en la matriz." onClose={() => setEditing(null)}><form className="user-form" onSubmit={saveRole} noValidate>{formSubmitError && <div className="form-alert" role="alert"><ShieldCheck size={17}/><span>{formSubmitError}</span></div>}<label className={`plain-field ${formErrors.nombre ? 'field-invalid' : ''}`}><span>Nombre <span className="required-mark">*</span></span><input value={form.nombre} maxLength={50} onChange={e => setForm({...form,nombre:e.target.value})} onBlur={() => setFormErrors(validateRole(form))}/>{formErrors.nombre && <p className="field-error">{formErrors.nombre}</p>}</label><label className={`plain-field ${formErrors.descripcion ? 'field-invalid' : ''}`}><span>Descripción</span><textarea value={form.descripcion || ''} maxLength={250} onChange={e => setForm({...form,descripcion:e.target.value})} onBlur={() => setFormErrors(validateRole(form))}/>{formErrors.descripcion && <p className="field-error">{formErrors.descripcion}</p>}</label>{editing !== 'new' && <label className="role-active-toggle"><input type="checkbox" checked={form.activo} onChange={e => setForm({...form,activo:e.target.checked})}/><span>Mantener rol activo</span></label>}<div className="modal-actions"><button type="button" className="button ghost" onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" disabled={savingRole}>{savingRole ? 'Guardando…' : editing === 'new' ? 'Crear rol' : 'Guardar cambios'}</button></div></form></Modal>}
  {showAssignedUsers && selected && <Modal title="Usuarios asignados" subtitle={`${selected.nombre} · ${users.filter(u => u.roles.some(r => r.rolId === selected.rolId)).length} usuarios con este rol`} onClose={() => setShowAssignedUsers(false)}>
      <div className="assigned-users-table-wrap">
        {users.filter(u => u.roles.some(r => r.rolId === selected.rolId)).length ? <table className="assigned-users-table"><thead><tr><th>Usuario</th><th>Nombre</th><th>Estado</th></tr></thead><tbody>{users.filter(u => u.roles.some(r => r.rolId === selected.rolId)).map(u => <tr key={u.usuarioId}><td><strong>{u.username}</strong><small>{u.email}</small></td><td>{`${u.nombre} ${u.apellido || ''}`.trim()}</td><td><span className={`status-badge ${u.activo ? 'success' : 'neutral'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td></tr>)}</tbody></table> : <div className="assigned-users-empty"><UserRound size={22}/><strong>Sin usuarios asignados</strong><span>Este rol todavía no está asociado a ningún usuario.</span></div>}
      </div>
      <div className="modal-actions assigned-users-actions"><button className="button ghost" onClick={() => setShowAssignedUsers(false)}>Cerrar</button><button className="button secondary" onClick={() => { setShowAssignedUsers(false); location.href='/usuarios'; }}>Ver en Usuarios</button></div>
    </Modal>}
  </AppShell>;
}
