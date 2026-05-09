import React, { useEffect, useMemo } from 'react';
import { SubnetResult } from '../../core/subnet';
import { exportPossibleSubnetsToPDF } from '../../export/pdfExport';
import { exportSubnetToCSV, exportToJSON } from '../../export/csvExport';

interface Props {
  subnets: SubnetResult[];
  baseIp: string;
  cidr: number;
  onClose: () => void;
}

export default function PossibleSubnetsModal({ subnets, baseIp, cidr, onClose }: Props) {
  // Fecha com a tecla Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const title = useMemo(() => {
    if (subnets.length <= 1) {
      return `Rede /${cidr} para ${baseIp}`;
    }
    
    // A lógica de parentCidr simplificada e direta, exatamente igual à usada para gerar
    const parentCidr = cidr % 8 === 0 ? cidr : Math.floor(cidr / 8) * 8;

    const parts = baseIp.split('.');
    let wildcard = baseIp;
    if (parentCidr === 24) wildcard = `${parts[0]}.${parts[1]}.${parts[2]}.*`;
    else if (parentCidr === 16) wildcard = `${parts[0]}.${parts[1]}.*.*`;
    else if (parentCidr === 8) wildcard = `${parts[0]}.*.*.*`;
    
    return `Todas as ${subnets.length} possíveis redes /${cidr} para ${wildcard}`;
  }, [baseIp, cidr, subnets.length]);

  return (
    <div
      className="term-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Possíveis Sub-redes"
    >
      <div
        className="term-modal animate-slide-up flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '700px', width: '95%' }}
      >
        {/* Cabeçalho do Modal */}
        <div className="term-header flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-term-bright text-glow">◆</span>
            <span className="font-semibold text-sm sm:text-base">{title}</span>
          </div>
          <button
            className="text-term-muted hover:text-term-red font-mono text-sm transition-all"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Corpo */}
        <div className="p-4 overflow-y-auto overflow-x-auto term-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-term-bg border-b border-term-border">
                <th className="p-2 text-term-muted text-xs tracking-widest uppercase font-semibold">Endereço da Rede</th>
                <th className="p-2 text-term-muted text-xs tracking-widest uppercase font-semibold">Range de Hosts Úteis</th>
                <th className="p-2 text-term-muted text-xs tracking-widest uppercase font-semibold">Endereço de Broadcast</th>
              </tr>
            </thead>
            <tbody>
              {subnets.map((s, idx) => (
                <tr 
                  key={s.id} 
                  className={`border-b border-term-border/50 hover:bg-term-highlight transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-term-highlight/30'}`}
                >
                  <td className="p-2 font-mono text-sm text-term-bright">{s.networkAddress}</td>
                  <td className="p-2 font-mono text-sm text-term-cyan">
                    {s.usableHosts > 0 ? `${s.firstUsable ?? s.firstHost} - ${s.lastHost}` : 'N/A'}
                  </td>
                  <td className="p-2 font-mono text-sm text-term-amber">{s.broadcastAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer com Botões de Exportação */}
        <div className="p-4 border-t border-term-border bg-term-darker flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
          <span className="text-term-muted text-[10px] font-mono tracking-widest uppercase">
            EXPORTAR TODAS ({subnets.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              className="term-btn-cyan"
              onClick={() => exportSubnetToCSV(subnets, `Subredes_${baseIp.replace(/[./]/g, '_')}_${cidr}.csv`)}
            >
              ↓ CSV
            </button>
            <button
              className="term-btn-amber"
              onClick={() => exportPossibleSubnetsToPDF(subnets, baseIp, cidr)}
            >
              ↓ PDF
            </button>
            <button
              className="term-btn-ghost text-xs px-3 py-1 tracking-widest"
              onClick={() => exportToJSON(subnets, `Subredes_${baseIp.replace(/[./]/g, '_')}_${cidr}.json`)}
            >
              ↓ JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
