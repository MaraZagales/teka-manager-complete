import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ContactRound, FileText, Save } from 'lucide-react';
import { Modal } from '../../components/data/Modal';
import type { SalesCustomer } from '../../services/salesOrdersApi';
import type { CustomerPayload, Lookup } from '../../services/salesCustomersApi';
import { cleanCustomerPayload, customerCoincidences, validateCustomer, type CustomerFieldErrors } from './customerValidation';

type Props = {
  mode: 'create' | 'edit'; value: CustomerPayload; customers: SalesCustomer[]; editingId?: number;
  documentTypes: Lookup[]; ivaConditions: Lookup[]; saving: boolean; error: string;
  onChange: (value: CustomerPayload) => void; onCancel: () => void;
  onSave: (value: CustomerPayload) => Promise<void>;
  addressSection?: ReactNode;
  addressDirty?: boolean;
};

export function CustomerForm({ mode, value, customers, editingId, documentTypes, ivaConditions, saving, error, onChange, onCancel, onSave, addressSection, addressDirty = false }: Props) {
  const [errors, setErrors] = useState<CustomerFieldErrors>({});
  const [showCoincidences, setShowCoincidences] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [original] = useState(() => JSON.stringify(value));
  const dirty = JSON.stringify(value) !== original || addressDirty;
  const coincidences = useMemo(() => customerCoincidences(customers, value, editingId), [customers, value, editingId]);
  const update = <K extends keyof CustomerPayload>(key: K, next: CustomerPayload[K]) => {
    onChange({ ...value, [key]: next });
    setErrors(current => ({ ...current, [key]: undefined, ...(key === 'telefono' || key === 'email' ? { contacto: undefined } : {}) }));
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (saving) return;
    const clean = cleanCustomerPayload(value);
    const next = validateCustomer(clean, documentTypes);
    if (customerCoincidences(customers, clean, editingId).document) next.documento = 'Ya existe un cliente con ese tipo y número de documento.';
    setErrors(next); setShowCoincidences(true);
    if (Object.keys(next).length) return;
    await onSave(clean);
  }
  function field(label: string, key: 'nombre' | 'apellido' | 'documento' | 'telefono' | 'email', maxLength: number, required = false) {
    const issue = (key === 'apellido' ? undefined : errors[key]) || ((key === 'telefono' || key === 'email') ? errors.contacto : undefined);
    return <label className={`product-field ${issue ? 'field-invalid' : ''}`}><span>{label}{required && <b> *</b>}</span><input type={key === 'email' ? 'email' : 'text'} maxLength={maxLength} value={value[key] ?? ''} aria-invalid={Boolean(issue)} onBlur={() => { if (key === 'documento' || key === 'telefono' || key === 'email') setShowCoincidences(true); }} onChange={event => { if (key === 'nombre') update('nombre', event.target.value); else update(key, event.target.value || null); }}/>{issue && <p className="field-error">{issue}</p>}</label>;
  }
  function select(label: string, key: 'tipoDocumentoId' | 'condicionIVAId', options: Lookup[]) {
    return <label className={`product-field ${errors[key] ? 'field-invalid' : ''}`}><span>{label}<b> *</b></span><select value={value[key] || ''} aria-invalid={Boolean(errors[key])} onChange={event => update(key, Number(event.target.value))}><option value="">Seleccionar</option>{options.map(option => <option key={option.id} value={option.id}>{option.descripcion}</option>)}</select>{errors[key] && <p className="field-error">{errors[key]}</p>}</label>;
  }
  return <><form className="product-editor customer-editor" noValidate onSubmit={event => void submit(event)}>
    <header className="product-editor-header"><div className="product-editor-heading"><h1>{mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'}</h1></div><div className="product-editor-actions"><button type="button" className="button secondary" disabled={saving} onClick={() => dirty ? setConfirmCancel(true) : onCancel()}>Cancelar</button><button type="submit" className="button primary" disabled={saving}><Save size={16}/>{saving ? 'Guardando…' : 'Guardar cliente'}</button></div></header>
    {error && <div className="product-form-alert" role="alert">{error}</div>}
    <div className="customer-editor-grid"><section className="product-form-section"><header><span><ContactRound size={18}/></span><div><h2>Información principal</h2></div></header><div className="product-form-grid">
      {field('Nombre', 'nombre', 100, true)}{field('Apellido', 'apellido', 100)}
      {select('Tipo de documento', 'tipoDocumentoId', documentTypes)}{field('Número de documento', 'documento', 20)}
      {select('Condición frente al IVA', 'condicionIVAId', ivaConditions)}
    </div></section><section className="product-form-section"><header><span><FileText size={18}/></span><div><h2>Contacto y observaciones</h2></div></header><div className="product-form-grid">
      {field('Teléfono', 'telefono', 30)}{field('Correo electrónico', 'email', 150)}
      {showCoincidences && (coincidences.email || coincidences.phone) && <div className="sales-customer-warning product-field-wide" role="status"><AlertTriangle size={17}/><span>Hay otro cliente con el mismo {coincidences.email && coincidences.phone ? 'correo y teléfono' : coincidences.email ? 'correo' : 'teléfono'}. Verificá los datos; podés continuar si corresponde a otra persona.</span></div>}
      <label className="product-field product-field-wide"><span>Observaciones</span><textarea maxLength={500} rows={4} value={value.observaciones ?? ''} onChange={event => update('observaciones', event.target.value || null)}/></label>
    </div></section></div>{addressSection}
  </form>{confirmCancel && <Modal title="Descartar cambios" onClose={() => setConfirmCancel(false)}><div className="product-confirm-dialog"><div><AlertTriangle size={21}/><p>Hay cambios sin guardar. Si salís ahora, se perderán.</p></div><footer><button type="button" className="button secondary" onClick={() => setConfirmCancel(false)}>Seguir editando</button><button type="button" className="button danger" onClick={onCancel}>Descartar cambios</button></footer></div></Modal>}</>;
}
