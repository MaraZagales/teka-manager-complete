import { Download, FileText } from 'lucide-react';

type InventoryExportActionsProps = {
  allowed: boolean;
  disabled?: boolean;
  exporting?: boolean;
  onExcel: () => void;
  onPdf: () => void;
};

export function InventoryExportActions({ allowed, disabled = false, exporting = false, onExcel, onPdf }: InventoryExportActionsProps) {
  if (!allowed) return null;
  return <div className="report-actions">
    <button className="button secondary" type="button" disabled={disabled || exporting} onClick={onExcel}><Download size={16} />{exporting ? 'Exportando…' : 'Exportar Excel'}</button>
    <button className="button primary" type="button" disabled={disabled || exporting} onClick={onPdf}><FileText size={16} />Generar reporte</button>
  </div>;
}
