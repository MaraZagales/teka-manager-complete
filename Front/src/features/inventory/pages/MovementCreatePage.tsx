import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Ban, Boxes, Package, Save, Settings2 } from "lucide-react";
import { AppShell } from "../../../components/layout/AppShell";
import { Modal } from "../../../components/data/Modal";
import { hasPermission } from "../../../services/authorization";
import { stockMovementsApi, type ManualMovementPayload } from "../../../services/stockMovementsApi";
import { MovementArticleSelector } from "../components/movements/MovementArticleSelector";
import { useMovementCatalogs } from "../hooks/useMovementCatalogs";
import type { MovementArticle } from "../types/movements";
import { movementClassesForDeposit, stockForArticle } from "../utils/movementPresentation";
import "../styles/products.css";
import "../styles/movements.css";

type FormValues = { movementTypeId: string; depositId: string; articleKey: string; quantity: string; reason: string };
type FormErrors = Partial<Record<keyof FormValues, string>>;
const emptyForm: FormValues = { movementTypeId: "", depositId: "", articleKey: "", quantity: "", reason: "" };
const quantityFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

export function MovementCreatePage() {
  const canCreate = hasPermission("Inventario", "Crear");
  const catalogs = useMovementCatalogs();
  const initialSnapshot = useRef(JSON.stringify(emptyForm));
  const allowNavigation = useRef(false);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [articleQuery, setArticleQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const selectedArticle = catalogs.articles.find((item) => item.key === form.articleKey);
  const selectedType = useMemo(() => catalogs.types.find((item) => String(item.id) === form.movementTypeId), [catalogs.types, form.movementTypeId]);
  const compatibleClasses = useMemo(() => form.depositId ? movementClassesForDeposit(Number(form.depositId), catalogs.productStock, catalogs.supplyStock) : new Set<MovementArticle["kind"]>(), [catalogs.productStock, catalogs.supplyStock, form.depositId]);
  const compatibleArticles = useMemo(() => catalogs.articles.filter((item) => compatibleClasses.has(item.kind)), [catalogs.articles, compatibleClasses]);
  const currentStock = selectedArticle && form.depositId ? stockForArticle(selectedArticle, Number(form.depositId), catalogs.productStock, catalogs.supplyStock) : null;
  const parsedQuantity = /^\d+(?:[.,]\d{1,2})?$/.test(form.quantity) ? Number(form.quantity.replace(",", ".")) : null;
  const estimatedStock = currentStock !== null && selectedType?.signo != null && parsedQuantity !== null ? currentStock + selectedType.signo * parsedQuantity : null;
  const dirty = JSON.stringify(form) !== initialSnapshot.current || Boolean(articleQuery);

  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (!dirty || saving || allowNavigation.current) return;
      event.preventDefault(); event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty, saving]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function selectArticle(article: MovementArticle) {
    setForm((current) => ({ ...current, articleKey: article.key }));
    setErrors((current) => ({ ...current, articleKey: undefined }));
    setArticleQuery(`${article.code} · ${article.name}`);
  }
  function clearArticle() { update("articleKey", ""); setArticleQuery(""); }
  function changeDeposit(value: string) {
    const nextClasses = value ? movementClassesForDeposit(Number(value), catalogs.productStock, catalogs.supplyStock) : new Set<MovementArticle["kind"]>();
    const remainsCompatible = selectedArticle ? nextClasses.has(selectedArticle.kind) : true;
    setForm((current) => ({ ...current, depositId: value, ...(remainsCompatible ? {} : { articleKey: "", quantity: "" }) }));
    setErrors((current) => ({ ...current, depositId: undefined, ...(remainsCompatible ? {} : { articleKey: undefined, quantity: undefined }) }));
    if (!remainsCompatible) setArticleQuery("");
  }
  function validate() {
    const next: FormErrors = {};
    if (!form.movementTypeId || !selectedType) next.movementTypeId = "Seleccioná un tipo de movimiento válido.";
    if (!form.depositId || !catalogs.deposits.some((item) => String(item.id) === form.depositId)) next.depositId = "Seleccioná un depósito válido.";
    if (!selectedArticle || !compatibleArticles.some((item) => item.key === selectedArticle.key)) next.articleKey = "Seleccioná un artículo compatible con el depósito.";
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(form.quantity) || Number(form.quantity.replace(",", ".")) <= 0) next.quantity = "Ingresá una cantidad mayor que cero, con hasta dos decimales.";
    if (!form.reason || !catalogs.reasons.some((item) => item.descripcion === form.reason)) next.reason = "Seleccioná un motivo válido del catálogo.";
    if (!next.quantity && selectedType?.signo != null && selectedType.signo < 0 && currentStock !== null && Number(form.quantity.replace(",", ".")) > currentStock) next.quantity = `La cantidad supera el stock disponible (${quantityFormat.format(currentStock)} ${selectedArticle?.unit || ""}).`;
    return next;
  }
  function leave() {
    allowNavigation.current = true; initialSnapshot.current = JSON.stringify(form);
    window.setTimeout(() => { location.href = "/inventory/movements"; }, 0);
  }
  function cancel() { if (dirty) setConfirmCancel(true); else leave(); }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(); setErrors(nextErrors); setSubmitError("");
    if (Object.keys(nextErrors).length || !selectedArticle || !selectedType) return;
    setSaving(true);
    const payload: ManualMovementPayload = {
      tipoMovimientoStockId: selectedType.id,
      depositoId: Number(form.depositId),
      cantidad: Number(form.quantity.replace(",", ".")),
      motivo: form.reason.trim(),
      ...(selectedArticle.kind === "PRODUCTO" ? { productoId: selectedArticle.id } : { insumoId: selectedArticle.id }),
    };
    try {
      await stockMovementsApi.createManual(selectedArticle.kind, payload);
      initialSnapshot.current = JSON.stringify(form); allowNavigation.current = true;
      sessionStorage.setItem("movement-notice", "Movimiento registrado correctamente.");
      window.setTimeout(() => { location.href = "/inventory/movements"; }, 0);
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : "No se pudo registrar el movimiento."); setSaving(false);
    }
  }

  return <AppShell title="Registrar movimiento" breadcrumb="Inventario / Movimientos de stock / Registrar movimiento" backHref="/inventory/movements" backLabel="Volver a Movimientos de stock">
    {!canCreate ? <div className="movement-page-error" role="alert"><Ban size={20}/><span>No tenés permiso para registrar movimientos.</span></div> : catalogs.error ? <div className="movement-page-error" role="alert"><Ban size={20}/><span>{catalogs.error}</span><button type="button" className="button secondary" onClick={() => void catalogs.load()}>Reintentar</button></div> : <form className="movement-editor" noValidate onSubmit={submit}>
      <header className="product-editor-header"><div className="product-editor-heading"><h1>Registrar movimiento</h1></div><div className="product-editor-actions"><button type="button" className="button secondary" disabled={saving} onClick={cancel}>Cancelar</button><button type="submit" className="button primary" disabled={saving || catalogs.loading}><Save size={16}/>{saving ? "Registrando…" : "Registrar movimiento"}</button></div></header>
      {submitError && <div className="movement-form-error" role="alert"><Ban size={17}/><span>{submitError}</span></div>}
      <div className="movement-create-layout">
        <section className="product-form-section"><header><span><Settings2 size={18}/></span><div><h2>Información del movimiento</h2></div></header><div className="movement-form-fields">
          <label className={errors.movementTypeId ? "field-invalid" : ""}><span>Tipo de movimiento <b>*</b></span><select value={form.movementTypeId} disabled={catalogs.loading} onChange={(event) => update("movementTypeId", event.target.value)}><option value="">Seleccioná un tipo</option>{catalogs.types.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.movementTypeId && <p className="field-error">{errors.movementTypeId}</p>}</label>
          <label className={errors.depositId ? "field-invalid" : ""}><span>Depósito <b>*</b></span><select value={form.depositId} disabled={catalogs.loading} onChange={(event) => changeDeposit(event.target.value)}><option value="">Seleccioná un depósito</option>{catalogs.deposits.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.depositId && <p className="field-error">{errors.depositId}</p>}</label>
          <label className={errors.reason ? "field-invalid" : ""}><span>Motivo <b>*</b></span><select value={form.reason} disabled={catalogs.loading} onChange={(event) => update("reason", event.target.value)}><option value="">Seleccioná un motivo</option>{catalogs.reasons.map((item) => <option key={item.id} value={item.descripcion}>{item.descripcion}</option>)}</select>{errors.reason && <p className="field-error">{errors.reason}</p>}</label>
        </div></section>
        <section className="product-form-section"><header><span><Package size={18}/></span><div><h2>Artículo del movimiento</h2></div></header>
          <MovementArticleSelector articles={compatibleArticles} selected={selectedArticle} query={articleQuery} disabled={catalogs.loading || !form.depositId || compatibleClasses.size === 0} placeholder={!form.depositId ? "Seleccioná primero un depósito" : compatibleClasses.size === 0 ? "Sin artículos compatibles" : "Código o nombre"} error={errors.articleKey} onQueryChange={(value) => { setArticleQuery(value); if (selectedArticle) update("articleKey", ""); }} onSelect={selectArticle} onClear={clearArticle}/>
          {selectedArticle && <div className="movement-selected-article"><span className="movement-article-icon">{selectedArticle.kind === "PRODUCTO" ? <Package size={20}/> : <Boxes size={20}/>}</span><div className="movement-selected-name"><strong>{selectedArticle.name}</strong></div><dl><div><dt>Código</dt><dd>{selectedArticle.code}</dd></div><div><dt>Clase</dt><dd>{selectedArticle.kind === "PRODUCTO" ? "Producto terminado" : "Insumo"}</dd></div><div><dt>Stock actual</dt><dd>{currentStock === null ? "—" : `${quantityFormat.format(currentStock)} ${selectedArticle.unit}`}</dd></div><div><dt>Unidad</dt><dd>{selectedArticle.unit}</dd></div></dl></div>}
          <div className="movement-stock-calculation"><label className={`movement-quantity-field ${errors.quantity ? "field-invalid" : ""}`}><span>Cantidad <b>*</b></span><div><input type="number" min="0.01" step="0.01" value={form.quantity} disabled={!selectedArticle} onChange={(event) => update("quantity", event.target.value)}/><em>{selectedArticle?.unit || "—"}</em></div>{errors.quantity && <p className="field-error">{errors.quantity}</p>}</label><div className={`movement-result ${estimatedStock !== null && estimatedStock < 0 ? "is-negative" : ""}`}><span>Stock resultante estimado</span><strong>{estimatedStock === null || !selectedArticle ? "—" : `${quantityFormat.format(estimatedStock)} ${selectedArticle.unit}`}</strong></div></div>
        </section>
      </div>
    </form>}
    {confirmCancel && <Modal title="Descartar cambios" onClose={() => setConfirmCancel(false)}><div className="product-confirm-dialog"><div><AlertTriangle size={21}/><p>Hay cambios sin guardar. Si salís ahora, se perderán.</p></div><footer><button type="button" className="button secondary" onClick={() => setConfirmCancel(false)}>Seguir editando</button><button type="button" className="button danger" onClick={leave}>Descartar cambios</button></footer></div></Modal>}
  </AppShell>;
}
