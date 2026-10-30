import { useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { requestPasswordRecovery } from "../../services/authApi";
export function ForgotPasswordPage() {
  const [v, setV] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (v.trim().length < 3) {
      setError("Ingresá tu usuario o correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      const r = await requestPasswordRecovery(v.trim());
      setMsg(r.mensaje);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos procesar la solicitud.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout>
      <div className="login-card">
        <p className="kicker">SEGURIDAD DE TU CUENTA</p>
        <h2>Recuperá tu acceso</h2>
        <p className="intro">
          Ingresá tu usuario o correo. Si encontramos una cuenta activa
          asociada, te mail para reestablecer tu contraseña.
        </p>
        {error && <div className="alert error">{error}</div>}
        {msg ? (
          <>
            <div className="alert success">{msg}</div>
            <button className="back-link" onClick={() => (location.href = "/")}>
              <ArrowLeft size={17} />
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <FormField
              label="Usuario o correo electrónico"
              value={v}
              onChange={(e) => setV(e.target.value)}
              icon={<Mail size={19} />}
              placeholder="Ej. usuario o usuario@correo.com"
            />
            <Button disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar mail <ArrowRight size={18} />
                </>
              )}
            </Button>
            <button
              type="button"
              className="back-link"
              onClick={() => (location.href = "/")}
            >
              <ArrowLeft size={17} />
              Volver al inicio de sesión
            </button>
          </form>
        )}
        <footer>TEKA Manager · Recuperación segura</footer>
      </div>
    </AuthLayout>
  );
}
