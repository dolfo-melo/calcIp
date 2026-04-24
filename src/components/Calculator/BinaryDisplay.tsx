import React from 'react';

interface Props {
  ipBinary: string;
  maskBinary: string;
  cidr: number;
}

export default function BinaryDisplay({ ipBinary, maskBinary, cidr }: Props) {
  function renderRow(binary: string, label: string, splitAt: number) {
    const groups = binary.split('.');
    return (
      <div className="flex items-baseline gap-0 flex-wrap font-mono text-xs leading-relaxed">
        <span className="text-term-muted text-[10px] tracking-widest uppercase mr-2 inline-block w-16 flex-shrink-0">
          {label}
        </span>
        <span className="bit-sep">[ </span>
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="bit-sep mx-0.5"> . </span>}
            {group.split('').map((bit, bi) => {
              const idx = gi * 8 + bi;
              return (
                <span key={bi} className={idx < splitAt ? 'bit-net' : 'bit-host'}>
                  {bit}
                </span>
              );
            })}
          </React.Fragment>
        ))}
        <span className="bit-sep"> ]</span>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-term-bright" style={{ boxShadow: '0 0 4px rgba(0,255,65,0.8)' }} />
          <span className="text-term-muted text-[10px] font-mono tracking-widest">REDE ({cidr} bits)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-term-cyan" style={{ boxShadow: '0 0 4px rgba(0,255,204,0.6)' }} />
          <span className="text-term-muted text-[10px] font-mono tracking-widest">HOST ({32 - cidr} bits)</span>
        </div>
      </div>

      {/* Binary rows */}
      <div
        className="bg-term-darker border border-term-border p-3 space-y-1 overflow-x-auto"
        style={{ background: 'linear-gradient(rgba(0,255,65,0.02) 1px, transparent 1px)', backgroundSize: '100% 20px' }}
      >
        {renderRow(ipBinary, 'IP', cidr)}
        {renderRow(maskBinary, 'MASK', cidr)}
      </div>
    </div>
  );
}
