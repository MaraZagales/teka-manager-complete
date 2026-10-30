import { useEffect, useState } from 'react';
import { RotateCcw, WalletCards } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { PageHeader } from '../../components/data/PageHeader';
import { apiErrorMessage } from '../../services/apiClient';
import { customerOverviewApi, type CustomerAccountMovement, type CustomerAccountPage as Page } from '../../services/customerOverviewApi';
import { salesCustomersApi, type Lookup } from '../../services/salesCustomersApi';
import type { SalesCustomer } from '../../services/salesOrdersApi';
import { ars, dateOnly } from './salesOrderUtils';
import { customerName } from './SalesCustomersPage';
import './salesCustomers.css';

export function CustomerAccountPage({ customerId }: { customerId: number }) {
  const [customer, setCustomer] = useState<SalesCustomer | null>(null);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [data, setData] = useState<Page | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => { let active = true;
    void Promise.all([salesCustomersApi.get(customerId), customerOverviewApi.movementTypes()])
      .then(([row, catalog]) => { if (active) { setCustomer(row); setTypes(catalog); } })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudo cargar el cliente.')); });
    return () => { active = false; };
  }, [customerId]);
  const invalidDates = Boolean(from && to && from > to);
  useEffect(() => { if (invalidDates) return;
    let active = true; setLoading(true); setError('');
    void customerOverviewApi.accountMovements(customerId, { desde: from || undefined, hasta: to || undefined, tipoMovimientoId: type ? Number(type) : undefined, pagina: page, tamano: 10 })
      .then(result => { if (active) setData(result); })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudieron consultar los movimientos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customerId, from, to, type, page, retry, invalidDates]);
  const columns: DataTableColumn<CustomerAccountMovement>[] = [
    { key: 'date', width: '14%', header: 'Fecha', render: row => dateOnly(row.fechaMovimiento) },
    { key: 'type', width: '22%', header: 'Movimiento', render: row => row.tipoMovimientoNombre },
    { key: 'reference', width: '25%', header: 'Referencia', render: row => <span>{row.pedidoId && <a href={`/ventas/pedidos/${row.pedidoId}`}>Pedido #{row.pedidoId}</a>}{row.cobroId && ` · Cobro #${row.cobroId}`}{row.comprobanteId && ` · Comprobante #${row.comprobanteId}`}{!row.pedidoId && !row.cobroId && !row.comprobanteId && '—'}</span> },
    { key: 'debit', width: '13%', header: 'Debe', className: 'customer-account-money-cell', headerClassName: 'customer-account-money-cell', render: row => row.debe ? ars.format(row.debe) : '—' },
    { key: 'credit', width: '13%', header: 'Haber', className: 'customer-account-money-cell', headerClassName: 'customer-account-money-cell', render: row => row.haber ? ars.format(row.haber) : '—' },
    { key: 'balance', width: '13%', header: 'Saldo', className: 'customer-account-money-cell', headerClassName: 'customer-account-money-cell', render: row => <strong>{ars.format(row.saldo)}</strong> },
  ];
  return <AppShell title="Cuenta corriente" breadcrumb="Ventas / Clientes / Cuenta corriente" backHref={`/ventas/clientes/${customerId}`} backLabel="Volver al cliente">
    <div className="customer-account-page"><PageHeader title="Cuenta corriente" description={customer ? customerName(customer) : 'Movimientos del cliente'}/>
      {data && <div className="customer-account-totals"><div><small>Debe</small><strong>{ars.format(data.debe)}</strong></div><div><small>Haber</small><strong>{ars.format(data.haber)}</strong></div><div><small>Saldo de cuenta corriente</small><strong>{ars.format(data.saldo)}</strong></div></div>}
      <div className="data-table-filters customer-account-filters"><label className="data-table-filter-field"><span>Desde</span><input type="date" value={from} max={to || undefined} onChange={event => { setFrom(event.target.value); setPage(1); }}/></label><label className="data-table-filter-field"><span>Hasta</span><input type="date" value={to} min={from || undefined} onChange={event => { setTo(event.target.value); setPage(1); }}/></label><label className="data-table-filter-field"><span>Tipo de movimiento</span><select value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="">Todos</option>{types.map(item => <option key={item.id} value={item.id}>{item.descripcion}</option>)}</select></label><button type="button" className="button secondary filter-clear-button" onClick={() => { setFrom(''); setTo(''); setType(''); setPage(1); }} disabled={!from && !to && !type}><RotateCcw size={16}/> Limpiar filtros</button></div>
      {invalidDates && <div className="product-form-alert" role="alert">La fecha Desde no puede ser posterior a Hasta.</div>}
      {error && <div className="product-form-alert" role="alert">{error}<button type="button" className="button secondary" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div>}
      <section className="product-form-section customer-section"><header><span><WalletCards size={18}/></span><div><h2>Movimientos</h2></div></header><DataTable rows={invalidDates ? [] : data?.movimientos ?? []} columns={columns} rowKey={row => row.movimientoCuentaCorrienteClienteId} loading={loading} page={data?.pagina ?? page} pageSize={10} totalRecords={invalidDates ? 0 : data?.total ?? 0} onPageChange={setPage} className="customer-embedded-table customer-account-detail-table" emptyState={<div className="state-box">No hay movimientos para los filtros seleccionados.</div>}/></section>
    </div>
  </AppShell>;
}
