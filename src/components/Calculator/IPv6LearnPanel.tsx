import { useState } from 'react';

interface LearnSection {
  id: string;
  label: string;
  content: React.ReactNode;
}

const sections: LearnSection[] = [
  {
    id: 'why',
    label: '01 // POR QUE IPv6 EXISTE?',
    content: (
      <div className="space-y-2 text-xs text-term-white leading-relaxed font-mono">
        <p>IPv4 suporta apenas <span className="text-term-bright text-glow-sm">~4,3 bilhões</span> de endereços (2³²).</p>
        <p>Com smartphones, IoT e expansão da internet, esses endereços <span className="text-term-amber">esgotaram</span> entre 2011–2019.</p>
        <p>IPv6 usa 128 bits → <span className="text-term-bright text-glow-sm">340 undecilhões</span> de endereços (2¹²⁸).</p>
        <div className="bg-term-darker border border-term-border p-2 mt-2">
          <code className="text-term-cyan text-[10px]">
            IPv4: 2^32  =   4.294.967.296 endereços<br />
            IPv6: 2^128 = 340.282...×10^36 endereços
          </code>
        </div>
      </div>
    ),
  },
  {
    id: 'structure',
    label: '02 // ESTRUTURA DO ENDEREÇO',
    content: (
      <div className="space-y-2 text-xs font-mono">
        <p className="text-term-white leading-relaxed">128 bits divididos em <span className="text-term-bright font-semibold">8 grupos de 16 bits</span> em hexadecimal, separados por ':':</p>
        <div className="bg-term-darker border border-term-border p-2">
          <code className="text-term-bright text-[10px] text-glow-sm">
            2001:0db8:0000:0000:0000:0000:0000:0001
          </code>
        </div>
        <p className="text-term-mid text-[10px] tracking-wider uppercase">Regras de compressão:</p>
        <ul className="space-y-1 text-term-white">
          <li className="flex gap-2"><span className="text-term-bright">▸</span>Zeros à esquerda omitidos: <code className="text-term-cyan">0db8</code> → <code className="text-term-cyan">db8</code></li>
          <li className="flex gap-2"><span className="text-term-bright">▸</span>Sequência de zeros: substituída por <code className="text-term-cyan">::</code> (apenas uma vez)</li>
        </ul>
        <div className="bg-term-darker border border-term-border p-2">
          <code className="text-term-muted text-[10px]">2001:0db8:0000:0000:0000:0000:0000:0001</code><br />
          <code className="text-term-muted text-[10px]">→ <span className="text-term-bright">2001:db8::1</span></code>
        </div>
      </div>
    ),
  },
  {
    id: 'types',
    label: '03 // TIPOS DE ENDEREÇO',
    content: (
      <ul className="space-y-2 text-xs font-mono">
        {[
          { prefix: '2000::/3',    type: 'Global Unicast',  desc: 'IP público — roteável na internet', color: 'text-term-bright' },
          { prefix: 'fe80::/10',   type: 'Link-Local',      desc: 'Apenas na LAN local. Não roteável.', color: 'text-term-cyan' },
          { prefix: 'fc00::/7',    type: 'Unique Local',    desc: 'IP privado (como 192.168.x.x IPv4)', color: 'text-term-mid' },
          { prefix: 'ff00::/8',    type: 'Multicast',       desc: 'Substitui broadcast do IPv4', color: 'text-term-amber' },
          { prefix: '::1/128',     type: 'Loopback',        desc: 'Equivalente ao 127.0.0.1', color: 'text-term-white' },
          { prefix: '::/128',      type: 'Não especificado', desc: 'Equivalente ao 0.0.0.0',   color: 'text-term-muted' },
        ].map(t => (
          <li key={t.prefix} className="flex gap-2">
            <code className={`text-[10px] w-28 flex-shrink-0 ${t.color}`}>{t.prefix}</code>
            <div>
              <span className={`font-semibold ${t.color}`}>{t.type}</span>
              <span className="text-term-muted"> — {t.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'nobc',
    label: '04 // SEM BROADCAST',
    content: (
      <div className="space-y-2 text-xs font-mono text-term-white leading-relaxed">
        <p><span className="text-term-amber">IPv6 não tem broadcast.</span> Em vez disso usa:</p>
        <ul className="space-y-1">
          <li className="flex gap-2"><span className="text-term-bright">▸</span><span><code className="text-term-cyan">Multicast</code> — envia para grupo de interessados (ex: <code>ff02::2</code> = todos roteadores)</span></li>
          <li className="flex gap-2"><span className="text-term-bright">▸</span><span><code className="text-term-cyan">Anycast</code> — envia para o nó mais próximo</span></li>
          <li className="flex gap-2"><span className="text-term-bright">▸</span><span><code className="text-term-cyan">NDP</code> — Neighbor Discovery Protocol (substitui ARP)</span></li>
        </ul>
      </div>
    ),
  },
  {
    id: 'slaac',
    label: '05 // AUTOCONFIGURAÇÃO (SLAAC)',
    content: (
      <div className="space-y-2 text-xs font-mono">
        <p className="text-term-white leading-relaxed">
          <span className="text-term-bright">SLAAC</span> — Stateless Address Autoconfiguration: dispositivo configura
          seu próprio IP <span className="text-term-bright">sem DHCP.</span>
        </p>
        <ul className="space-y-1 text-term-white">
          <li className="flex gap-2"><span className="text-term-bright">1.</span>Roteador anuncia prefixo via RA (Router Advertisement)</li>
          <li className="flex gap-2"><span className="text-term-bright">2.</span>Dispositivo gera os 64 bits de host automaticamente</li>
          <li className="flex gap-2"><span className="text-term-bright">3.</span>Pode usar MAC (EUI-64) ou ID aleatório (privacidade)</li>
        </ul>
        <div className="bg-term-darker border border-term-border p-2 mt-1">
          <code className="text-[10px] text-term-muted">
            EUI-64: MAC 00:1A:2B:3C:4D:5E<br />
            → <span className="text-term-cyan">021A:2BFF:FE3C:4D5E</span>
          </code>
        </div>
      </div>
    ),
  },
  {
    id: 'prefixes',
    label: '06 // PREFIXOS COMUNS',
    content: (
      <ul className="space-y-2 text-xs font-mono">
        {[
          { p: '/128', desc: 'Host único' },
          { p: '/64',  desc: 'Sub-rede LAN padrão (recomendado)' },
          { p: '/48',  desc: 'Site / empresa completa' },
          { p: '/32',  desc: 'Bloco para ISP' },
          { p: '/3',   desc: 'Bloco global unicast (2000::/3)' },
        ].map(row => (
          <li key={row.p} className="flex items-center gap-3">
            <code className="text-term-bright text-glow-sm w-8">{row.p}</code>
            <span className="text-term-white">{row.desc}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'glossary',
    label: '07 // GLOSSÁRIO',
    content: (
      <ul className="space-y-2 text-xs font-mono">
        {[
          { t: 'NDP',    d: 'Neighbor Discovery Protocol — substitui ARP' },
          { t: 'SLAAC',  d: 'Stateless Address Autoconfiguration' },
          { t: 'EUI-64', d: 'Interface ID derivado do endereço MAC' },
          { t: 'DHCPv6', d: 'DHCP para IPv6 (stateful ou stateless)' },
          { t: 'RA',     d: 'Router Advertisement — roteador anuncia prefixo' },
          { t: 'DAD',    d: 'Duplicate Address Detection — evita conflitos' },
          { t: 'Tunnel', d: 'Encapsula IPv6 em IPv4 durante transição (6to4, ISATAP)' },
        ].map(g => (
          <li key={g.t} className="flex gap-2">
            <code className="text-term-bright w-16 flex-shrink-0">{g.t}</code>
            <span className="text-term-white">{g.d}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

export default function IPv6LearnPanel() {
  const [open, setOpen] = useState<string | null>('why');

  return (
    <div className="term-card">
      <div className="term-header">
        <div className="flex items-center gap-2">
          <span className="text-term-amber text-glow-amber">?</span>
          <span className="text-term-amber">MODO EDUCATIVO :: IPv6</span>
        </div>
        <span className="term-badge term-badge-amber">GUIDE</span>
      </div>

      <div className="divide-y divide-term-border">
        {sections.map(section => (
          <div key={section.id}>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-term-surface transition-colors duration-150"
              onClick={() => setOpen(open === section.id ? null : section.id)}
            >
              <span className={`font-mono text-xs tracking-widest ${open === section.id ? 'text-term-bright text-glow-sm' : 'text-term-mid'}`}>
                {section.label}
              </span>
              <span className={`text-term-muted text-xs font-mono transition-transform duration-200 ${open === section.id ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>

            {open === section.id && (
              <div className="px-4 pb-4 pt-1 animate-fade-in">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
