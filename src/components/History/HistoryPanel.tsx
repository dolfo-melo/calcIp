import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubnetResult } from '../../core/subnet';
import { clearHistory, deleteHistoryEntry } from '../../db/indexeddb';

function isIPv4Result(r: object): r is SubnetResult {
  return 'subnetMask' in r;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function HistoryPanel() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');

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
                  <div className="flex-1 min-w-0">
                    {isV4 ? (
                      <>
                        <div className="text-term-bright text-xs font-mono font-semibold text-glow-sm">
                          {(r as SubnetResult).inputIP}/{(r as SubnetResult).cidr}
                        </div>
                        <div className="text-term-muted text-[10px] font-mono mt-0.5">
                          rede:{(r as SubnetResult).networkAddress} · {(r as SubnetResult).usableHosts}h · {formatTime(r.timestamp)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-term-cyan text-xs font-mono font-semibold text-glow-cyan">
                          {(r as { compressedAddress: string }).compressedAddress}/{(r as { prefix: number }).prefix}
                        </div>
                        <div className="text-term-muted text-[10px] font-mono mt-0.5">
                          {(r as { addressType: string }).addressType} · {formatTime(r.timestamp)}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`term-badge text-[9px] ${isV4 ? 'term-badge-green' : 'term-badge-cyan'}`}>
                      {isV4 ? 'v4' : 'v6'}
                    </span>
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
  );
}
