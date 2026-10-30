import type { SalesCustomer } from '../../services/salesOrdersApi';
import type { CustomerPayload, Lookup } from '../../services/salesCustomersApi';

export type CustomerFieldErrors = Partial<Record<'nombre'|'tipoDocumentoId'|'documento'|'condicionIVAId'|'telefono'|'email'|'contacto', string>>;

export function normalizeDocument(value: string | null | undefined) {
  return (value ?? '').normalize('NFKC').toLocaleUpperCase('es-AR').replace(/[^\p{L}\p{N}]/gu, '');
}

export function normalizePhone(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

export function validateCustomer(payload: CustomerPayload, documentTypes: Lookup[]): CustomerFieldErrors {
  const errors: CustomerFieldErrors = {};
  if (!payload.nombre.trim()) errors.nombre = 'Ingresá el nombre del cliente.';
  if (!payload.tipoDocumentoId) errors.tipoDocumentoId = 'Seleccioná el tipo de documento.';
  if (!payload.condicionIVAId) errors.condicionIVAId = 'Seleccioná la condición frente al IVA.';
  const document = normalizeDocument(payload.documento);
  const documentType = documentTypes.find(item => item.id === payload.tipoDocumentoId);
  if (payload.documento && !document) errors.documento = 'Ingresá un número de documento válido.';
  if (document && documentType?.codigoARCA != null && !/^\d+$/.test(document)) errors.documento = 'El documento solo puede contener números y separadores.';
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) errors.email = 'Ingresá un correo electrónico válido.';
  if (payload.telefono) {
    const digits = normalizePhone(payload.telefono);
    if (digits.length < 6 || digits.length > 20) errors.telefono = 'Ingresá un teléfono válido.';
  }
  if (!payload.telefono?.trim() && !payload.email?.trim()) errors.contacto = 'Informá al menos un teléfono o correo electrónico.';
  return errors;
}

export function customerCoincidences(customers: SalesCustomer[], form: CustomerPayload, editingId?: number) {
  const document = normalizeDocument(form.documento);
  const email = form.email?.trim().toLocaleLowerCase('es-AR') ?? '';
  const phone = normalizePhone(form.telefono);
  const others = customers.filter(item => item.clienteId !== editingId);
  return {
    document: document ? others.some(item => item.tipoDocumentoId === form.tipoDocumentoId && normalizeDocument(item.documento) === document) : false,
    email: email ? others.some(item => item.email?.trim().toLocaleLowerCase('es-AR') === email) : false,
    phone: phone ? others.some(item => normalizePhone(item.telefono) === phone) : false,
  };
}

export function cleanCustomerPayload(form: CustomerPayload): CustomerPayload {
  return {
    nombre: form.nombre.trim(), apellido: form.apellido?.trim() || null,
    tipoDocumentoId: form.tipoDocumentoId, documento: form.documento?.trim() || null,
    telefono: form.telefono?.trim() || null, email: form.email?.trim() || null,
    condicionIVAId: form.condicionIVAId, observaciones: form.observaciones?.trim() || null,
  };
}
