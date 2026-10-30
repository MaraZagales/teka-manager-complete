import { apiRequest } from "./apiClient";

export type CommercialCustomerSuggestion = {
  clienteId: number;
  nombre: string;
  apellido?: string | null;
  documento?: string | null;
  telefono?: string | null;
};

export const commercialCustomersApi = {
  search: (query: string, signal?: AbortSignal) => apiRequest<CommercialCustomerSuggestion[]>(`/api/comercial/clientes/buscar?q=${encodeURIComponent(query)}`, { signal }),
  get: async (id: number, signal?: AbortSignal) => {
    const result = await apiRequest<CommercialCustomerSuggestion[] | CommercialCustomerSuggestion>(`/api/comercial/clientes/buscar?clienteId=${id}`, { signal });
    // La búsqueda por ID puede devolver una lista o un registro único.
    return (Array.isArray(result) ? result.find((item) => item.clienteId === id) : result?.clienteId === id ? result : null) ?? null;
  },
};
