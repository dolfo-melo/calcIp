import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VLSMRequirement, VLSMEntry, calculateVLSM } from '../../core/vlsm';
import { isValidIPv4, parseMaskInput } from '../../core/utils';
import { SubnetResult } from '../../core/subnet';
import { exportSubnetToCSV, exportVLSMToCSV, exportToJSON } from '../../export/csvExport';
import { exportSubnetToPDF, exportVLSMToPDF } from '../../export/pdfExport';
import { Project } from '../../db/indexeddb';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('pt-BR');
}

interface VLSMFormProps {
  projectId: string;
  onClose: () => void;
}

function VLSMForm({ projectId, onClose }: VLSMFormProps) {
  const { addVLSMToProject, state } = useApp();
  const [baseIP, setBaseIP] = useState('192.168.0.0');
  const [baseMask, setBaseMask] = useState('24');
  const [requirements, setRequirements] = useState<VLSMRequirement[]>([
    { id: crypto.randomUUID(), name: 'Sub-rede 1', hosts: 50 },
  ]);
  const [error, setError] = useState('');

  // Import from F3 VLSM results
  const hasF3Results = state.vlsmResults && state.vlsmResults.length > 0;

  function importFromF3() {
    if (!hasF3Results) return;
    const last = state.vlsmResults;
    addVLSMToProject(projectId, last);
    onClose();
  }

  function addReq() {
    setRequirements([...requirements, { id: crypto.randomUUID(), name: `Sub-rede ${requirements.length + 1}`, hosts: 10 }]);
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
    if (!valid.length) { setError('Adicione ao menos 1 sub-rede com hosts > 0'); return; }
    setError('');
    const res = calculateVLSM(baseIP.trim(), cidr, valid);
    if ('error' in res) { setError(res.error); return; }
    addVLSMToProject(projectId, res);
    onClose();
  }

  return (
    <div className="border border-term-amber/30 bg-term-amber/5 p-3 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-term-amber text-[10px] font-mono tracking-widest">■ VLSM :: NOVA ALOCAÇÃO</span>
        <button className="text-term-muted hover:text-term-red text-xs font-mono" onClick={onClose}>✕</button>
      </div>

      {/* Import from F3 */}
      {hasF3Results && (
        <button
          className="w-full term-btn-cyan text-[10px] py-1.5 tracking-widest"
          onClick={importFromF3}
        >
          ↑ IMPORTAR RESULTADO DA ABA F3 ({state.vlsmResults.length} redes)
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="term-label">&gt; rede base</label>
          <input type="text" className="term-input text-xs" value={baseIP}
            onChange={e => setBaseIP(e.target.value)} placeholder="192.168.0.0" />
        </div>
        <div>
          <label className="term-label">&gt; máscara/cidr</label>
          <input type="text" className="term-input text-xs" value={baseMask}
            onChange={e => setBaseMask(e.target.value)} placeholder="24" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="term-label mb-0">&gt; sub-redes</label>
          <button className="term-btn-ghost text-[10px] px-2 py-0.5 tracking-widest" onClick={addReq}>+ ADD</button>
        </div>
        <div className="space-y-1.5">
          {requirements.map((req, idx) => (
            <div key={req.id} className="grid grid-cols-[1fr_80px_28px] gap-1.5 items-center">
              <input type="text" className="term-input text-xs" value={req.name}
                onChange={e => updateReq(req.id, 'name', e.target.value)}
                placeholder={`Sub-rede ${idx + 1}`} />
              <input type="number" min={1} className="term-input text-xs no-spin" value={req.hosts}
                onChange={e => updateReq(req.id, 'hosts', parseInt(e.target.value) || 0)}
                title="hosts necessários" />
              <button className="term-btn-red text-[10px] px-1 py-1 flex items-center justify-center"
                onClick={() => removeReq(req.id)} disabled={requirements.length <= 1}>✕</button>
            </div>
          ))}
        </div>
        <p className="text-term-muted text-[10px] font-mono mt-1">(nome / hosts necessários)</p>
      </div>

      {error && (
        <div className="border border-term-red bg-term-red/5 p-2 text-term-red text-[10px] font-mono">
          ! ERRO: {error}
        </div>
      )}

      <button className="term-btn-amber w-full text-center text-xs tracking-widest" onClick={handleCalculate}>
        ▶ CALCULAR E SALVAR NO PROJETO
      </button>
    </div>
  );
}

interface VLSMResultViewProps {
  entries: VLSMEntry[];
  index: number;
  projectId: string;
}

function VLSMResultView({ entries, index, projectId }: VLSMResultViewProps) {
  const { removeVLSMFromProject } = useApp();
  const baseLabel = entries.length > 0 ? `${entries[0].networkAddress}` : '—';

  return (
    <div className="border border-term-border bg-term-darker/50 text-[10px] font-mono">
      <div className="flex items-center justify-between px-2 py-1 border-b border-term-border bg-term-darker">
        <span className="text-term-amber tracking-widest">■ VLSM :: {baseLabel}/{entries[0]?.cidr ?? '?'}</span>
        <button
          className="text-term-muted hover:text-term-red text-xs transition-all"
          onClick={() => removeVLSMFromProject(projectId, index)}
          title="remover alocação"
        >✕</button>
      </div>
      <div className="overflow-x-auto">
        <table className="term-table text-[10px]">
          <thead>
            <tr>
              {['NOME', 'REQ', 'REDE/CIDR', 'MÁSCARA', 'GATEWAY', '1° ÚTIL', 'ÚLT. HOST', 'BROADCAST'].map(h => (
                <th key={h} className="text-[9px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id ?? i}>
                <td className="text-term-white">{e.requirementName}</td>
                <td className="text-term-mid">{e.requiredHosts}</td>
                <td className="text-term-bright text-glow-sm">{e.networkAddress}/{e.cidr}</td>
                <td className="text-term-white">{e.subnetMask}</td>
                <td className="text-term-amber text-glow-amber font-semibold">{e.gateway}</td>
                <td className="text-term-cyan">{e.firstUsable ?? e.firstHost}</td>
                <td className="text-term-cyan">{e.lastHost}</td>
                <td className="text-term-amber">{e.broadcastAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProjectManager() {
  const { state, createProject, removeProject, dispatch } = useApp();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showingVLSMForm, setShowingVLSMForm] = useState<string | null>(null);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createProject(name, newDesc.trim());
    setNewName('');
    setNewDesc('');
    setCreating(false);
  }

  return (
    <div className="term-card">
      <div className="term-header">
        <div className="flex items-center gap-2">
          <span className="text-term-amber text-glow-amber">▣</span>
          <span>PROJETOS</span>
          <span className="term-badge term-badge-amber">{String(state.projects.length).padStart(3, '0')}</span>
        </div>
        <button
          id="new-project-btn"
          className={creating ? 'term-btn-red' : 'term-btn-amber'}
          onClick={() => setCreating(v => !v)}
        >
          {creating ? '✕ CANCEL' : '+ NOVO'}
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Create form */}
        {creating && (
          <div className="border border-term-amber/30 bg-term-amber/5 p-3 space-y-2 animate-fade-in">
            <div>
              <label className="term-label">&gt; nome</label>
              <input
                id="project-name-input"
                type="text"
                className="term-input text-xs"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="ex: Rede Matriz + Filiais"
                autoFocus
              />
            </div>
            <div>
              <label className="term-label">&gt; descrição</label>
              <input
                id="project-desc-input"
                type="text"
                className="term-input text-xs"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="opcional..."
              />
            </div>
            <button
              className="term-btn-amber w-full text-center"
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              ▶ CRIAR PROJETO
            </button>
          </div>
        )}

        {/* Project list */}
        {state.projects.length === 0 && !creating ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-term-muted text-2xl">▣</span>
            <p className="text-term-muted text-xs font-mono tracking-widest">SEM PROJETOS</p>
          </div>
        ) : (
          <div className="space-y-1">
            {state.projects.map(p => {
              const isActive = state.activeProject?.id === p.id;
              const isExpanded = expandedId === p.id;
              const vlsmCount = (p.vlsmResults ?? []).length;

              return (
                <div
                  key={p.id}
                  className={`border transition-all duration-150 ${
                    isActive
                      ? 'border-term-amber bg-term-amber/5'
                      : 'border-term-border hover:border-term-dim hover:bg-term-surface'
                  }`}
                >
                  {/* Project row */}
                  <div
                    className="flex items-start gap-2 p-2 cursor-pointer group"
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE_PROJECT', project: isActive ? null : p });
                      setExpandedId(isExpanded ? null : p.id);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-mono font-semibold ${isActive ? 'text-term-amber text-glow-amber' : 'text-term-white'}`}>
                        {isActive ? '▶ ' : '  '}{p.name}
                      </div>
                      {p.description && (
                        <div className="text-term-muted text-[10px] font-mono mt-0.5">{p.description}</div>
                      )}
                      <div className="text-term-muted text-[10px] font-mono mt-0.5">
                        {p.calculations.length} calc · {vlsmCount} vlsm · {formatDate(p.updatedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-term-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-term-muted hover:text-term-red text-xs font-mono transition-all"
                        onClick={e => { e.stopPropagation(); removeProject(p.id); }}
                        title="excluir"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Expanded: VLSM area */}
                  {isExpanded && (
                    <div className="border-t border-term-border px-2 pb-2 pt-2 space-y-2 animate-fade-in">

                      {/* VLSM results saved in project */}
                      {(p.vlsmResults ?? []).length > 0 && (
                        <div className="space-y-2">
                          {(p.vlsmResults ?? []).map((entries, idx) => (
                            <VLSMResultView key={idx} entries={entries} index={idx} projectId={p.id} />
                          ))}
                        </div>
                      )}

                      {/* VLSM form or add button */}
                      {showingVLSMForm === p.id ? (
                        <VLSMForm projectId={p.id} onClose={() => setShowingVLSMForm(null)} />
                      ) : (
                        <button
                          className="w-full term-btn-amber text-[10px] py-1.5 tracking-widest"
                          onClick={e => { e.stopPropagation(); setShowingVLSMForm(p.id); }}
                        >
                          + ADICIONAR VLSM AO PROJETO
                        </button>
                      )}

                      {/* ── Export project ── */}
                      <div className="border-t border-term-border/50 pt-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-term-muted text-[9px] font-mono tracking-widest w-full">EXPORTAR PROJETO:</span>
                          {p.calculations.length > 0 && (
                            <>
                              <button
                                className="term-btn-cyan text-[9px] px-2 py-0.5 tracking-widest"
                                title="Exportar cálculos IPv4 como CSV"
                                onClick={e => {
                                  e.stopPropagation();
                                  exportSubnetToCSV(
                                    p.calculations.filter((c): c is SubnetResult => 'subnetMask' in c),
                                    `${p.name.replace(/\s+/g, '_')}_ipv4.csv`
                                  );
                                }}
                              >
                                ↓ CSV IPv4
                              </button>
                              <button
                                className="term-btn-amber text-[9px] px-2 py-0.5 tracking-widest"
                                title="Exportar cálculos IPv4 como PDF"
                                onClick={e => {
                                  e.stopPropagation();
                                  exportSubnetToPDF(
                                    p.calculations.filter((c): c is SubnetResult => 'subnetMask' in c),
                                    `Projeto: ${p.name}`
                                  );
                                }}
                              >
                                ↓ PDF IPv4
                              </button>
                            </>
                          )}
                          {(p.vlsmResults ?? []).length > 0 && (
                            <>
                              <button
                                className="term-btn-cyan text-[9px] px-2 py-0.5 tracking-widest"
                                title="Exportar todas as alocações VLSM como CSV"
                                onClick={e => {
                                  e.stopPropagation();
                                  const all = (p.vlsmResults ?? []).flat();
                                  exportVLSMToCSV(all, `${p.name.replace(/\s+/g, '_')}_vlsm.csv`);
                                }}
                              >
                                ↓ CSV VLSM
                              </button>
                              <button
                                className="term-btn-amber text-[9px] px-2 py-0.5 tracking-widest"
                                title="Exportar todas as alocações VLSM como PDF"
                                onClick={e => {
                                  e.stopPropagation();
                                  const all = (p.vlsmResults ?? []).flat();
                                  exportVLSMToPDF(all, p.name);
                                }}
                              >
                                ↓ PDF VLSM
                              </button>
                            </>
                          )}
                          <button
                            className="term-btn-ghost text-[9px] px-2 py-0.5 tracking-widest"
                            title="Exportar projeto completo como JSON"
                            onClick={e => {
                              e.stopPropagation();
                              exportToJSON(p as unknown as Project, `${p.name.replace(/\s+/g, '_')}_projeto.json`);
                            }}
                          >
                            ↓ JSON
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
