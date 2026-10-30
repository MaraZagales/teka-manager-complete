import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { login } from "../../services/authApi";
import { setSession } from "../../services/session";
import { firstAllowedPath } from "../../services/authorization";
import { AuthLayout } from "./AuthLayout";
export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username.trim() || !password) {
      setError("Completá usuario y contraseña para continuar.");
      return;
    }
    setLoading(true);
    try {
      const r = await login(username.trim(), password);
      if (!r.exitoso) {
        setError(r.mensaje || "Usuario o contraseña incorrectos.");
        return;
      }
      setSession(r);
      location.href = firstAllowedPath();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos conectarnos con TEKA.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout>
      <div className="login-card">
        <div className="mobile-brand">
          <b>TEKA</b>
          <span>MANAGER</span>
        </div>
        <p className="kicker">BIENVENIDO A TEKA</p>
        <h2>Iniciá sesión</h2>
        <p className="intro">
          Ingresá con tu usuario para acceder al sistema.
        </p>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert success" role="status">
            {success}
          </div>
        )}
        <form onSubmit={submit}>
          <FormField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            icon={<UserRound size={19} />}
            placeholder="Ingresá tu usuario"
          />
          <FormField
            label="Contraseña"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            icon={<LockKeyhole size={19} />}
            placeholder="Ingresá tu contraseña"
            end={
              <button
                className="eye"
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            }
          />
          <div className="form-options">
            <span></span>
            <button
              type="button"
              className="link"
              onClick={() => (location.href = "/?view=forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <Button disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Validando...
              </>
            ) : (
              <>
                Iniciar sesión <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>
        <footer>TEKA Manager · Acceso seguro</footer>
      </div>
    </AuthLayout>
  );
}
