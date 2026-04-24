import { SubnetResult } from '../../core/subnet';
import { exportSubnetToCSV, exportToJSON } from '../../export/csvExport';
import { exportSubnetToPDF } from '../../export/pdfExport';

interface Props {
  results: SubnetResult[];
  filename?: string;
}

export default function ExportBar({ results, filename }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-term-muted text-[10px] font-mono tracking-widest">EXPORTAR:</span>

      <button
        id="export-csv-btn"
        className="term-btn-cyan"
        onClick={() => exportSubnetToCSV(results, filename ? `${filename}.csv` : undefined)}
        title="Exportar CSV"
      >
        ↓ CSV
      </button>

      <button
        id="export-pdf-btn"
        className="term-btn-amber"
        onClick={() => exportSubnetToPDF(results, filename || 'Relatório')}
        title="Exportar PDF"
      >
        ↓ PDF
      </button>

      <button
        id="export-json-btn"
        className="term-btn-ghost text-xs px-3 py-1"
        onClick={() => exportToJSON(results, filename)}
        title="Exportar JSON"
      >
        ↓ JSON
      </button>
    </div>
  );
}
