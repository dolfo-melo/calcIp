import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import MatrixRain from './MatrixRain';
import Home from '../../pages/Home';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const FEATURES = [
  {
    icon: '▢',
    tag: 'IPv4',
    colorClass: 'text-term-bright',
    glowClass: 'text-glow',
    borderStyle: '1px solid rgba(0,255,65,0.4)',
    headerBg: 'rgba(0,255,65,0.06)',
    badge: 'term-badge-green',
    title: 'Calculadora IPv4',
    desc: 'Calcule endereços de rede, broadcast, máscara e wildcard com representação binária completa em tempo real.',
    terminal: [
      { prompt: '>', text: 'INPUT', val: '192.168.1.0 /24' },
      { prompt: '#', text: 'NETWORK', val: '192.168.1.0', color: '#00ff41' },
      { prompt: '#', text: 'BROADCAST', val: '192.168.1.255', color: '#ffb300' },
      { prompt: '#', text: 'HOSTS', val: '254 utilizáveis', color: '#00ffcc' },
      { prompt: '#', text: 'MASK', val: '255.255.255.0', color: '#aaa' },
    ],
    items: [
      { icon: '◈', text: 'Suporte a CIDR e máscara decimal' },
      { icon: '◈', text: 'Representação binária bit a bit' },
      { icon: '◈', text: 'Exportação CSV · PDF · JSON' },
      { icon: '◈', text: 'Salvo no histórico local (IndexedDB)' },
    ],
  },
  {
    icon: '▣',
    tag: 'IPv6',
    colorClass: 'text-term-cyan',
    glowClass: 'text-glow-cyan',
    borderStyle: '1px solid rgba(0,255,204,0.4)',
    headerBg: 'rgba(0,255,204,0.06)',
    badge: 'term-badge-cyan',
    title: 'Suporte IPv6',
    desc: 'Análise completa de endereços IPv6: compressão, expansão, tipo de endereço e prefixo de rede calculado.',
    terminal: [
      { prompt: '>', text: 'INPUT', val: '2001:db8::1/64' },
      { prompt: '#', text: 'EXPANDED', val: '2001:0db8::0001', color: '#00ffcc' },
      { prompt: '#', text: 'NETWORK', val: '2001:db8::/64', color: '#00ff41' },
      { prompt: '#', text: 'TYPE', val: 'Global Unicast', color: '#ffb300' },
      { prompt: '#', text: 'PREFIX', val: '/64', color: '#aaa' },
    ],
    items: [
      { icon: '◈', text: 'Compressão e expansão automática' },
      { icon: '◈', text: 'Identificação de tipo de endereço' },
      { icon: '◈', text: 'Cálculo de prefixo de rede' },
      { icon: '◈', text: 'Exportação de resultados completos' },
    ],
  },
  {
    icon: '▤',
    tag: 'VLSM',
    colorClass: 'text-term-amber',
    glowClass: 'text-glow-amber',
    borderStyle: '1px solid rgba(255,179,0,0.4)',
    headerBg: 'rgba(255,179,0,0.06)',
    badge: 'term-badge-amber',
    title: 'VLSM Planner',
    desc: 'Divida uma rede base em sub-redes de tamanhos variados de forma otimizada, alocando do maior para o menor.',
    terminal: [
      { prompt: '>', text: 'BASE', val: '10.0.0.0 /24' },
      { prompt: '#', text: 'ESCRITÓRIO', val: '10.0.0.0/25  · 126h', color: '#ffb300' },
      { prompt: '#', text: 'SERVIDORES', val: '10.0.0.128/28 · 14h', color: '#ffb300' },
      { prompt: '#', text: 'CÂMERAS', val: '10.0.0.144/29 · 6h', color: '#ffb300' },
      { prompt: '#', text: 'TOTAL', val: '3 sub-redes alocadas', color: '#00ff41' },
    ],
    items: [
      { icon: '◈', text: 'Algoritmo de alocação eficiente' },
      { icon: '◈', text: 'Múltiplos segmentos simultâneos' },
      { icon: '◈', text: 'Tabela completa com todos os campos' },
      { icon: '◈', text: 'Exportação CSV · PDF · JSON' },
    ],
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const bootLineRef = useRef<HTMLDivElement>(null);

  // Scroll suave até o app
  function scrollToApp() {
    gsap.to(window, {
      duration: 1.2,
      scrollTo: { y: '#app-section', offsetY: 0 },
      ease: 'power3.inOut',
    });
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero entrance timeline ──────────────────────────────────────────────
      const heroTl = gsap.timeline({ delay: 0.3 });

      heroTl
        .from(titleRef.current, {
          opacity: 0,
          y: -30,
          duration: 1,
          ease: 'power3.out',
        })
        .from(
          '.hero-char',
          {
            opacity: 0,
            stagger: 0.04,
            duration: 0.1,
            ease: 'none',
          },
          '-=0.5'
        )
        .from(
          subtitleRef.current,
          { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' },
          '-=0.2'
        )
        .from(
          '.hero-badge',
          { opacity: 0, x: -15, stagger: 0.12, duration: 0.5, ease: 'power2.out' },
          '-=0.4'
        )
        .from(
          ctaRef.current,
          { opacity: 0, scale: 0.92, duration: 0.6, ease: 'back.out(1.5)' },
          '-=0.2'
        )
        .from(
          scrollIndicatorRef.current,
          { opacity: 0, y: 10, duration: 0.6, ease: 'power2.out' },
          '-=0.1'
        );

      // Pulsação contínua no indicador de scroll
      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut',
        delay: 2,
      });

      // ── Feature cards ScrollTrigger ─────────────────────────────────────────
      // immediateRender:false prevents cards from being invisible before trigger fires
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 70,
        opacity: 0,
        stagger: 0.2,
        duration: 0.9,
        ease: 'power3.out',
        immediateRender: false,
      });

      gsap.from('.feature-terminal-line', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 65%',
        },
        x: -10,
        opacity: 0,
        stagger: 0.04,
        duration: 0.3,
        ease: 'power2.out',
        immediateRender: false,
      });

      gsap.from('.feature-item', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 60%',
        },
        x: -15,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power2.out',
        immediateRender: false,
      });

      // ── Features section title ───────────────────────────────────────────────
      gsap.from('.features-title', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 85%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      // ── App section entrance ────────────────────────────────────────────────
      gsap.from(bootLineRef.current, {
        scrollTrigger: {
          trigger: appRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: -10,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('#app-inner', {
        scrollTrigger: {
          trigger: appRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative">
      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Matrix Rain canvas — fixed, full viewport */}
        <MatrixRain
          opacity={0.7}
          speed={1.2}
          fontSize={14}
          className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Scanlines */}
        <div className="fixed inset-0 scanlines pointer-events-none z-0 opacity-40" />

        {/* Dark gradient vignette so text is readable */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          {/* Top tag */}
          <div className="mb-6 flex justify-center">
            <span className="term-badge term-badge-green text-xs tracking-[0.3em]">
              ◉ SISTEMA ONLINE — v1.0.0-MVP
            </span>
          </div>

          {/* Main title */}
          <h1
            ref={titleRef}
            className="font-mono font-bold tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: 1.1 }}
          >
            {'SUBNET RAIN'.split('').map((ch, i) => (
              <span
                key={i}
                className={`hero-char inline-block ${ch === ' ' ? 'mr-4' : ''}`}
                style={{
                  color: ch === ' ' ? 'transparent' : '#00ff41',
                  textShadow: ch !== ' ' ? '0 0 20px rgba(0,255,65,0.9), 0 0 40px rgba(0,255,65,0.4)' : 'none',
                }}
              >
                {ch}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-term-muted font-mono text-sm sm:text-base tracking-widest mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Calculadora profissional de sub-redes IPv4, IPv6 e VLSM.<br />
            <span className="text-term-mid">Rápido. Preciso. Sem servidor.</span>
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { label: 'IPv4', cls: 'term-badge-green' },
              { label: 'IPv6', cls: 'term-badge-cyan' },
              { label: 'VLSM', cls: 'term-badge-amber' },
              { label: 'CSV/PDF/JSON', cls: 'term-badge-dim' },
              { label: 'IndexedDB', cls: 'term-badge-dim' },
            ].map(b => (
              <span key={b.label} className={`hero-badge term-badge ${b.cls} text-xs tracking-widest`}>
                {b.label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-enter-btn"
              className="term-btn text-base px-8 py-3 tracking-[0.2em]"
              onClick={scrollToApp}
            >
              ▶ ENTRAR NO SISTEMA
            </button>
            <button
              id="hero-features-btn"
              className="term-btn-ghost text-sm px-6 py-3 tracking-widest"
              onClick={() =>
                gsap.to(window, {
                  duration: 0.8,
                  scrollTo: { y: '#features-section', offsetY: 40 },
                  ease: 'power2.inOut',
                })
              }
            >
              ↓ VER RECURSOS
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() =>
            gsap.to(window, {
              duration: 0.8,
              scrollTo: { y: '#features-section', offsetY: 40 },
              ease: 'power2.inOut',
            })
          }
        >
          <span className="text-term-muted text-[10px] font-mono tracking-[0.3em]">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-term-bright to-transparent opacity-60" />
          <span className="text-term-bright text-xs">↓</span>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-6 left-6 z-20 font-mono text-term-dim text-[10px] tracking-widest opacity-60 hidden md:block">
          [SUBNETRAIN::TERMINAL]
        </div>
        <div className="absolute top-6 right-6 z-20 font-mono text-term-dim text-[10px] tracking-widest opacity-60 hidden md:block">
          {new Date().toLocaleDateString('pt-BR')} BRT
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────────────── */}
      <section
        id="features-section"
        ref={featuresRef}
        className="relative py-24 px-4"
        style={{ background: 'rgba(0,0,0,0.88)' }}
      >
        {/* Subtle Matrix behind features */}
        <MatrixRain
          opacity={0.08}
          speed={0.6}
          fontSize={16}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section header */}
          <div className="features-title text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-12 bg-term-bright opacity-40" />
              <span className="text-term-muted font-mono text-xs tracking-[0.4em]">MÓDULOS DO SISTEMA</span>
              <div className="h-px w-12 bg-term-bright opacity-40" />
            </div>
            <h2 className="font-mono font-bold text-3xl sm:text-4xl text-term-bright text-glow mb-3">
              FUNCIONALIDADES
            </h2>
            <p className="text-term-muted font-mono text-sm tracking-widest">
              Três módulos especializados. Uma interface unificada.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {FEATURES.map((f) => (
              <div
                key={f.tag}
                className="feature-card term-card p-0 cursor-pointer group flex flex-col"
                onClick={scrollToApp}
                style={{ border: f.borderStyle }}
              >
                {/* Card header */}
                <div
                  className="term-header"
                  style={{ background: f.headerBg, borderBottom: f.borderStyle }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`${f.colorClass} ${f.glowClass} text-lg`}>{f.icon}</span>
                    <span className={`${f.colorClass} ${f.glowClass} text-xs tracking-widest`}>{f.title}</span>
                  </div>
                  <span className={`term-badge ${f.badge} text-[10px]`}>{f.tag}</span>
                </div>

                {/* Description */}
                <div className="px-5 pt-4 pb-2">
                  <p className="text-term-mid font-mono text-xs leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                {/* Terminal output mockup */}
                <div
                  className="mx-5 mb-4 p-3 font-mono text-[11px] space-y-1.5"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {f.terminal.map((line, i) => (
                    <div key={i} className="feature-terminal-line flex gap-2 leading-snug">
                      <span className="text-term-dim flex-shrink-0">{line.prompt}</span>
                      <span className="text-term-muted flex-shrink-0">{line.text}</span>
                      <span
                        className="font-semibold truncate"
                        style={{ color: line.color ?? '#888' }}
                      >
                        {line.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="mx-5 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                {/* Feature list */}
                <ul className="px-5 pb-4 space-y-2 flex-1">
                  {f.items.map((item) => (
                    <li
                      key={item.text}
                      className="feature-item flex items-start gap-2 text-[11px] font-mono text-term-muted"
                    >
                      <span className={`${f.colorClass} text-[10px] flex-shrink-0 mt-0.5`}>{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>

                {/* CTA footer */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop: f.borderStyle, background: f.headerBg }}
                >
                  <span className="text-term-muted font-mono text-[10px] tracking-widest">
                    CLIQUE PARA USAR
                  </span>
                  <span className={`${f.colorClass} ${f.glowClass} font-mono text-xs group-hover:translate-x-1 transition-transform duration-200`}>
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-term-border">
            {[
              { val: 'IPv4', sub: 'Protocolo' },
              { val: 'IPv6', sub: 'Próxima Geração' },
              { val: 'VLSM', sub: 'Otimizado' },
              { val: '100%', sub: 'Client-Side' },
            ].map((s) => (
              <div
                key={s.val}
                className="bg-term-darker text-center py-6 px-4"
              >
                <div className="text-term-bright font-mono text-2xl font-bold text-glow">{s.val}</div>
                <div className="text-term-muted font-mono text-[10px] tracking-widest mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP SECTION ─────────────────────────────────────────────── */}
      <section
        id="app-section"
        ref={appRef}
        className="relative min-h-screen"
        style={{ background: 'rgba(0,0,0,0.95)' }}
      >
        {/* Subtle matrix behind app */}
        <MatrixRain
          opacity={0.04}
          speed={0.5}
          fontSize={16}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

        {/* Boot banner */}
        <div ref={bootLineRef} className="relative z-10 border-b border-term-border bg-term-darker px-6 py-3">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-term-bright animate-pulse inline-block" />
              <span className="font-mono text-xs text-term-bright tracking-widest text-glow">
                SISTEMA INICIADO — SUBNETRAIN TERMINAL v1.0
              </span>
            </div>
            <button
              id="back-to-top-btn"
              className="term-btn-ghost text-[10px] px-3 py-1 tracking-widest"
              onClick={() =>
                gsap.to(window, {
                  duration: 1,
                  scrollTo: { y: 0 },
                  ease: 'power3.inOut',
                })
              }
            >
              ↑ VOLTAR AO TOPO
            </button>
          </div>
        </div>

        {/* Main app */}
        <div id="app-inner" className="relative z-10">
          <Home />
        </div>
      </section>
    </div>
  );
}
