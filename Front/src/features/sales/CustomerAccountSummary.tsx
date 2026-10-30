import { useEffect, useState } from 'react';
import { RefreshCw, WalletCards } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components/data/DataTable';
import { apiErrorMessage } from '../../services/apiClient';
import { customerOverviewApi, type CustomerAccountMovement, type CustomerAccountSummary as Summary } from '../../services/customerOverviewApi';
import { ars, dateOnly } from './salesOrderUtils';

export function CustomerAccountSummary({ customerId }: { customerId: number }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError('');
    void customerOverviewApi.accountSummary(customerId).then(value => { if (active) setSummary(value); })
      .catch(cause => { if (active) setError(apiErrorMessage(cause, 'No se pudo consultar la cuenta corriente.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customerId, retry]);
  const columns: DataTableColumn<CustomerAccountMovement>[] = [
    { key: 'date', header: 'Fecha', render: row => dateOnly(row.fechaMovimiento) },
    { key: 'type', header: 'Movimiento', render: row => row.tipoMovimientoNombre },
    { key: 'reference', header: 'Referencia', render: row => row.pedidoId ? <a href={`/ventas/pedidos/${row.pedidoId}`}>Pedido #{row.pedidoId}</a> : row.cobroId ? `Cobro #${row.cobroId}` : row.comprobanteId ? `Comprobante #${row.comprobanteId}` : '—' },
    { key: 'debit', header: 'Debe', render: row => row.debe ? ars.format(row.debe) : '—' },
    { key: 'credit', header: 'Haber', render: row => row.haber ? ars.format(row.haber) : '—' },
  ];
  return <section className="product-form-section customer-section"><header><span><WalletCards size={18}/></span><div><h2>Cuenta corriente</h2></div><a className="customer-section-link" href={`/ventas/clientes/${customerId}/cuenta-corriente`}>Ver detalle completo</a></header>
    {error ? <div className="product-form-alert" role="alert">{error}<button type="button" className="button secondary" onClick={() => setRetry(value => value + 1)}><RefreshCw size={15}/> Reintentar</button></div>
      : loading ? <div className="state-box">Consultando cuenta corriente…</div>
      : summary && <><div className="customer-account-totals"><div><small>Debe</small><strong>{ars.format(summary.debe)}</strong></div><div><small>Haber</small><strong>{ars.format(summary.haber)}</strong></div><div><small>Saldo de cuenta corriente</small><strong>{ars.format(summary.saldo)}</strong></div></div>{summary.desglose.length > 0 && <div className="customer-account-breakdown">{summary.desglose.map(item => <div key={item.tipoMovimientoCuentaCorrienteId}><span>{item.nombre}</span><strong>{ars.format(item.importe)}</strong></div>)}</div>}<DataTable rows={summary.ultimosMovimientos} columns={columns} rowKey={row => row.movimientoCuentaCorrienteClienteId} page={1} pageSize={5} totalRecords={summary.ultimosMovimientos.length} onPageChange={() => {}} className="customer-embedded-table customer-account-summary-table" emptyState={<div className="state-box">Este cliente no tiene movimientos en cuenta corriente.</div>}/></>}
  </section>;
}
