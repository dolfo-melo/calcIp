import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ProjectManager() {
  const { state, createProject, removeProject, dispatch } = useApp();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createProject(name, newDesc.trim());
    setNewName('');
    setNewDesc('');
    setCreating(false);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('pt-BR');
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
            {state.projects.map(p => (
              <div
                key={p.id}
                className={`flex items-start gap-2 p-2 border cursor-pointer transition-all duration-150 group
                  ${state.activeProject?.id === p.id
                    ? 'border-term-amber bg-term-amber/5'
                    : 'border-term-border hover:border-term-dim hover:bg-term-surface'
                  }`}
                onClick={() =>
                  dispatch({ type: 'SET_ACTIVE_PROJECT', project: state.activeProject?.id === p.id ? null : p })
                }
              >
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-mono font-semibold ${state.activeProject?.id === p.id ? 'text-term-amber text-glow-amber' : 'text-term-white'}`}>
                    {state.activeProject?.id === p.id ? '▶ ' : '  '}{p.name}
                  </div>
                  {p.description && (
                    <div className="text-term-muted text-[10px] font-mono mt-0.5">{p.description}</div>
                  )}
                  <div className="text-term-muted text-[10px] font-mono mt-0.5">
                    {p.calculations.length} calc · {formatDate(p.updatedAt)}
                  </div>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 text-term-muted hover:text-term-red text-xs font-mono transition-all flex-shrink-0"
                  onClick={e => { e.stopPropagation(); removeProject(p.id); }}
                  title="excluir"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
