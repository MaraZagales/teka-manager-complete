import { useEffect, useMemo, useState } from "react";
import { Ban, FileText, Package, RotateCcw, Route } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { StatusBadge } from "../../../components/data/StatusBadge";
import { stockMovementsApi, type MovementDetail } from "../../../services/stockMovementsApi";
import { useMovementCatalogs } from "../hooks/useMovementCatalogs";
import { formatMovementDate, movementMode, movementOriginLabel } from "../utils/movementPresentation";
import "../styles/products.css";
import "../styles/movements.css";

const quantityFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

export function MovementDetailPage({ movementId }: { movementId: number }) {
  const catalogs = useMovementCatalogs();
  const [movement, setMovement] = useState<MovementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try { setMovement(await stockMovementsApi.detail(movementId)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No se pudo consultar el movimiento."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [movementId]);

  const article = useMemo(() => {
    if (!movement) return undefined;
    const kind = movement.productoId != null ? "PRODUCTO" : "INSUMO";
    const id = kind === "PRODUCTO" ? movement.productoId : movement.insumoId;
    return catalogs.articles.find((item) => item.kind === kind && item.id === id);
  }, [catalogs.articles, movement]);

  const isProduct = movement?.productoId != null;
  const code = (isProduct ? movement?.productoCodigo : movement?.insumoCodigo) || article?.code || "—";
  const name = (isProduct ? movement?.productoNombre : movement?.insumoNombre) || article?.name || "Artículo sin identificar";
  const unit = article?.unit || "";

  return <AppShell title="Consultar movimiento" breadcrumb="Inventario / Movimientos de stock / Consultar movimiento" backHref="/inventory/movements" backLabel="Volver a Movimientos de stock">
    <main className="movement-detail-page">
      <header className="product-editor-header"><div className="product-editor-heading"><h1>Consultar movimiento</h1></div></header>
      {loading ? <div className="state-box">Cargando movimiento…</div> : error || !movement ? <div className="movement-page-error" role="alert"><Ban size={20}/><span>{error || "No se encontró el movimiento."}</span><button type="button" className="button secondary" onClick={() => void load()}><RotateCcw size={15}/>Reintentar</button></div> : <div className="movement-detail-layout">
        <section className="product-form-section movement-detail-information"><header><span><FileText size={18}/></span><div><h2>Información del movimiento</h2></div></header><dl className="movement-detail-fields">
          <div><dt>Fecha y hora</dt><dd>{formatMovementDate(movement.fechaMovimiento)}</dd></div>
          <div><dt>Tipo de movimiento</dt><dd><StatusBadge tone={movement.signo < 0 ? "danger" : "success"}>{movement.tipoMovimientoNombre}</StatusBadge></dd></div>
          <div><dt>Dirección</dt><dd>{movement.signo < 0 ? "Egreso" : "Ingreso"}</dd></div>
          <div><dt>Cantidad</dt><dd>{quantityFormat.format(movement.cantidad)}{unit ? ` ${unit}` : ""}</dd></div>
          <div><dt>Depósito</dt><dd>{movement.depositoNombre}</dd></div>
          {movement.motivo && <div><dt>Motivo</dt><dd>{movement.motivo}</dd></div>}
        </dl></section>
        <section className="product-form-section movement-detail-article"><header><span><Package size={18}/></span><div><h2>Artículo</h2></div></header><dl className="movement-detail-fields">
          <div><dt>Código</dt><dd>{code}</dd></div>
          <div><dt>Nombre</dt><dd>{name}</dd></div>
          <div><dt>Clase de artículo</dt><dd>{isProduct ? "Producto terminado" : "Insumo"}</dd></div>
          {unit && <div><dt>Unidad de medida</dt><dd>{unit}</dd></div>}
        </dl></section>
        <section className="product-form-section movement-detail-trace"><header><span><Route size={18}/></span><div><h2>Trazabilidad</h2></div></header><dl className="movement-detail-fields movement-trace-fields">
          <div><dt>Modalidad</dt><dd>{movementMode(movement)}</dd></div>
          <div><dt>Identificador del movimiento</dt><dd>#{movement.movimientoStockId}</dd></div>
          {movement.entidadOrigen && <div><dt>Módulo u operación de origen</dt><dd>{movementOriginLabel(movement.entidadOrigen)}</dd></div>}
          {movement.origenId != null && <div><dt>Referencia de origen</dt><dd>#{movement.origenId}</dd></div>}
          {movement.movimientoStockIdReversaDe != null && <div><dt>Movimiento revertido</dt><dd>#{movement.movimientoStockIdReversaDe}</dd></div>}
          {movement.motivoAnulacion && <div><dt>Motivo de anulación</dt><dd>{movement.motivoAnulacion}</dd></div>}
          {movement.observacionAnulacion && <div><dt>Observaciones de anulación</dt><dd>{movement.observacionAnulacion}</dd></div>}
        </dl></section>
      </div>}
    </main>
  </AppShell>;
}
