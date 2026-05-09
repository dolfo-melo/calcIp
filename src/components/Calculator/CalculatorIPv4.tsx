import React, { useState } from 'react';
import { calculateSubnet, SubnetResult, generatePossibleSubnets } from '../../core/subnet';
import { isValidIPv4, parseMaskInput } from '../../core/utils';
import { useApp } from '../../context/AppContext';
import BinaryDisplay from './BinaryDisplay';
import ExportBar from './ExportBar';
import PossibleSubnetsModal from './PossibleSubnetsModal';

export default function CalculatorIPv4() {
  const { state, addResult, addToProject } = useApp();
  const [ip, setIp] = useState('192.168.1.0');
  const [mask, setMask] = useState('24');
  const [ipError, setIpError] = useState('');
  const [maskError, setMaskError] = useState('');
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [showPossible, setShowPossible] = useState(false);
  const [possibleSubnets, setPossibleSubnets] = useState<SubnetResult[]>([]);

  function validate(): { ip: string; cidr: number } | null {
    let valid = true;
    const trimIP = ip.trim();
    if (!isValidIPv4(trimIP)) { setIpError('endereço inválido'); valid = false; }
    else setIpError('');
    const cidr = parseMaskInput(mask);
    if (cidr === null) { setMaskError('máscara inválida'); valid = false; }
    else setMaskError('');
    if (!valid) return null;
    return { ip: trimIP, cidr: cidr! };
  }

  function handleCalculate() {
    const parsed = validate();
    if (!parsed) return;
    const res = calculateSubnet(parsed.ip, parsed.cidr);
    setResult(res);
    addResult(res);
  }

  function handleShowPossible() {
    if (!result) return;
    const subnets = generatePossibleSubnets(result.networkAddress, result.cidr);
    setPossibleSubnets(subnets);
    setShowPossible(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCalculate();
  }

  const PRESETS = ['/8', '/16', '/24', '/30'];

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Input card */}
      <div className="term-card">
        <div className="term-header">
          <div className="flex items-center gap-2">
            <span className="text-term-bright text-glow">■</span>
            <span>IPv4 :: CALCULADORA</span>
          </div>
          {result && <span className="term-badge term-badge-green">✓ OK</span>}
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* IP */}
            <div>
              <label className="term-label" htmlFor="ipv4-input">
                &gt; endereço IP
              </label>
              <input
                id="ipv4-input"
                type="text"
                className={`term-input${ipError ? ' error' : ''}`}
                value={ip}
                onChange={e => setIp(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="192.168.1.0"
                spellCheck={false}
                autoComplete="off"
              />
              {ipError
                ? <p className="text-term-red text-xs mt-1 font-mono">! {ipError}</p>
                : <p className="text-term-muted text-xs mt-1 font-mono">ex: 10.0.0.0</p>
              }
            </div>

            {/* Mask */}
            <div>
              <label className="term-label" htmlFor="mask-input">
                &gt; máscara / cidr
              </label>
              <input
                id="mask-input"
                type="text"
                className={`term-input${maskError ? ' error' : ''}`}
                value={mask}
                onChange={e => setMask(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="24 ou 255.255.255.0"
                spellCheck={false}
                autoComplete="off"
              />
              {maskError
                ? <p className="text-term-red text-xs mt-1 font-mono">! {maskError}</p>
                : <p className="text-term-muted text-xs mt-1 font-mono">ex: /24 ou 255.255.255.0</p>
              }
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button id="calc-ipv4-btn" className="term-btn" onClick={handleCalculate}>
              ▶ calcular
            </button>
            <span className="text-term-muted text-xs font-mono hidden sm:inline">presets:</span>
            {PRESETS.map(p => (
              <button
                key={p}
                className="term-btn-ghost text-xs px-2 py-1"
                onClick={() => { setMask(p.replace('/', '')); setMaskError(''); }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="term-card animate-slide-up">
          <div className="term-header">
            <div className="flex items-center gap-2">
              <span className="text-term-bright text-glow">◆</span>
              <span>RESULTADO :: {result.networkAddress}/{result.cidr}</span>
            </div>
            <span className="term-badge term-badge-cyan">CLASSE {result.networkClass}</span>
          </div>

          <div className="p-4">
            {/* Primary sequence: Rede → Máscara → Gateway → 1°Útil → Último Host → Broadcast */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
              {[
                { label: 'REDE', value: result.networkAddress, cls: 'text-term-bright text-glow' },
                { label: 'MÁSCARA', value: result.subnetMask, cls: 'text-term-white' },
                { label: 'GATEWAY', value: result.gateway ?? result.firstHost, cls: 'text-term-amber text-glow-amber' },
                { label: '1° ÚTIL', value: result.firstUsable ?? result.firstHost, cls: 'text-term-cyan text-glow-cyan' },
                { label: 'ÚLT. HOST', value: result.lastHost, cls: 'text-term-cyan text-glow-cyan' },
                { label: 'BROADCAST', value: result.broadcastAddress, cls: 'text-term-amber text-glow-amber' },
              ].map(cell => (
                <div key={cell.label} className="term-result-cell">
                  <div className="text-term-muted text-[10px] tracking-widest uppercase mb-1">{cell.label}</div>
                  <div className={`font-mono text-sm font-semibold ${cell.cls}`}>{cell.value}</div>
                </div>
              ))}
            </div>

            {/* Secondary info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
              {[
                { label: 'WILDCARD', value: result.wildcardMask, cls: 'text-term-mid' },
                { label: 'TOTAL IPs', value: result.totalIPs.toLocaleString('pt-BR'), cls: 'text-term-white' },
                { label: 'HOSTS ÚTEIS', value: result.usableHosts.toLocaleString('pt-BR'), cls: 'text-term-bright text-glow-sm' },
                { label: 'CLASSE', value: result.networkClass, cls: 'text-term-mid' },
                { label: 'SUB-REDES', value: result.numberOfSubnets.toLocaleString('pt-BR'), cls: 'text-term-cyan text-glow-cyan' },
              ].map(cell => (
                <div key={cell.label} className="term-result-cell">
                  <div className="text-term-muted text-[10px] tracking-widest uppercase mb-1">{cell.label}</div>
                  <div className={`font-mono text-sm font-semibold ${cell.cls}`}>{cell.value}</div>
                </div>
              ))}
            </div>

            {/* Binary display */}
            <div className="term-result-cell col-span-2 lg:col-span-4">
              <div className="text-term-muted text-[10px] tracking-widest uppercase mb-2">
                REPRESENTAÇÃO BINÁRIA
              </div>
              <BinaryDisplay
                ipBinary={result.ipBinary}
                maskBinary={result.maskBinary}
                cidr={result.cidr}
              />
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-term-border" />

            {/* Export + project actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <ExportBar results={[result]} />
                <button 
                  className="term-btn-cyan text-xs py-1"
                  onClick={handleShowPossible}
                  disabled={result.cidr >= 31}
                  title={result.cidr >= 31 ? "Não disponível para /31 ou /32" : "Mostrar possíveis sub-redes"}
                >
                  ☷ TODAS AS SUB-REDES
                </button>
              </div>
              {state.projects.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap bg-term-bg/50 p-1.5 rounded border border-term-border/50">
                  <span className="text-term-muted text-[10px] font-mono tracking-widest whitespace-nowrap">SALVAR EM:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {state.projects.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        className="term-btn-ghost text-xs px-2 py-0.5"
                        onClick={() => addToProject(p.id, result)}
                      >
                        ▹ {p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPossible && result && (
        <PossibleSubnetsModal
          subnets={possibleSubnets}
          baseIp={result.networkAddress}
          cidr={result.cidr}
          onClose={() => setShowPossible(false)}
        />
      )}
    </div>
  );
}
