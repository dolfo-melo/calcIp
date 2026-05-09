import { useEffect, useState } from 'react';
import { SubnetResult, generatePossibleSubnets } from '../../core/subnet';
import { IPv6Result } from '../../core/ipv6';
import { formatAddressCount } from '../../core/ipv6';
import BinaryDisplay from '../Calculator/BinaryDisplay';
import { exportSubnetToCSV, exportToJSON } from '../../export/csvExport';
import { exportSubnetToPDF } from '../../export/pdfExport';
import PossibleSubnetsModal from '../Calculator/PossibleSubnetsModal';

type AnyResult = SubnetResult | IPv6Result;

interface Props {
  result: AnyResult;
  onClose: () => void;
}

function isIPv4(r: AnyResult): r is SubnetResult {
  return 'subnetMask' in r;
}

function fmt(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function HistoryDetailModal({ result, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const v4 = isIPv4(result);
  const [showPossible, setShowPossible] = useState(false);
  const [possibleSubnets, setPossibleSubnets] = useState<SubnetResult[]>([]);

  function handleShowPossible() {
    if (!v4) return;
    const v4Result = result as SubnetResult;
    const subnets = generatePossibleSubnets(v4Result.networkAddress, v4Result.cidr);
    setPossibleSubnets(subnets);
    setShowPossible(true);
  }

  return (
    <div
      className="term-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes da entrada"
    >
      <div
        className="term-modal animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="term-header">
          <div className="flex items-center gap-2">
            <span className={v4 ? 'text-term-bright text-glow' : 'text-term-cyan text-glow-cyan'}>
              {v4 ? '◆' : '◈'}
            </span>
            <span>
              {v4
                ? `${(result as SubnetResult).networkAddress}/${(result as SubnetResult).cidr}`
                : `${(result as IPv6Result).compressedAddress}/${(result as IPv6Result).prefix}`
              }
            </span>
            <span className={`term-badge ${v4 ? 'term-badge-green' : 'term-badge-cyan'}`}>
              {v4 ? 'IPv4' : 'IPv6'}
            </span>
          </div>
          <button
            className="text-term-muted hover:text-term-red font-mono text-sm transition-all"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-term-muted text-[10px] font-mono tracking-widest">
            # Registrado em: {fmt(result.timestamp)}
          </p>

          {v4 ? (
            <>
              {/* IPv4 — primary sequence */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'REDE',      value: (result as SubnetResult).networkAddress,                                              cls: 'text-term-bright text-glow' },
                  { label: 'MÁSCARA',   value: (result as SubnetResult).subnetMask,                                                  cls: 'text-term-white' },
                  { label: 'GATEWAY',   value: (result as SubnetResult).gateway    ?? (result as SubnetResult).firstHost,             cls: 'text-term-amber text-glow-amber' },
                  { label: '1° ÚTIL',   value: (result as SubnetResult).firstUsable ?? (result as SubnetResult).firstHost,           cls: 'text-term-cyan text-glow-cyan' },
                  { label: 'ÚLT. HOST', value: (result as SubnetResult).lastHost,                                                    cls: 'text-term-cyan text-glow-cyan' },
                  { label: 'BROADCAST', value: (result as SubnetResult).broadcastAddress,                                            cls: 'text-term-amber text-glow-amber' },
                ].map(cell => (
                  <div key={cell.label} className="term-result-cell">
                    <div className="text-term-muted text-[10px] tracking-widest uppercase mb-1">{cell.label}</div>
                    <div className={`font-mono text-sm font-semibold ${cell.cls}`}>{cell.value}</div>
                  </div>
                ))}
              </div>

              {/* IPv4 — secondary info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
                {[
                  { label: 'WILDCARD',    value: (result as SubnetResult).wildcardMask,                                             cls: 'text-term-mid' },
                  { label: 'TOTAL IPs',   value: (result as SubnetResult).totalIPs.toLocaleString('pt-BR'),                         cls: 'text-term-white' },
                  { label: 'HOSTS ÚTEIS', value: (result as SubnetResult).usableHosts.toLocaleString('pt-BR'),                      cls: 'text-term-bright text-glow-sm' },
                  { label: 'CLASSE',      value: (result as SubnetResult).networkClass,                                              cls: 'text-term-mid' },
                  { label: 'SUB-REDES',   value: (result as SubnetResult).numberOfSubnets?.toLocaleString('pt-BR') || '1', cls: 'text-term-cyan text-glow-cyan' },
                ].map(cell => (
                  <div key={cell.label} className="term-result-cell">
                    <div className="text-term-muted text-[10px] tracking-widest uppercase mb-1">{cell.label}</div>
                    <div className={`font-mono text-sm font-semibold ${cell.cls}`}>{cell.value}</div>
                  </div>
                ))}
              </div>

              {/* Binary representation */}
              {(result as SubnetResult).ipBinary && (
                <div className="term-result-cell">
                  <div className="text-term-muted text-[10px] tracking-widest uppercase mb-2">
                    REPRESENTAÇÃO BINÁRIA
                  </div>
                  <BinaryDisplay
                    ipBinary={(result as SubnetResult).ipBinary}
                    maskBinary={(result as SubnetResult).maskBinary}
                    cidr={(result as SubnetResult).cidr}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* IPv6 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'ENDEREÇO COMPRIMIDO', value: (result as IPv6Result).compressedAddress,  cls: 'text-term-cyan text-glow-cyan' },
                  { label: 'ENDEREÇO EXPANDIDO',  value: (result as IPv6Result).expandedAddress,    cls: 'text-term-white' },
                  { label: 'REDE',                value: (result as IPv6Result).networkCompressed,   cls: 'text-term-bright text-glow' },
                  { label: 'PREFIXO',             value: `/${(result as IPv6Result).prefix}`,        cls: 'text-term-bright' },
                  { label: 'PRIMEIRO ENDEREÇO',   value: (result as IPv6Result).firstAddress,        cls: 'text-term-cyan' },
                  { label: 'ÚLTIMO ENDEREÇO',     value: (result as IPv6Result).lastAddress,         cls: 'text-term-cyan' },
                  { label: 'TIPO',                value: (result as IPv6Result).addressType,         cls: 'text-term-amber text-glow-amber' },
                  { label: 'TOTAL ENDEREÇOS',     value: formatAddressCount((result as IPv6Result).totalAddresses), cls: 'text-term-white' },
                ].map(cell => (
                  <div key={cell.label} className="term-result-cell">
                    <div className="text-term-muted text-[10px] tracking-widest uppercase mb-1">{cell.label}</div>
                    <div className={`font-mono text-xs font-semibold break-all ${cell.cls}`}>{cell.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Export bar ── */}
          <div className="border-t border-term-border pt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-term-muted text-[10px] font-mono tracking-widest mr-1">EXPORTAR:</span>
                {v4 ? (
                  <>
                    <button
                      className="term-btn-cyan"
                      onClick={() => exportSubnetToCSV(
                        [result as SubnetResult],
                        `subnet_${(result as SubnetResult).networkAddress}_${(result as SubnetResult).cidr}.csv`
                      )}
                    >
                      ↓ CSV
                    </button>
                    <button
                      className="term-btn-amber"
                      onClick={() => exportSubnetToPDF(
                        [result as SubnetResult],
                        `${(result as SubnetResult).networkAddress}/${(result as SubnetResult).cidr}`
                      )}
                    >
                      ↓ PDF
                    </button>
                    <button
                      className="term-btn-ghost text-xs px-3 py-1 tracking-widest"
                      onClick={() => exportToJSON(
                        result,
                        `subnet_${(result as SubnetResult).networkAddress}_${(result as SubnetResult).cidr}.json`
                      )}
                    >
                      ↓ JSON
                    </button>
                  </>
                ) : (
                  <button
                    className="term-btn-cyan"
                    onClick={() => exportToJSON(
                      result,
                      `ipv6_${(result as IPv6Result).compressedAddress.replace(/:/g, '-')}.json`
                    )}
                  >
                    ↓ JSON
                  </button>
                )}
              </div>
              
              {v4 && (
                <button
                  className="term-btn-cyan w-full sm:w-auto"
                  onClick={handleShowPossible}
                  disabled={(result as SubnetResult).cidr >= 31}
                  title={(result as SubnetResult).cidr >= 31 ? "Não disponível para /31 ou /32" : "Mostrar possíveis sub-redes"}
                >
                  ☷ TODAS AS SUB-REDES
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPossible && v4 && (
        <PossibleSubnetsModal
          subnets={possibleSubnets}
          baseIp={(result as SubnetResult).networkAddress}
          cidr={(result as SubnetResult).cidr}
          onClose={() => setShowPossible(false)}
        />
      )}
    </div>
  );
}
