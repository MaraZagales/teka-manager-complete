const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);
export type EffectivePermission = {
  usuarioId: number;
  username: string;
  rolId: number;
  rolNombre: string;
  menuId: number;
  menuNombre: string;
  ruta?: string;
  modulo: string;
  ordenVisual: number;
  permisoId: number;
  permisoNombre: string;
};
export type LoginResponse = {
  exitoso: boolean;
  mensaje: string;
  accessToken?: string;
  auditoriaSesionId?: number;
  usuario?: {
    usuarioId: number;
    username: string;
    nombre: string;
    apellido?: string;
    email: string;
    activo: boolean;
    bloqueado: boolean;
    intentosFallidos: number;
    fechaAlta: string;
    ultimoLogin?: string;
  };
  roles: {
    usuarioRolId: number;
    usuarioId: number;
    rolId: number;
    rolNombre: string;
    descripcion?: string;
  }[];
  permisos: EffectivePermission[];
};
export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const r = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.mensaje || "No se pudo iniciar sesión.");
  return d as LoginResponse;
}

export async function logoutSession(auditoriaSesionId?: number): Promise<void> {
  if (!auditoriaSesionId) return;
  let accessToken = '';
  try {
    const stored = sessionStorage.getItem('teka.session');
    accessToken = stored ? (JSON.parse(stored) as LoginResponse).accessToken || '' : '';
  } catch { /* La sesión local se limpia igualmente al finalizar. */ }
  const response = await fetch(`${API}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: JSON.stringify({ auditoriaSesionId }),
  });
  if (!response.ok && response.status !== 401) throw new Error('No se pudo registrar el cierre de sesión.');
}
export type PasswordRecoveryResponse = {
  mensaje: string;
};

export async function requestPasswordRecovery(
  usuarioOEmail: string,
): Promise<PasswordRecoveryResponse> {
  const response = await fetch(`${API}/api/auth/password-recovery/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuarioOEmail,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.mensaje || "No se pudo procesar la solicitud de recuperación.",
    );
  }

  return data as PasswordRecoveryResponse;
}

export async function validatePasswordRecovery(
  token: string,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const response = await fetch(
    `${API}/api/auth/password-recovery/validate?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return false;
  }

  return Boolean(data.valido);
}

export async function resetPassword(
  token: string,
  passwordNueva: string,
): Promise<PasswordRecoveryResponse> {
  const response = await fetch(`${API}/api/auth/password-recovery/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      passwordNueva,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo actualizar la contraseña.");
  }

  return data as PasswordRecoveryResponse;
}
