import { useApp } from '../../context/AppContext';

export default function Header() {
  const { state, dispatch } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-term-darker border-b border-term-border">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative flex items-center justify-between px-4 md:px-6 h-14 max-w-[1400px] mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-term-bright text-glow font-mono font-bold text-lg tracking-widest">
              SUBNET
            </span>
            <span
              className="text-term-cyan text-glow-cyan font-mono font-bold text-lg tracking-widest"
              style={{ textShadow: '0 0 12px rgba(0,255,204,0.9)' }}
            >
              RAIN
            </span>
            <span className="cursor hidden sm:inline ml-1 text-term-bright opacity-80" />
          </div>
          <span className="term-badge term-badge-green text-[10px]">v1.0</span>
        </div>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <span className="text-term-muted text-xs font-mono">[ </span>
          <span className="text-term-mid text-xs font-mono tracking-widest">CALC DE SUB-REDES</span>
          <span className="text-term-muted text-xs font-mono"> ]</span>
        </nav>

        {/* Right stats + actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end leading-none gap-0.5">
            <span className="text-term-bright text-xs font-mono text-glow-sm">
              {String(state.history.length).padStart(3, '0')} logs
            </span>
            <span className="text-term-muted text-[10px] font-mono">
              {String(state.projects.length).padStart(3, '0')} proj
            </span>
          </div>

          {/* system status dot */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-term-bright animate-pulse-green"
              title="Sistema online"
            />
            <span className="text-term-muted text-[10px] font-mono hidden sm:inline">ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
