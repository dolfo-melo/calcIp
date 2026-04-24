import { useState } from 'react';
import { calculateIPv6, IPv6Result, formatAddressCount } from '../../core/ipv6';
import { isValidIPv6, isValidCIDR6 } from '../../core/utils';
import { useApp } from '../../context/AppContext';
import IPv6LearnPanel from './IPv6LearnPanel';
import { exportToJSON } from '../../export/csvExport';

const PRESETS = [
  { label: 'LINK-LOCAL',    value: 'fe80::1',    prefix: '64'  },
  { label: 'LOOPBACK',      value: '::1',         prefix: '128' },
  { label: 'DOC (RFC3849)', value: '2001:db8::1', prefix: '32'  },
  { label: 'MULTICAST',     value: 'ff02::1',     prefix: '128' },
];

export default function CalculatorIPv6() {
  const { addResult } = useApp();
  const [address, setAddress] = useState('2001:db8::1');
  const [prefix, setPrefix] = useState('64');
  const [addrError, setAddrError] = useState('');
  const [prefixError, setPrefixError] = useState('');
  const [result, setResult] = useState<IPv6Result | null>(null);
  const [showLearn, setShowLearn] = useState(false);

  function validate() {
    let valid = true;
    if (!isValidIPv6(address.trim())) { setAddrError('endereço inválido'); valid = false; }
    else setAddrError('');
    const p = parseInt(prefix);
    if (!isValidCIDR6(p)) { setPrefixError('prefixo inválido (0–128)'); valid = false; }
    else setPrefixError('');
    if (!valid) return null;
    return { address: address.trim(), prefix: p };
  }

  function handleCalculate() {
    const parsed = validate();
    if (!parsed) return;
    const res = calculateIPv6(parsed.address, parsed.prefix);
    setResult(res);
    addResult(res);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCalculate();
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Input card */}
      <div className="term-card">
        <div className="term-header">
          <div className="flex items-center gap-2">
            <span className="text-term-cyan text-glow-cyan">■</span>
            <span>IPv6 :: CALCULADORA</span>
          </div>
          <button
            id="toggle-learn-btn"
            className={showLearn ? 'term-btn-cyan' : 'term-btn-ghost text-xs px-3 py-1 tracking-widest uppercase'}
            onClick={() => setShowLearn(v => !v)}
          >
            {showLearn ? '✕ FECHAR' : '? APRENDER IPv6'}
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
            {/* Address */}
            <div>
              <label className="term-label" htmlFor="ipv6-input">&gt; endereço IPv6</label>
              <input
                id="ipv6-input"
                type="text"
                className={`term-input${addrError ? ' error' : ''}`}
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="2001:db8::1"
                spellCheck={false}
                autoComplete="off"
              />
              {addrError
                ? <p className="text-term-red text-xs mt-1 font-mono">! {addrError}</p>
                : <p className="text-term-muted text-xs mt-1 font-mono">aceita :: compressed</p>
              }
            </div>
            {/* Prefix */}
            <div>
              <label className="term-label" htmlFor="prefix-input">&gt; prefixo</label>
              <input
                id="prefix-input"
                type="number"
                min={0}
                max={128}
                className={`term-input no-spin${prefixError ? ' error' : ''}`}
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="64"
              />
              {prefixError
                ? <p className="text-term-red text-xs mt-1 font-mono">! {prefixError}</p>
                : <p className="text-term-muted text-xs mt-1 font-mono">0 – 128</p>
              }
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-term-muted text-[10px] font-mono tracking-widest self-center">PRESETS:</span>
            {PRESETS.map(p => (
              <button
                key={p.label}
                className="term-btn-ghost text-[10px] px-2 py-1 tracking-widest"
                onClick={() => { setAddress(p.value); setPrefix(p.prefix); setAddrError(''); setPrefixError(''); }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button id="calc-ipv6-btn" className="term-btn" onClick={handleCalculate}>
            ▶ calcular
          </button>
        </div>
      </div>

      {/* Learn Panel */}
      {showLearn && (
        <div className="animate-slide-up">
          <IPv6LearnPanel />
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="term-card animate-slide-up">
          <div className="term-header">
            <div className="flex items-center gap-2">
              <span className="text-term-cyan text-glow-cyan">◆</span>
              <span>RESULTADO IPv6</span>
            </div>
            <span
              className="term-badge term-badge-cyan text-[9px] max-w-[180px] truncate"
              title={result.addressType}
            >
              {result.addressType}
            </span>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'COMPRIMIDO',    value: result.compressedAddress, cls: 'text-term-bright text-glow text-sm' },
                { label: 'EXPANDIDO',     value: result.expandedAddress,   cls: 'text-term-white text-xs' },
                { label: 'REDE (COMP.)',  value: `${result.networkCompressed}/${result.prefix}`, cls: 'text-term-cyan text-glow-cyan text-sm' },
                { label: 'REDE (FULL)',   value: result.networkAddress,    cls: 'text-term-white text-xs' },
                { label: 'TOTAL ENDEREÇOS', value: formatAddressCount(result.totalAddresses), cls: 'text-term-bright text-glow-sm text-sm' },
                { label: 'TIPO',          value: result.addressType,       cls: 'text-term-mid text-xs' },
              ].map(cell => (
                <div key={cell.label} className="term-result-cell">
                  <div className="text-term-muted text-[10px] tracking-widest uppercase mb-1">{cell.label}</div>
                  <div className={`font-mono font-semibold break-all ${cell.cls}`}>{cell.value}</div>
                </div>
              ))}

              {/* Binary row — full width */}
              <div className="term-result-cell col-span-1 sm:col-span-2">
                <div className="text-term-muted text-[10px] tracking-widest uppercase mb-2">BINÁRIO (grupos de 16 bits)</div>
                <div className="bg-term-darker border border-term-border p-2 overflow-x-auto">
                  <code className="text-term-bright text-[10px] font-mono leading-relaxed text-glow-sm whitespace-nowrap">
                    {result.binaryRepresentation}
                  </code>
                </div>
              </div>
            </div>

            <div className="border-t border-term-border pt-3">
              <div className="flex items-center gap-2">
                <span className="text-term-muted text-[10px] font-mono tracking-widest">EXPORTAR:</span>
                <button
                  className="term-btn-ghost text-xs px-3 py-1 tracking-widest"
                  onClick={() => exportToJSON(result, `ipv6_${result.compressedAddress.replace(/:/g, '_')}`)}
                >
                  ↓ JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
