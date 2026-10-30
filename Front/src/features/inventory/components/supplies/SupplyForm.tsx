import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Ban, Box, Ruler, Save, Settings2 } from "lucide-react";
import { Modal } from "../../../../components/data/Modal";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import { Toast } from "../../../../components/ui/Toast";
import { suppliesApi, type ColorLookup, type Lookup, type Supply, type UnitLookup } from "../../../../services/suppliesApi";
import type { SupplyFormErrors, SupplyFormField, SupplyFormValues } from "../../types/supplies";
import { emptySupplyForm, isMelamine, isSquareMeter, supplyFormToPayload, supplyToForm, validateSupplyField, validateSupplyForm } from "../../utils/supplyForm";

type SupplyFormMode = "create" | "edit" | "view";
type Props = {
  mode: SupplyFormMode; supply?: Supply; supplies: Supply[]; types: Lookup[]; colors: ColorLookup[]; units: UnitLookup[];
  initialNotice?: string; canEdit?: boolean;
};

export function SupplyForm({ mode, supply, supplies, types, colors, units, initialNotice = "", canEdit = false }: Props) {
  const readonly = mode === "view";
  const initialForm = useMemo(() => supply ? supplyToForm(supply) : { ...emptySupplyForm }, [supply]);
  const initialSnapshot = useRef(JSON.stringify(initialForm));
  const allowNavigation = useRef(false);
  const [form, setForm] = useState<SupplyFormValues>(initialForm);
  const [errors, setErrors] = useState<SupplyFormErrors>({});
  const [names, setNames] = useState<Lookup[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);
  const [namesError, setNamesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [notice, setNotice] = useState(initialNotice);
  const dirty = !readonly && JSON.stringify(form) !== initialSnapshot.current;

  useEffect(() => {
    const typeId = Number(form.tipoInsumoId);
    if (!typeId) { setNames([]); setNamesLoading(false); setNamesError(""); return; }
    let active = true;
    setNamesLoading(true); setNamesError("");
    void suppliesApi.supplyNames(typeId)
      .then((items) => { if (active) setNames(items); })
      .catch((caught) => { if (active) setNamesError(caught instanceof Error ? caught.message : "No se pudo cargar el catálogo de nombres."); })
      .finally(() => { if (active) setNamesLoading(false); });
    return () => { active = false; };
  }, [form.tipoInsumoId]);

  useEffect(() => {
    const protectNavigation = (event: BeforeUnloadEvent) => {
      if (!dirty || saving || allowNavigation.current) return;
      event.preventDefault(); event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectNavigation);
    return () => window.removeEventListener("beforeunload", protectNavigation);
  }, [dirty, saving]);

  function update(field: SupplyFormField, value: string) {
    if (readonly) return;
    let next = { ...form, [field]: value };
    if (field === "tipoInsumoId") {
      const selectedType = types.find((item) => String(item.id) === value);
      const squareMeter = units.find(isSquareMeter);
      const preserveUnit = mode === "edit" && supply && String(supply.tipoInsumoId) === value;
      next = { ...form, tipoInsumoId: value, nombreInsumoId: "", colorId: "", unidadMedidaId: isMelamine(selectedType) && squareMeter ? String(squareMeter.id) : preserveUnit ? String(supply.unidadMedidaId) : "" };
    }
    setForm(next);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validateSupplyField(field, next) }));
  }

  function validateOnBlur(field: SupplyFormField) {
    if (!readonly) setErrors((current) => ({ ...current, [field]: validateSupplyField(field, form) }));
  }

  function leaveForm() {
    allowNavigation.current = true;
    initialSnapshot.current = JSON.stringify(form);
    window.setTimeout(() => { location.href = "/inventory/supplies"; }, 0);
  }

  function requestCancel() { if (dirty) setConfirmCancel(true); else leaveForm(); }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (readonly) return;
    const validation = validateSupplyForm(form);
    setErrors(validation); setSubmitError("");
    if (Object.keys(validation).length) return;
    if (namesLoading) { setSubmitError("Esperá a que se carguen los nombres de insumo."); return; }
    if (namesError) { setSubmitError("No se puede guardar hasta recuperar el catálogo de nombres."); return; }
    const selectedType = types.find((item) => String(item.id) === form.tipoInsumoId);
    if (!selectedType) { setErrors((current) => ({ ...current, tipoInsumoId: "El tipo seleccionado no existe en el catálogo activo." })); return; }
    const selectedName = names.find((item) => String(item.id) === form.nombreInsumoId);
    if (!selectedName) { setErrors((current) => ({ ...current, nombreInsumoId: "El nombre no pertenece al tipo seleccionado." })); return; }
    const selectedColor = form.colorId ? colors.find((item) => String(item.id) === form.colorId) : undefined;
    if (form.colorId && !selectedColor) { setErrors((current) => ({ ...current, colorId: "El color seleccionado no existe en el catálogo activo." })); return; }
    const selectedUnit = units.find((item) => String(item.id) === form.unidadMedidaId);
    if (!selectedUnit || (isMelamine(selectedType) && !isSquareMeter(selectedUnit))) {
      setErrors((current) => ({ ...current, unidadMedidaId: isMelamine(selectedType) ? "La melamina debe registrarse en metros cuadrados (m²)." : "La unidad no es válida." })); return;
    }
    if (`${selectedName.descripcion}${selectedColor ? ` ${selectedColor.descripcion}` : ""}`.length > 120) {
      setErrors((current) => ({ ...current, nombreInsumoId: "El nombre comercial supera los 120 caracteres." })); return;
    }
    const duplicate = supplies.some((item) => item.insumoId !== supply?.insumoId && item.nombreInsumoId === Number(form.nombreInsumoId) && (item.colorId ?? null) === (form.colorId ? Number(form.colorId) : null));
    if (duplicate) { setErrors((current) => ({ ...current, nombreInsumoId: "Ya existe un insumo con ese nombre y color." })); return; }

    setSaving(true);
    try {
      const payload = supplyFormToPayload(form, names);
      if (supply) await suppliesApi.update(supply.insumoId, payload);
      else await suppliesApi.create(payload);
      initialSnapshot.current = JSON.stringify(form); allowNavigation.current = true;
      sessionStorage.setItem("supply-notice", supply ? "Insumo actualizado correctamente." : "Insumo registrado correctamente.");
      window.setTimeout(() => { location.href = "/inventory/supplies"; }, 0);
    } catch (caught) { setSubmitError(caught instanceof Error ? caught.message : "No se pudo guardar el insumo."); setSaving(false); }
  }

  const selectedType = types.find((item) => String(item.id) === form.tipoInsumoId);
  const selectedName = names.find((item) => String(item.id) === form.nombreInsumoId)?.descripcion || supply?.nombreCatalogo || supply?.nombre || "";
  const automaticUnit = units.find((item) => String(item.id) === form.unidadMedidaId);
  const title = mode === "create" ? "Registrar insumo" : mode === "edit" ? "Editar insumo" : "Consultar insumo";

  return <>
    <Toast message={notice} onClose={() => setNotice("")}/>
    <form className={`product-editor supply-editor supply-editor-${mode}`} noValidate onSubmit={submit}>
      <header className="product-editor-header">
        <div className="product-editor-heading"><h1>{title}</h1></div>
        <div className="product-editor-actions">{readonly ? canEdit && <a className="button primary" href={`/inventory/supplies/${supply!.insumoId}/edit`}>Editar insumo</a> : <><button type="button" className="button secondary" disabled={saving} onClick={requestCancel}>Cancelar</button><button type="submit" className="button primary" disabled={saving || namesLoading || Boolean(namesError)}><Save size={16}/>{saving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Guardar insumo"}</button></>}</div>
      </header>
      {submitError && <div className="product-form-alert" role="alert"><Ban size={18}/><span>{submitError}</span></div>}
      <div className="supply-form-layout">
        <div className="product-form-main">
          <section className="product-form-section" aria-labelledby="supply-main-title"><header><span><Box size={18}/></span><div><h2 id="supply-main-title">Información principal</h2></div></header><div className="product-form-grid">
            <Field label="Código" value={supply?.codigo || "Se asigna automáticamente"} onChange={() => {}} readonly/>
            <Field label="Nombre" value={selectedName} onChange={() => {}} readonly/>
            <SelectField label="Tipo de insumo" required value={form.tipoInsumoId} error={errors.tipoInsumoId} onChange={(value) => update("tipoInsumoId", value)} onBlur={() => validateOnBlur("tipoInsumoId")} options={types} disabled={readonly}/>
            <SelectField label="Nombre de catálogo" required value={form.nombreInsumoId} error={errors.nombreInsumoId || namesError} onChange={(value) => update("nombreInsumoId", value)} onBlur={() => validateOnBlur("nombreInsumoId")} options={names} disabled={readonly || !form.tipoInsumoId || namesLoading || Boolean(namesError)} emptyLabel={!form.tipoInsumoId ? "Primero seleccioná un tipo" : namesLoading ? "Cargando nombres…" : "Seleccioná un insumo"}/>
            <label className={`product-field product-field-wide ${errors.descripcion ? "field-invalid" : ""}`}><span>Descripción</span><textarea value={form.descripcion} maxLength={500} readOnly={readonly} onChange={(event) => update("descripcion", event.target.value)} onBlur={() => validateOnBlur("descripcion")}/>{!readonly && <small>Máximo 500 caracteres ({form.descripcion.length}/500)</small>}{errors.descripcion && <p className="field-error">{errors.descripcion}</p>}</label>
          </div></section>
          <section className="product-form-section" aria-labelledby="supply-characteristics-title"><header><span><Ruler size={18}/></span><div><h2 id="supply-characteristics-title">Características</h2></div></header><div className="product-form-grid">
            <SelectField label="Color" value={form.colorId} error={errors.colorId} onChange={(value) => update("colorId", value)} options={colors} emptyLabel="Sin color" disabled={readonly}/>
            <label className={`product-field ${errors.unidadMedidaId ? "field-invalid" : ""}`}><span>Unidad de medida <b aria-label="obligatorio"> *</b></span><select value={form.unidadMedidaId} disabled={readonly || isMelamine(selectedType)} aria-invalid={Boolean(errors.unidadMedidaId)} onChange={(event) => update("unidadMedidaId", event.target.value)} onBlur={() => validateOnBlur("unidadMedidaId")}><option value="">Seleccioná una unidad</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.descripcion} ({unit.abreviatura})</option>)}</select>{errors.unidadMedidaId && <p className="field-error">{errors.unidadMedidaId}</p>}{!readonly && isMelamine(selectedType) && automaticUnit && <small>Unidad asignada automáticamente para Melamina.</small>}</label>
          </div></section>
        </div>
        <aside className="product-form-side"><section className="product-form-section" aria-labelledby="supply-config-title"><header><span><Settings2 size={18}/></span><div><h2 id="supply-config-title">Configuración</h2></div></header><Field label="Stock mínimo" required type="number" min="0" step="0.01" value={form.stockMinimo} error={errors.stockMinimo} onChange={(value) => update("stockMinimo", value)} onBlur={() => validateOnBlur("stockMinimo")} readonly={readonly}/>{!readonly && <div className="product-stock-note">Este valor no modifica existencias ni genera movimientos de stock.</div>}{readonly && supply && <div className="supply-state-summary"><span>Estado</span><StatusBadge tone={supply.activo ? "success" : "danger"}>{supply.activo ? "Activo" : "Inactivo"}</StatusBadge>{!supply.activo && <><span>Motivo</span><strong>{supply.motivoInactivacionNombre || "Sin detalle"}</strong>{supply.observacionInactivacion && <><span>Observación</span><strong>{supply.observacionInactivacion}</strong></>}</>}</div>}</section></aside>
      </div>
    </form>
    {confirmCancel && <Modal title="Descartar cambios" onClose={() => setConfirmCancel(false)}><div className="product-confirm-dialog"><div><AlertTriangle size={21}/><p>Hay cambios sin guardar. Si salís ahora, se perderán.</p></div><footer><button type="button" className="button secondary" onClick={() => setConfirmCancel(false)}>Seguir editando</button><button type="button" className="button danger" onClick={leaveForm}>Descartar cambios</button></footer></div></Modal>}
  </>;
}

function Field({ label, value, onChange, onBlur, error, required, type = "text", min, step, readonly = false }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void; error?: string; required?: boolean; type?: string; min?: string; step?: string; readonly?: boolean }) {
  return <label className={`product-field ${error ? "field-invalid" : ""}`}><span>{label}{required && <b aria-label="obligatorio"> *</b>}</span><input type={type} value={value} min={min} step={step} readOnly={readonly} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} onBlur={onBlur}/>{error && <p className="field-error">{error}</p>}</label>;
}

function SelectField({ label, value, onChange, onBlur, options, error, required, disabled, emptyLabel = "Seleccioná una opción" }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void; options: Lookup[]; error?: string; required?: boolean; emptyLabel?: string; disabled?: boolean }) {
  return <label className={`product-field ${error ? "field-invalid" : ""}`}><span>{label}{required && <b aria-label="obligatorio"> *</b>}</span><select value={value} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)} onBlur={onBlur}><option value="">{emptyLabel}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.descripcion}</option>)}</select>{error && <p className="field-error">{error}</p>}</label>;
}
