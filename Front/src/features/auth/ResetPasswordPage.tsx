import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import {
  resetPassword,
  validatePasswordRecovery,
} from "../../services/authApi";
export function ResetPasswordPage() {
  const token = new URLSearchParams(location.search).get("token") || "";
  const [valid, setValid] = useState<boolean | null>(null);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    validatePasswordRecovery(token)
      .then(setValid)
      .catch(() => setValid(false));
  }, [token]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (
      p1.length < 8 ||
      !/[A-Z]/.test(p1) ||
      !/[a-z]/.test(p1) ||
      !/[0-9]/.test(p1)
    ) {
      setError(
        "Usá al menos 8 caracteres e incluí mayúscula, minúscula y número.",
      );
      return;
    }
    if (p1 !== p2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, p1);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout>
      <div className="login-card">
        <p className="kicker">SEGURIDAD DE TU CUENTA</p>
        <h2>Nueva contraseña</h2>
        {valid === null ? (
          <p className="intro">Validando tu mail...</p>
        ) : !valid ? (
          <>
            <div className="alert error">
              Este mail es inválido, ya fue utilizado o venció.
            </div>
            <button
              className="back-link"
              onClick={() => (location.href = "/?view=forgot-password")}
            >
              <ArrowLeft size={17} />
              Solicitar un nuevo mail de recuperación
            </button>
          </>
        ) : done ? (
          <>
            <div className="alert success">
              Contraseña actualizada. Tu cuenta quedó habilitada para volver a
              ingresar.
            </div>
            <button className="back-link" onClick={() => (location.href = "/")}>
              <ArrowLeft size={17} />
              Ir al inicio de sesión
            </button>
          </>
        ) : (
          <>
            <p className="intro">
              Creá una contraseña nueva. El cambio también reinicia los intentos
              fallidos y desbloquea tu cuenta.
            </p>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={submit}>
              <FormField
                label="Nueva contraseña"
                type="password"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                icon={<KeyRound size={19} />}
                placeholder="Mínimo 8 caracteres"
              />
              <FormField
                label="Repetir contraseña"
                type="password"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                icon={<KeyRound size={19} />}
                placeholder="Repetí la contraseña"
              />
              <p className="password-hint">
                Debe incluir mayúscula, minúscula y número.
              </p>
              <Button disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar contraseña <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
        <footer>TEKA Manager · Recuperación segura</footer>
      </div>
    </AuthLayout>
  );
}
