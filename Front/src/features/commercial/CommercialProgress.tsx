import './commercialProgress.css';

type Evidence = { cliente: number; producto: number; cantidades: number };
type Props = { score: number; evidence: Evidence; compact?: boolean; preview?: boolean };

/** Visualización reutilizable. No calcula ni persiste el puntaje de negocio. */
export function CommercialProgress({ score, evidence, compact = false, preview = false }: Props) {
  const value = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const complete = [
    evidence.cliente > 0 && 'Cliente identificado',
    evidence.producto > 0 && 'Producto vinculado',
    evidence.cantidades > 0 && 'Cantidad registrada',
  ].filter(Boolean) as string[];
  const next = evidence.cliente <= 0 ? 'Seleccionar un cliente'
    : evidence.producto <= 0 ? 'Vincular un producto'
    : evidence.cantidades <= 0 ? 'Registrar una cantidad'
    : 'Registrar el próximo hito comercial';
  return (
    <section className={`commercial-progress${compact ? ' commercial-progress--compact' : ''}`} aria-label="Avance comercial">
      <div className="commercial-progress__heading">
        <div><strong>Avance comercial</strong>{preview && <small>Vista previa según los datos ingresados</small>}</div>
        <strong className="commercial-progress__value">{value}%</strong>
      </div>
      <div className="commercial-progress__track" role="progressbar" aria-label="Avance comercial" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className="commercial-progress__fill" style={{ width: `${value}%` }} />
      </div>
      <p className="commercial-progress__evidence">{complete.length ? `✓ ${complete.join(' · ')}` : 'Todavía no hay datos comerciales comprobados'}</p>
      <p className="commercial-progress__next">Siguiente paso: {next}</p>
      {!compact && <small className="commercial-progress__hint">Los hitos de intención de compra y cotizaciones se incorporarán cuando existan evidencias registradas en la API.</small>}
    </section>
  );
}
