import { useState } from 'react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { Modal } from '../../components/data/Modal';
import { StatusBadge } from '../../components/data/StatusBadge';
import { formatProductName } from '../../services/productDisplay';
import type { Product } from '../../services/productsApi';
import type { SalesPrice, SalesPriceCorrection } from '../../services/salesPricesApi';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('es-AR') : 'Sin fecha de fin';
const PAGE_SIZE = 6;

export function PriceHistoryModal({ product, prices, corrections, loading, error, onClose }: {
  product: Product; prices: SalesPrice[]; corrections: SalesPriceCorrection[];
  loading: boolean; error: string; onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const sortedPrices = [...prices].sort((a, b) =>
    new Date(b.fechaVigenciaDesde).getTime() - new Date(a.fechaVigenciaDesde).getTime() || b.precioVentaId - a.precioVentaId);
  const sortedCorrections = [...corrections].sort((a, b) =>
    new Date(b.fechaCorreccion).getTime() - new Date(a.fechaCorreccion).getTime());
  const currentPage = Math.min(page, Math.max(1, Math.ceil(sortedPrices.length / PAGE_SIZE)));
  const columns: DataTableColumn<SalesPrice>[] = [
    { key: 'amount', header: 'Importe', render: row => <strong>{money.format(row.precio)}</strong> },
    { key: 'from', header: 'Vigente desde', render: row => date(row.fechaVigenciaDesde) },
    { key: 'to', header: 'Vigente hasta', render: row => date(row.fechaVigenciaHasta) },
    { key: 'state', header: 'Estado', render: row => <StatusBadge tone={row.activo ? 'success' : 'neutral'}>{row.activo ? 'Vigente' : 'Histórico'}</StatusBadge> },
  ];
  return <Modal wide title="Historial de precios" subtitle={`${formatProductName(product)} · ${product.codigo}`} onClose={onClose}>
    <div className="sales-price-history">
      {error && <div className="sales-prices-error" role="alert">{error}</div>}
      {!error && <>
      <section className="sales-price-history-section"><h3>Historial de vigencias</h3>
        <DataTable rows={sortedPrices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)} columns={columns} rowKey={row => row.precioVentaId} loading={loading} loadingText="Consultando historial…" page={currentPage} pageSize={PAGE_SIZE} totalRecords={sortedPrices.length} onPageChange={setPage} className="sales-price-history-table" emptyState={<div className="state-box">Este producto todavía no tiene precios registrados.</div>}/>
      </section>
      <section className="sales-price-history-section"><h3>Correcciones auditadas</h3>
        {loading ? <div className="state-box">Consultando correcciones…</div> : sortedCorrections.length ? <div className="sales-price-corrections">{sortedCorrections.map(item => <article key={item.precioVentaCorreccionId}>
          <div className="sales-price-correction-meta"><strong>{new Date(item.fechaCorreccion).toLocaleString('es-AR')}</strong><span>{item.usuarioNombre}</span></div>
          <div className="sales-price-correction-amounts"><div><small>Importe anterior</small><strong>{money.format(item.importeAnterior)}</strong></div><span aria-hidden="true">→</span><div><small>Importe corregido</small><strong>{money.format(item.importeNuevo)}</strong></div></div>
          <p><span>Motivo:</span> {item.motivo}</p>
        </article>)}</div> : <p className="sales-price-muted">No se registraron correcciones para este producto.</p>}
      </section>
      </>}
    </div>
  </Modal>;
}
