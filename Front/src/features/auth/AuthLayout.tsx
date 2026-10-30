import type { ReactNode } from "react";
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="login-layout">
      <section className="brand-panel">
        <img src="/images/teka-hero.png" alt="Ambiente amoblado por TEKA" />
        <div className="photo-overlay" />
        <div className="brand-copy">
          <div className="brand-name">TEKA</div>
          <div className="brand-sub">MANAGER</div>
          <div className="accent-line" />
          <h1>
            Gestión
            <br />
            integral
          </h1>
          <p>
           Del taller al cliente, acompañando cada etapa
          </p>
        </div>
      </section>
      <section className="form-panel">{children}</section>
    </main>
  );
}
