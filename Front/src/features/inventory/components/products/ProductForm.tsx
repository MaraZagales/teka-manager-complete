import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Ban, Box, Ruler, Save, Settings2 } from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { Toast } from "../../../../components/ui/Toast";
import { productsApi, type ColorLookup, type Lookup, type Product, type UnitLookup } from "../../../../services/productsApi";
import type { ProductFormErrors, ProductFormField, ProductFormValues } from "../../types/products";
import { emptyProductForm, productFormToPayload, productToForm, validateProductField, validateProductForm } from "../../utils/productForm";
import { ProductPhotos } from "./ProductPhotos";

type ProductFormMode = "create" | "edit" | "view";
type Props = { mode: ProductFormMode; product?: Product; types: Lookup[]; colors: ColorLookup[]; units: UnitLookup[]; initialNotice?: string; canEdit?: boolean };

export function ProductForm({ mode, product, types, colors, units, initialNotice = "", canEdit = false }: Props) {
  const readonly = mode === "view";
  const initialForm = useMemo(() => {
    if (product) return productToForm(product);
    const unit = units.find((item) => item.abreviatura?.toUpperCase() === "UN" || item.descripcion?.toLocaleLowerCase("es-AR") === "unidad");
    return { ...emptyProductForm, unidadMedidaId: unit ? String(unit.id) : "" };
  }, [product, units]);
  const initialSnapshot = useRef(JSON.stringify(initialForm));
  const allowNavigation = useRef(false);
  const [form, setForm] = useState<ProductFormValues>(initialForm);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [names, setNames] = useState<Lookup[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);
  const [namesError, setNamesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [notice, setNotice] = useState(initialNotice);
  const dirty = !readonly && JSON.stringify(form) !== initialSnapshot.current;

  useEffect(() => {
    const categoryId = Number(form.tipoProductoId);
    if (!categoryId) { setNames([]); setNamesLoading(false); setNamesError(""); return; }
    let active = true;
    setNamesLoading(true); setNamesError("");
    void productsApi.productNames(categoryId)
      .then((items) => { if (active) setNames(items); })
      .catch((caught) => { if (active) setNamesError(caught instanceof Error ? caught.message : "No se pudo cargar el catálogo de nombres."); })
      .finally(() => { if (active) setNamesLoading(false); });
    return () => { active = false; };
  }, [form.tipoProductoId]);

  useEffect(() => {
    const protectNavigation = (event: BeforeUnloadEvent) => {
      if (!dirty || saving || allowNavigation.current) return;
      event.preventDefault(); event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectNavigation);
    return () => window.removeEventListener("beforeunload", protectNavigation);
  }, [dirty, saving]);

  function update(field: ProductFormField, value: string) {
    if (readonly) return;
    const next = field === "tipoProductoId" ? { ...form, tipoProductoId: value, nombreProductoId: "", nombre: "" } : { ...form, [field]: value };
    if (field === "nombreProductoId") next.nombre = names.find((item) => String(item.id) === value)?.descripcion || "";
    setForm(next);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validateProductField(field, next) }));
  }
  function validateOnBlur(field: ProductFormField) { if (!readonly) setErrors((current) => ({ ...current, [field]: validateProductField(field, form) })); }

  function leaveForm() { allowNavigation.current = true; initialSnapshot.current = JSON.stringify(form); window.setTimeout(() => { location.href = "/inventory/products"; }, 0); }
  function requestCancel() { if (dirty) setConfirmCancel(true); else leaveForm(); }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (readonly) return;
    const validation = validateProductForm(form);
    setErrors(validation); setSubmitError("");
    if (Object.keys(validation).length) return;
    if (namesLoading) { setSubmitError("Esperá a que se carguen los nombres de producto."); return; }
    if (namesError) { setSubmitError("No se puede guardar hasta recuperar el catálogo de nombres."); return; }
    const selectedName = names.find((item) => String(item.id) === form.nombreProductoId);
    if (!selectedName) { setErrors((current) => ({ ...current, nombreProductoId: "Seleccioná un nombre válido de la categoría." })); return; }
    setSaving(true);
    try {
      if (product) await productsApi.update(product.productoId, productFormToPayload(form, names, product));
      else await productsApi.create(productFormToPayload(form, names));
      initialSnapshot.current = JSON.stringify(form); allowNavigation.current = true;
      sessionStorage.setItem("product-notice", product ? "Producto actualizado correctamente." : "Producto registrado correctamente. Podés configurar su presentación online desde E-commerce.");
      window.setTimeout(() => { location.href = "/inventory/products"; }, 0);
    } catch (caught) { setSubmitError(caught instanceof Error ? caught.message : "No se pudo guardar el producto."); setSaving(false); }
  }

  const selectedName = names.find((item) => String(item.id) === form.nombreProductoId)?.descripcion || form.nombre || product?.nombre || "";
  const title = mode === "create" ? "Registrar producto" : mode === "edit" ? "Editar producto" : "Consultar producto";

  return <>
    <Toast message={notice} onClose={() => setNotice("")}/>
    <form className={`product-editor product-editor-${mode}`} noValidate onSubmit={submit}>
      <header className="product-editor-header">
        <div className="product-editor-heading"><h1>{title}</h1></div>
        <div className="product-editor-actions">{readonly ? canEdit && <a className="button primary" href={`/inventory/products/${product!.productoId}/edit`}>Editar producto</a> : <><button type="button" className="button secondary" disabled={saving} onClick={requestCancel}>Cancelar</button><button type="submit" className="button primary" disabled={saving || namesLoading}><Save size={16}/>{saving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Guardar producto"}</button></>}</div>
      </header>
      {submitError && <div className="product-form-alert" role="alert"><Ban size={18}/><span>{submitError}</span></div>}
      <div className="product-form-layout">
        <div className="product-form-main">
          <section className="product-form-section" aria-labelledby="product-main-title"><header><span><Box size={18}/></span><div><h2 id="product-main-title">Información principal</h2></div></header><div className="product-form-grid">
            <Field label="Código" value={product?.codigo || "Se asigna automáticamente"} onChange={() => {}} readonly/>
            <Field label="Nombre" value={selectedName} onChange={() => {}} readonly/>
            <SelectField label="Categoría" required value={form.tipoProductoId} error={errors.tipoProductoId} onChange={(value) => update("tipoProductoId", value)} onBlur={() => validateOnBlur("tipoProductoId")} options={types} disabled={readonly}/>
            <SelectField label="Nombre de catálogo" required value={form.nombreProductoId} error={errors.nombreProductoId || namesError} onChange={(value) => update("nombreProductoId", value)} onBlur={() => validateOnBlur("nombreProductoId")} options={names} disabled={readonly || !form.tipoProductoId || namesLoading || Boolean(namesError)} emptyLabel={!form.tipoProductoId ? "Primero seleccioná una categoría" : namesLoading ? "Cargando nombres…" : "Seleccioná un producto"}/>
            <label className={`product-field product-field-wide ${errors.descripcion ? "field-invalid" : ""}`}><span>Descripción</span><textarea value={form.descripcion} maxLength={500} readOnly={readonly} onChange={(event) => update("descripcion", event.target.value)} onBlur={() => validateOnBlur("descripcion")}/>{!readonly && <small>Máximo 500 caracteres ({form.descripcion.length}/500)</small>}{errors.descripcion && <p className="field-error">{errors.descripcion}</p>}</label>
          </div></section>
          <section className="product-form-section" aria-labelledby="product-size-title"><header><span><Ruler size={18}/></span><div><h2 id="product-size-title">Características</h2></div></header><div className="product-form-grid product-characteristics-grid">
            <SelectField label="Color" value={form.colorId} error={errors.colorId} onChange={(value) => update("colorId", value)} options={colors} emptyLabel="Sin color" disabled={readonly}/>
            <SelectField label="Unidad de medida" required value={form.unidadMedidaId} error={errors.unidadMedidaId} onChange={(value) => update("unidadMedidaId", value)} onBlur={() => validateOnBlur("unidadMedidaId")} options={units} disabled={readonly}/>
            <div className="product-dimension-grid product-field-wide">{(["anchoCm", "altoCm", "profundidadCm"] as const).map((field) => <Field key={field} label={{ anchoCm: "Ancho", altoCm: "Alto", profundidadCm: "Profundidad" }[field]} suffix="cm" required type="number" min="0.01" max="99999999.99" step="0.01" value={form[field]} error={errors[field]} onChange={(value) => update(field, value)} onBlur={() => validateOnBlur(field)} readonly={readonly}/>)}</div>
          </div></section>
        </div>
        <aside className="product-form-side"><ProductPhotos productId={product?.productoId} productName={selectedName || "Producto"} readonly context="inventory"/><section className="product-form-section" aria-labelledby="product-config-title"><header><span><Settings2 size={18}/></span><div><h2 id="product-config-title">Configuración</h2></div></header><Field label="Stock mínimo" required type="number" min="0" step="0.01" value={form.stockMinimo} error={errors.stockMinimo} onChange={(value) => update("stockMinimo", value)} onBlur={() => validateOnBlur("stockMinimo")} readonly={readonly}/>{!readonly && <div className="product-stock-note">Este valor no modifica existencias ni genera movimientos de stock.</div>}</section></aside>
      </div>
    </form>
    {confirmCancel && <Modal title="Descartar cambios" onClose={() => setConfirmCancel(false)}><div className="product-confirm-dialog"><div><AlertTriangle size={21}/><p>Hay cambios sin guardar. Si salís ahora, se perderán.</p></div><footer><button type="button" className="button secondary" onClick={() => setConfirmCancel(false)}>Seguir editando</button><button type="button" className="button danger" onClick={leaveForm}>Descartar cambios</button></footer></div></Modal>}
  </>;
}

function Field({ label, value, onChange, onBlur, error, suffix, required, type = "text", min, max, step, readonly = false }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void; error?: string; suffix?: string; required?: boolean; type?: string; min?: string; max?: string; step?: string; readonly?: boolean }) {
  return <label className={`product-field ${error ? "field-invalid" : ""}`}><span>{label}{required && <b aria-label="obligatorio"> *</b>}</span><div className={suffix ? "product-input-suffix" : ""}><input type={type} value={value} min={min} max={max} step={step} readOnly={readonly} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} onBlur={onBlur}/>{suffix && <em>{suffix}</em>}</div>{error && <p className="field-error">{error}</p>}</label>;
}

function SelectField({ label, value, onChange, onBlur, options, error, required, disabled, emptyLabel = "Seleccioná una opción" }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void; options: Lookup[]; error?: string; required?: boolean; emptyLabel?: string; disabled?: boolean }) {
  return <label className={`product-field ${error ? "field-invalid" : ""}`}><span>{label}{required && <b aria-label="obligatorio"> *</b>}</span><select value={value} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} onBlur={onBlur}><option value="">{emptyLabel}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.descripcion}</option>)}</select>{error && <p className="field-error">{error}</p>}</label>;
}
