import { useEffect, useState } from 'react';
import { apiErrorMessage } from '../../services/apiClient';
import { salesCustomersApi, type AddressType, type CustomerAddressPayload, type Lookup } from '../../services/salesCustomersApi';

export const emptyAddress: CustomerAddressPayload = {
  tipoDomicilioId: 0, calle: '', altura: '', pisoDepto: null, barrio: null,
  codigoPostal: null, localidadId: 0, provinciaId: 0,
};
export type AddressField = 'tipoDomicilioId' | 'calle' | 'altura' | 'provinciaId' | 'localidadId';
export type AddressErrors = Partial<Record<AddressField, string>>;

export function cleanAddress(value: CustomerAddressPayload): CustomerAddressPayload {
  return { ...value, calle: value.calle.trim(), altura: value.altura.trim(),
    pisoDepto: value.pisoDepto?.trim() || null, barrio: value.barrio?.trim() || null,
    codigoPostal: value.codigoPostal?.trim() || null };
}

export function validateAddress(value: CustomerAddressPayload, types: AddressType[], provinces: Lookup[], localities: Lookup[], existingTypeId?: number | null): AddressErrors {
  const errors: AddressErrors = {};
  if (!types.some(type => type.tipoDomicilioId === value.tipoDomicilioId && (type.activo || type.tipoDomicilioId === existingTypeId))) errors.tipoDomicilioId = 'Seleccioná un tipo de domicilio activo.';
  if (!value.calle.trim()) errors.calle = 'Ingresá la calle.';
  if (!value.altura.trim()) errors.altura = 'Ingresá la altura.';
  if (!provinces.some(item => item.id === value.provinciaId)) errors.provinciaId = 'Seleccioná una provincia.';
  if (!localities.some(item => item.id === value.localidadId)) errors.localidadId = 'Seleccioná una localidad de esa provincia.';
  return errors;
}

export function useAddressCatalog(provinceId: number, enabled = true) {
  const [types, setTypes] = useState<AddressType[]>([]);
  const [provinces, setProvinces] = useState<Lookup[]>([]);
  const [localities, setLocalities] = useState<Lookup[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    let active = true; setLoading(true);
    void Promise.all([salesCustomersApi.addressTypes(), salesCustomersApi.provinces()])
      .then(([nextTypes, nextProvinces]) => { if (active) { setTypes(nextTypes); setProvinces(nextProvinces); setError(''); } })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudieron consultar los catálogos de direcciones.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !provinceId) { setLocalities([]); return; }
    let active = true;
    void salesCustomersApi.localities(provinceId)
      .then(items => { if (active) { setLocalities(items); setError(''); } })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudieron consultar las localidades.')); });
    return () => { active = false; };
  }, [enabled, provinceId]);
  return { types, provinces, localities, error, loading };
}

type Props = {
  value: CustomerAddressPayload;
  onChange: (value: CustomerAddressPayload) => void;
  types: AddressType[]; provinces: Lookup[]; localities: Lookup[];
  errors: AddressErrors;
  existingTypeId?: number | null;
  disabled?: boolean;
};

export function CustomerAddressFields({ value, onChange, types, provinces, localities, errors, existingTypeId, disabled = false }: Props) {
  const update = <K extends keyof CustomerAddressPayload>(key: K, next: CustomerAddressPayload[K]) =>
    onChange({ ...value, [key]: next, ...(key === 'provinciaId' ? { localidadId: 0 } : {}) });
  const currentInactive = types.find(type => type.tipoDomicilioId === existingTypeId && !type.activo);
  return <div className="sales-customers-form-grid">
    <label>Tipo de domicilio *<select value={value.tipoDomicilioId || ''} disabled={disabled} aria-invalid={Boolean(errors.tipoDomicilioId)} onChange={event => update('tipoDomicilioId', Number(event.target.value))}>
      <option value="">Seleccionar</option>{types.filter(type => type.activo).map(type => <option key={type.tipoDomicilioId} value={type.tipoDomicilioId}>{type.nombre}</option>)}
      {currentInactive && <option value={currentInactive.tipoDomicilioId}>{currentInactive.nombre} (inactivo)</option>}
    </select>{errors.tipoDomicilioId && <small className="field-error">{errors.tipoDomicilioId}</small>}</label>
    <label>Calle *<input maxLength={120} value={value.calle} disabled={disabled} aria-invalid={Boolean(errors.calle)} onChange={event => update('calle', event.target.value)}/>{errors.calle && <small className="field-error">{errors.calle}</small>}</label>
    <label>Altura *<input maxLength={20} value={value.altura} disabled={disabled} aria-invalid={Boolean(errors.altura)} onChange={event => update('altura', event.target.value)}/>{errors.altura && <small className="field-error">{errors.altura}</small>}</label>
    <label>Piso / departamento<input maxLength={50} value={value.pisoDepto ?? ''} disabled={disabled} onChange={event => update('pisoDepto', event.target.value || null)}/></label>
    <label>Barrio<input maxLength={100} value={value.barrio ?? ''} disabled={disabled} onChange={event => update('barrio', event.target.value || null)}/></label>
    <label>Código postal<input maxLength={20} value={value.codigoPostal ?? ''} disabled={disabled} onChange={event => update('codigoPostal', event.target.value || null)}/></label>
    <label>Provincia *<select value={value.provinciaId || ''} disabled={disabled} aria-invalid={Boolean(errors.provinciaId)} onChange={event => update('provinciaId', Number(event.target.value))}><option value="">Seleccionar</option>{provinces.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.provinciaId && <small className="field-error">{errors.provinciaId}</small>}</label>
    <label>Localidad *<select value={value.localidadId || ''} disabled={disabled || !value.provinciaId} aria-invalid={Boolean(errors.localidadId)} onChange={event => update('localidadId', Number(event.target.value))}><option value="">Seleccionar</option>{localities.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select>{errors.localidadId && <small className="field-error">{errors.localidadId}</small>}</label>
  </div>;
}
