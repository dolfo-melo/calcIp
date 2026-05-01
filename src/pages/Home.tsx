import { useApp } from '../context/AppContext';
import Header from '../components/Layout/Header';
import CalculatorIPv4 from '../components/Calculator/CalculatorIPv4';
import CalculatorIPv6 from '../components/Calculator/CalculatorIPv6';
import CalculatorVLSM from '../components/Calculator/CalculatorVLSM';
import HistoryPanel from '../components/History/HistoryPanel';
import ProjectManager from '../components/Projects/ProjectManager';

const TABS = [
  { id: 'ipv4' as const, label: 'F1::IPv4',  icon: '▢' },
  { id: 'ipv6' as const, label: 'F2::IPv6',  icon: '▣' },
  { id: 'vlsm' as const, label: 'F3::VLSM',  icon: '▤' },
];

export default function Home() {
  const { state, dispatch } = useApp();
  const { activeTab } = state;

  return (
    <>
      <Header />

      {/* Terminal grid background */}
      <div className="fixed inset-0 bg-grid-green bg-grid opacity-100 pointer-events-none z-0" />
      <div className="fixed inset-0 scanlines pointer-events-none z-0 opacity-60" />

      <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-5">
        {/* Tab bar */}
        <div className="flex border-b border-term-border mb-5" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`term-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id.toUpperCase()}</span>
            </button>
          ))}

          {/* Spacer + clock */}
          <div className="flex-1 flex justify-end items-center pr-1">
            <span className="text-term-muted text-[10px] font-mono hidden md:inline">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} BRT
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-5">

          {/* Main calculator area */}
          <div>
            {activeTab === 'ipv4' && <CalculatorIPv4 />}
            {activeTab === 'ipv6' && <CalculatorIPv6 />}
            {activeTab === 'vlsm' && <CalculatorVLSM />}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <ProjectManager />
            <HistoryPanel />

            {/* System info box */}
            <div className="term-card">
              <div className="term-header">
                <span>SYS :: INFO</span>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { k: 'VERSION', v: '1.0.0-mvp' },
                  { k: 'STORAGE', v: 'IndexedDB' },
                  { k: 'PROTO',   v: 'IPv4 + IPv6' },
                  { k: 'EXPORT',  v: 'CSV/PDF/JSON' },
                  { k: 'STATUS',  v: 'ONLINE' },
                ].map(row => (
                  <div key={row.k} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-term-muted tracking-widest">{row.k}</span>
                    <span className={`text-term-white ${row.k === 'STATUS' ? 'text-term-bright text-glow-sm' : ''}`}>
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-term-border mt-8 px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-2">
          <span className="text-term-muted text-[10px] font-mono tracking-widest">
            SUBNETRAIN v1.0 :: CALCULADORA DE SUB-REDES
          </span>
          <span className="text-term-muted text-[10px] font-mono">
            Desenvolvido por: <a href="https://dolfo-melo.com.br">Rodolfo Melo</a>
          </span>
          <span className="text-term-muted text-[10px] font-mono">
            HISTÓRICO LOCAL · SEM SERVIDOR · MVP
          </span>
        </div>
      </footer>
    </>
  );
}
