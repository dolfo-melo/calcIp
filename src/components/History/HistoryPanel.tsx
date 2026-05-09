import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubnetResult } from '../../core/subnet';
import { clearHistory, deleteHistoryEntry } from '../../db/indexeddb';
import HistoryDetailModal from './HistoryDetailModal';
import { CalcResult } from '../../context/AppContext';
import { exportSubnetToCSV, exportToJSON } from '../../export/csvExport';

function isIPv4Result(r: object): r is SubnetResult {
  return 'subnetMask' in r;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function downloadEntry(r: CalcResult) {
  if (isIPv4Result(r)) {
    const label = `${(r as SubnetResult).networkAddress}_${(r as SubnetResult).cidr}`;
    exportSubnetToCSV([r as SubnetResult], `subnet_${label}.csv`);
  } else {
    const addr = (r as { compressedAddress?: string }).compressedAddress ?? 'ipv6';
    exportToJSON(r, `ipv6_${addr.replace(/:/g, '-')}.json`);
  }
}

export default function HistoryPanel() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CalcResult | null>(null);

  const filtered = state.history.filter(r => {
    const q = search.toLowerCase();
    if (isIPv4Result(r)) return r.inputIP.includes(q) || `/${r.cidr}`.includes(q) || r.networkAddress.includes(q);
    return (r as { inputAddress: string }).inputAddress?.toLowerCase().includes(q);
  });

  function handleClear() {
    clearHistory();
    dispatch({ type: 'CLEAR_HISTORY' });
  }

  function handleDelete(id: string) {
    deleteHistoryEntry(id);
    dispatch({ type: 'SET_HISTORY', history: state.history.filter(h => h.id !== id) });
  }

  return (
    <>
      <div className="term-card">
        <div className="term-header">
          <div className="flex items-center gap-2">
            <span className="text-term-bright">◉</span>
            <span>LOG :: HISTÓRICO</span>
            <span className="term-badge term-badge-green">{String(state.history.length).padStart(3, '0')}</span>
          </div>
          {state.history.length > 0 && (
            <button className="term-btn-red" onClick={handleClear}>CLR</button>
          )}
        </div>

        <div className="p-3 space-y-2">
          {state.history.length > 0 && (
            <div>
              <input
                id="history-search"
                type="search"
                className="term-input text-xs"
                placeholder="> buscar por ip ou cidr..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-term-muted text-2xl">_</span>
              <p className="text-term-muted text-xs font-mono tracking-widest">
                {state.history.length === 0 ? 'AGUARDANDO ENTRADAS...' : 'NENHUM RESULTADO'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {filtered.map(r => {
                const isV4 = isIPv4Result(r);
                return (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-2 p-2 border border-term-border hover:border-term-muted hover:bg-term-surface transition-all duration-100 group"
                  >
                    {/* Clickable IP area → opens detail modal */}
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => setSelected(r)}
                      title="Ver detalhes"
                    >
                      {isV4 ? (
                        <>
                          <div className="text-term-bright text-xs font-mono font-semibold text-glow-sm hover:text-glow transition-all">
                            {(r as SubnetResult).inputIP}/{(r as SubnetResult).cidr}
                          </div>
                          <div className="text-term-muted text-[10px] font-mono mt-0.5">
                            rede:{(r as SubnetResult).networkAddress} · gw:{(r as SubnetResult).gateway ?? (r as SubnetResult).firstHost} · {(r as SubnetResult).numberOfSubnets} redes · {(r as SubnetResult).usableHosts}h
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-term-cyan text-xs font-mono font-semibold text-glow-cyan hover:underline transition-all">
                            {(r as { compressedAddress: string }).compressedAddress}/{(r as { prefix: number }).prefix}
                          </div>
                          <div className="text-term-muted text-[10px] font-mono mt-0.5">
                            {(r as { addressType: string }).addressType} · {formatTime(r.timestamp)}
                          </div>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`term-badge text-[9px] ${isV4 ? 'term-badge-green' : 'term-badge-cyan'}`}>
                        {isV4 ? 'v4' : 'v6'}
                      </span>
                      {/* Download button — CSV para IPv4, JSON para IPv6 */}
                      <button
                        className="opacity-0 group-hover:opacity-100 text-term-muted hover:text-term-cyan text-xs font-mono transition-all"
                        onClick={e => { e.stopPropagation(); downloadEntry(r); }}
                        title={isV4 ? 'baixar CSV' : 'baixar JSON'}
                      >
                        ↓
                      </button>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-term-muted hover:text-term-red text-xs font-mono transition-all"
                        onClick={() => handleDelete(r.id)}
                        title="remover"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <HistoryDetailModal result={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
