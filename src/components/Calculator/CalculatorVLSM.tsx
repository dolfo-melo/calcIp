import { useState } from 'react';
import { calculateVLSM, VLSMEntry, VLSMRequirement } from '../../core/vlsm';
import { isValidIPv4, parseMaskInput } from '../../core/utils';
import { exportVLSMToCSV, exportToJSON } from '../../export/csvExport';
import { exportVLSMToPDF } from '../../export/pdfExport';
import { useApp } from '../../context/AppContext';

export default function CalculatorVLSM() {
  const { dispatch } = useApp();
  const [baseIP, setBaseIP] = useState('192.168.10.0');
  const [baseMask, setBaseMask] = useState('24');
  const [requirements, setRequirements] = useState<VLSMRequirement[]>([
    { id: crypto.randomUUID(), name: 'Escritório', hosts: 50 },
    { id: crypto.randomUUID(), name: 'Servidores', hosts: 10 },
    { id: crypto.randomUUID(), name: 'Câmeras',    hosts: 5  },
  ]);
  const [results, setResults] = useState<VLSMEntry[] | null>(null);
  const [error, setError] = useState('');

  function addReq() {
    setRequirements([...requirements, { id: crypto.randomUUID(), name: `Segmento-${requirements.length + 1}`, hosts: 10 }]);
  }

  function removeReq(id: string) {
    setRequirements(requirements.filter(r => r.id !== id));
  }

  function updateReq(id: string, field: 'name' | 'hosts', value: string | number) {
    setRequirements(requirements.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function handleCalculate() {
    if (!isValidIPv4(baseIP.trim())) { setError('IP base inválido'); return; }
    const cidr = parseMaskInput(baseMask);
    if (cidr === null) { setError('Máscara inválida'); return; }
    const valid = requirements.filter(r => r.name.trim() && r.hosts > 0);
    if (!valid.length) { setError('Adicione pelo menos uma sub-rede com hosts > 0'); return; }
    setError('');
    const res = calculateVLSM(baseIP.trim(), cidr, valid);
    if ('error' in res) { setError(res.error); setResults(null); }
    else {
      setResults(res);
      // Persist to global state so ProjectManager can import
      dispatch({ type: 'SET_VLSM_RESULTS', results: res });
    }
  }

  const baseLabel = `${baseIP}/${parseMaskInput(baseMask) ?? '?'}`;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Config card */}
      <div className="term-card">
        <div className="term-header">
          <div className="flex items-center gap-2">
            <span className="text-term-amber text-glow-amber">■</span>
            <span>VLSM :: VARIABLE LENGTH SUBNET MASKING</span>
          </div>
          {results && <span className="term-badge term-badge-amber">{results.length} REDES</span>}
        </div>

        <div className="p-4 space-y-4">
          <p className="text-term-muted text-xs font-mono leading-relaxed">
            # Divide rede base em sub-redes otimizadas (maior → menor).
          </p>

          {/* Base network */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="term-label">&gt; rede base</label>
              <input type="text" id="vlsm-ip" className="term-input" value={baseIP}
                onChange={e => setBaseIP(e.target.value)} placeholder="192.168.10.0" />
            </div>
            <div>
              <label className="term-label">&gt; máscara / cidr</label>
              <input type="text" id="vlsm-mask" className="term-input" value={baseMask}
                onChange={e => setBaseMask(e.target.value)} placeholder="24" />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="term-label mb-0">&gt; sub-redes necessárias</label>
              <button className="term-btn-ghost text-[10px] px-2 py-1 tracking-widest" onClick={addReq}>+ ADD</button>
            </div>

            <div className="space-y-2">
              {requirements.map((req, idx) => (
                <div key={req.id} className="grid grid-cols-[1fr_100px_32px] gap-2 items-center">
                  <input
                    type="text"
                    className="term-input text-xs"
                    value={req.name}
                    onChange={e => updateReq(req.id, 'name', e.target.value)}
                    placeholder={`Segmento-${idx + 1}`}
                  />
                  <input
                    type="number"
                    min={1}
                    className="term-input text-xs no-spin"
                    value={req.hosts}
                    onChange={e => updateReq(req.id, 'hosts', parseInt(e.target.value) || 0)}
                    title="hosts necessários"
                  />
                  <button
                    className="term-btn-red text-[10px] px-1 py-1 flex items-center justify-center"
                    onClick={() => removeReq(req.id)}
                    disabled={requirements.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="text-term-muted text-[10px] font-mono mt-1 tracking-widest">
              (nome / hosts necessários)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="border border-term-red bg-term-red/5 p-3 text-term-red text-xs font-mono">
              ! ERRO: {error}
            </div>
          )}

          <button id="calc-vlsm-btn" className="term-btn" onClick={handleCalculate}>
            ▶ calcular vlsm
          </button>
        </div>
      </div>

      {/* Results */}
      {results && results.length > 0 && (
        <div className="term-card animate-slide-up">
          <div className="term-header">
            <div className="flex items-center gap-2">
              <span className="text-term-amber text-glow-amber">◆</span>
              <span>RESULTADO VLSM :: {baseLabel}</span>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="term-table">
                <thead>
                  <tr>
                    {['#', 'NOME', 'REQ', 'ALOC', 'REDE/CIDR', 'MÁSCARA', 'GATEWAY', '1° ÚTIL', 'ÚLT. HOST', 'BROADCAST'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.id}>
                      <td className="text-term-muted">{i + 1}</td>
                      <td className="text-term-white font-semibold">{r.requirementName}</td>
                      <td className="text-term-mid">{r.requiredHosts}</td>
                      <td>
                        <span className="term-badge term-badge-green">{r.usableHosts}</span>
                      </td>
                      <td className="text-term-bright text-glow-sm font-semibold">
                        {r.networkAddress}/{r.cidr}
                      </td>
                      <td className="text-term-white">{r.subnetMask}</td>
                      <td className="text-term-amber text-glow-amber font-semibold">{r.gateway}</td>
                      <td className="text-term-cyan">{r.firstUsable ?? r.firstHost}</td>
                      <td className="text-term-cyan">{r.lastHost}</td>
                      <td className="text-term-amber">{r.broadcastAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-term-border">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-term-muted text-[10px] font-mono tracking-widest">EXPORTAR:</span>
                <button className="term-btn-cyan" onClick={() => exportVLSMToCSV(results)}>↓ CSV</button>
                <button className="term-btn-amber" onClick={() => exportVLSMToPDF(results, baseLabel)}>↓ PDF</button>
                <button className="term-btn-ghost text-xs px-3 py-1 tracking-widest" onClick={() => exportToJSON(results)}>↓ JSON</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
